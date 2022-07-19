"use strict";

const user = require("../models/user");
const gameRequestModel = require("../models/gameRequest");
const error_string = require("../error_string").ErrorString;
var ObjectId = require('mongodb').ObjectId;
const utils = require("../utils");
const reportModel = require("../models/report");
const socket = require('./socket').getSockets();

const createGameRequest = async (req: any, res: any, next: any) => {
    const jwt_user = req.user;
    const receiverId = req.params.id_receiver;
    const playerId = req.user.id;

    const grModel = await gameRequestModel.newModel(
        jwt_user.id,
        receiverId
    );

    grModel.save()
        .then((data: any) => {
        try {
            const idOtherPlayer = receiverId;
            const s = socket.getSocket(idOtherPlayer);
            if(s) {
                s.emit('reload_requests');
                s.emit('new_game_request', jwt_user.nickname);
            }

            return res.status(200).json({
                error: false,
                message: "",
            });
        } catch (e) {
            return next(utils.createError(500, "Errore impreviso"));
        }
    })
    .catch((reason: any) => {
        console.log(reason);
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });
}

const getRequests = async (req: any, res: any, next: any) => {
    const jwt_user = req.user;

    const reports = await reportModel
    .getModel()
    .find({
        $and: [
            {
                idSender: jwt_user.id
            },
            {
                type: "NICKNAME"
            }
        ]
    })
    .exec();

    const playersToIgnore = reports.map((r:any) => {
        return r.idReported;
    });

    const requests = await gameRequestModel
        .getModel()
        .find({
            $and: [
                {
                    $or:[
                        {
                            idSender: jwt_user.id
                        },
                        {
                            idReceiver: jwt_user.id
                        }
                    ]
                },
                {
                    idSender: {
                        $nin: playersToIgnore.map((p: string) => ObjectId(p))
                    }
                },
                {
                    idReceiver: {
                        $nin: playersToIgnore.map((p: string) => ObjectId(p))
                    }
                }
            ]
        });
    
    let requestToReturn = [];

    for(let i = 0; i < requests.length; i++) {
        let req = requests[i];
        let reqToReturn = await req.getFullInfo();
        requestToReturn.push(reqToReturn);
    }

    return res.status(200).json({
        error: false,
        errormessage: "",
        requests: requestToReturn,
    });
}

const searchPlayers = async (req: any, res: any, next: any) => {
    const jwt_user = req.user;

    const reports = await reportModel
    .getModel()
    .find({
        $and: [
            {
                idSender: jwt_user.id
            },
            {
                type: "NICKNAME"
            }
        ]
    })
    .exec();

    /*const requests = await gameRequestModel
        .getModel()
        .find({
            $or:[
                {
                    idSender: jwt_user.id
                },
                {
                    idReceiver: jwt_user.id
                }
            ]
        });*/

    const playersToIgnore = reports.map((r:any) => {
        return r.idReported;
    });

    let playersToAvoid: string[] = [jwt_user.id, ...playersToIgnore];
    /*requests.forEach((req: any) => {
        playersToAvoid.push(req.idSender);
        playersToAvoid.push(req.idReceiver);
    });*/

    const players = await user
        .getModel()
        .find({
            _id: {
                $nin: playersToAvoid.map((p: string) => ObjectId(p))
            },
            nickname: {
                $ne: ""
            }
        });
    
    let playersToReturn = [];

    for(let i = 0; i < players.length; i++) {
        let p = players[i];
        let pToReturn = await p.getFullInfo();
        playersToReturn.push(pToReturn);
    }

    return playersToReturn;
}

const getPlayers = async (req: any, res: any, next: any) => {
    const playersToReturn = await searchPlayers(req, res, next);

    return res.status(200).json({
        error: false,
        errormessage: "",
        players: playersToReturn,
    });
}

const getPlayersByNickname = async (req: any, res: any, next: any) => {
    const nick = req.params.nickname;

    let playersToReturn = await searchPlayers(req, res, next);

    playersToReturn = playersToReturn.filter(p => {
        return p.nickname.toLowerCase().includes(nick.toLowerCase());
    })

    return res.status(200).json({
        error: false,
        errormessage: "",
        players: playersToReturn,
    });
}

const deleteGameRequest = async (req: any, res: any, next: any) => {
    const gameRequestID = req.params.id_game_request;

    const gameRequest = await gameRequestModel
        .getModel()
        .findOne({_id: gameRequestID});

    let otherPlayerId = gameRequest.idSender;
    const s = socket.getSocket(otherPlayerId);
    if(s) {
        s.emit('reload_requests');
    }

    await gameRequestModel.getModel().deleteOne({_id: gameRequestID});



    return res.status(200).json({
        error: false,
        message: "",
    });
};

export {
    createGameRequest,
    getRequests,
    getPlayers,
    getPlayersByNickname,
    deleteGameRequest
}