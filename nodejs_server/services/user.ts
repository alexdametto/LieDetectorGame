"use strict";

import { getGamesGeneric } from "./game";
import { getReportsByUserGeneric } from "./report";

const user = require("../models/user");
const game = require("../models/game");
const round = require("../models/round");
const report = require("../models/report");
const gameRequest = require("../models/gameRequest");

const socket = require('./socket').getSockets();
const jsonwt = require("jsonwebtoken"); // JWT generation

const utils = require("../utils");

import { UploadUtils } from "../uploadUtils";

const error_string = require("../error_string");

const deleteUser = async function(req: any, res: any, next: any) {
    const userId = req.user.id;
    
    let userToRecover = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();

	if (!userToRecover) {
		return res.status(404).json({
			error: true,
			message: "User not found.",
		});
	}

    // elimino tutti i video
    await UploadUtils.getGfs()
    .find({'metadata.userId': userId})
    .toArray(async (err: any, files: any) => {
        if (!files || files.length === 0) {
            // non fare niente
        }
        else {
            for(let i = 0; i < files.length; i++) {
                const file = files[i];
                await UploadUtils.getGfs().delete(file._id);
            }
        }
    });

    // elimino user su DB
    await user.getModel().deleteOne({
        _id: userId
    });

    // ottengo i game (per poi, dopo cancellati, mandare socket)
    const games = await game.getModel().find({
        $or:[
            {
                idPlayer1: userId
            },
            {
                idPlayer2: userId
            }
        ]
    });

    // elimino i game
    await game.getModel().deleteMany({
        $or:[
            {
                idPlayer1: userId
            },
            {
                idPlayer2: userId
            }
        ]
    });

    const gamesID = [];
    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        const gameID = game._id;
        gamesID.push(gameID)
    }

    // elimino i round
    await round.getModel().deleteMany({
        idGame: {
            $in: gamesID
        }
    });

    // invio messaggi socket per i game
    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        const gameID = game._id;
        let otherPlayerID = "";
        if(game.idPlayer1 === userId) {
            otherPlayerID = game.idPlayer2;
        }
        else {
            otherPlayerID = game.idPlayer1;
        }

        const s = socket.getSocket(otherPlayerID);
        if(s) {
            s.emit('deleted_game_' + gameID);
            s.emit('refresh_games');
        }
    }

    // prendo gameRequest
    const requests = await gameRequest.getModel().find({
        $or:[
            {
                idSender: userId
            },
            {
                idReceiver: userId
            }
        ]
    });

    // elimino le gameRequest
    await gameRequest.getModel().deleteMany({
        $or:[
            {
                idSender: userId
            },
            {
                idReceiver: userId
            }
        ]
    });

    // invio socket per game request
    for(let i = 0; i < requests.length; i++) {
        const req = requests[i];
        let otherPlayerID = "";

        if(req.idSender === userId) {
            otherPlayerID = req.idReceiver;
        }
        else {
            otherPlayerID = req.idSender;
        }

        const s = socket.getSocket(otherPlayerID);
        if(s) {
            s.emit('reload_requests');
        }
    }

    // elimino i report
    await report.getModel().deleteMany({
        $or:[
            {
                idSender: userId
            },
            {
                idReported: userId
            }
        ]
    });

    return res.status(200).json({
        error: false,
        message: "",
    });
};

const getUserInfo = async function(req: any, res: any, next: any) {
    const userId = req.params.id;

    try {
        const userToReturn = await user
            .getModel()
            .findOne({
                _id: userId
            })
            .exec();
        
        const games = await getGamesGeneric(userId);
        const reports = await getReportsByUserGeneric(userId);
        
        return res.status(200).json({
            error: false,
            errormessage: "",
            user: {
                ...userToReturn.getFullInfo(),
                games: games,
                myReportList: reports.filter((r: any) => r.sender.id.toString() === userId.toString()),
                reportAgainstMeList: reports.filter((r: any) => r.reported.id.toString() === userId.toString())
            }
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }

}

const updateNickname = async function(req: any, res: any, next: any) {
    const jwt_user = req.user;
    let nickname = req.body.nickname;

    if (utils.checkNickname(nickname)) {
        try {
            let db_users = await user
            .getModel()
            .find({
                nickname: req.body.nickname,
                _id: {
                    $ne: jwt_user.id
                }
            })
            .exec();

            if(db_users.length > 0) {
                return res.status(409).json({
                    error: false,
                    errormessage: 'DUPLICATE_NICKNAME',
                });
            }
            
            let db_user = await user
                .getModel()
                .findOne({
                    _id: jwt_user.id
                })
                .exec();

            db_user.setNickname(nickname);

            db_user
                .save()
                .then((data : any) => {
                    const newToken = {
                        email: jwt_user.email,
                        id: jwt_user.id,
                        nickname: nickname
                    };

                    const token_signed = jsonwt.sign(newToken, utils.getJWTSecret(), {
                        expiresIn: utils.getJWTExpires()
                    });

                    return res.status(200).json({
                        error: false,
                        errormessage: "",
                        new_token: token_signed
                    });
                })
                .catch((reason: any) => {
                    
                     console.log("Oh?", reason)
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
        } catch (e) {
            return next(utils.createError(500, "Errore impreviso"));
        }
    } else {
        try {
            return res.status(412).json({
                error: true,
                errormessage: error_string.NICKNAME_INVALID
            });
        } catch (e) {
            return next(utils.createError(500, "Errore impreviso"));
        }
    }
}

const updateInfo = async function(req: any, res: any, next: any) {
    const jwt_user = req.user;

    const toUpdate = {
		sex: req.body.sex,
		age: req.body.age,
		educationalQualification: req.body.educationalQualification,
        nickname: req.body.nickname
    }

    try {
        let db_users = await user
            .getModel()
            .find({
                nickname: req.body.nickname,
                _id: {
                    $ne: jwt_user.id
                }
            })
            .exec();

        if(db_users.length > 0) {
            return res.status(409).json({
                error: false,
                errormessage: 'DUPLICATE_NICKNAME',
            });
        }

        let db_user = await user
            .getModel()
            .findOne({
                _id: jwt_user.id
            })
            .exec();

        db_user.setInfo(toUpdate);

        db_user
            .save()
            .then((data : any) => {
                const newToken = {
                    email: jwt_user.email,
                    id: jwt_user.id,
                    nickname: toUpdate.nickname
                };

                const token_signed = jsonwt.sign(newToken, utils.getJWTSecret(), {
                    expiresIn: utils.getJWTExpires()
                });

                return res.status(200).json({
                    error: false,
                    errormessage: "",
                    new_token: token_signed
                });
            })
            .catch((reason: any) => {
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            });
    } catch (e) {
        return next(utils.createError(500, "Errore impreviso"));
    }
}

const banUser = async (req: any, res: any, next: any) => {
    const userId = req.params.id;

    try {
        const userToBan = await user
            .getModel()
            .findOne({
                _id: userId
            })
            .exec();
        
        userToBan.ban();

        userToBan.save().then(async (data : any) => {
            let objToSend = await data.getFullInfo();

            return res.status(200).json({
                error: false,
                errormessage: "",
                user: objToSend,
            });
        }).catch((reason: any) => {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }

}

const unbanUser = async (req: any, res: any, next: any) => {
    const userId = req.params.id;

    try {
        const userToBan = await user
            .getModel()
            .findOne({
                _id: userId
            })
            .exec();
        
        userToBan.unban();

        userToBan.save().then(async (data : any) => {
            let objToSend = await data.getFullInfo();

            return res.status(200).json({
                error: false,
                errormessage: "",
                user: objToSend,
            });
        }).catch((reason: any) => {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }

}


const getAllUsers = async (req: any, res: any, next: any) => {
    try {
        let allUsers = await user
        .getModel()
        .find({
            nickname: { $ne: "" }
        })
        .exec();

        const usersToReturn = allUsers.map((user: any) => {
            return user.getFullInfo();
        });

        return res.status(200).json({
            error: false,
            errormessage: "",
            data: usersToReturn
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }
}

export {
    getUserInfo,
    updateNickname,
    updateInfo,
    banUser,
    unbanUser,
    getAllUsers,
    deleteUser
}