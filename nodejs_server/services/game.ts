  
"use strict";

import { UploadUtils } from "../uploadUtils";
import { getReportsByUserGeneric } from "./report";

const {ObjectId} = require('mongodb');
const reportModel = require("../models/report");
const gameRequestModel = require("../models/gameRequest");

const jsonwt = require("jsonwebtoken"); // JWT generation
const gameModel = require("../models/game");
const roundModel = require("../models/round");
const userModel = require("../models/user");
const utils = require("../utils");
const error_string = require("../error_string");

const socket = require('./socket').getSockets();

const surrender = async (req: any, res: any, next: any) => {
    const game_id = req.params.id;
    const jwt_user = req.user;
    const playerId = req.user.id;

    try {
        let the_game = await gameModel
            .getModel()
            .findOne({
                _id: game_id,
            })
            .exec();

        if (!the_game) {
            return next(utils.createError(404, error_string.GAME_NOT_FOUND));
        }

        the_game.surrend(jwt_user.id);

        let otherPlayerId = (the_game.idPlayer1 == jwt_user.id) ? the_game.idPlayer2 : the_game.idPlayer1;

        the_game.setIdWinner(otherPlayerId);
        
        the_game
            .save()
            .then(async (data: any) => {
                let myId = jwt_user.id;

                let obj_to_socket = await data.getFullInfo();

                let otherPlayer = await userModel
                    .getModel()
                    .findOne({
                        _id: otherPlayerId,
                    })
                    .exec();

                let player = await userModel
                    .getModel()
                    .findOne({
                        _id: myId,
                    })
                    .exec();

                if (!otherPlayer || !player) {
                    return next(utils.createError(404, error_string.USER_NOT_FOUND));
                }

                let punteggio = await the_game.getScore(myId);

                player.addPoints(punteggio.my_score);
                otherPlayer.addPoints(punteggio.other_player);

                otherPlayer.addWin();

                otherPlayer.save().then(async (d1: any) => {
                    player.addLose();

                    player.save().then(async (d2: any) => {
                        const idOtherPlayer = data.getOtherPlayerId(playerId);
                        const s = socket.getSocket(idOtherPlayer);
                        if(s) {
                            s.emit('update_game_all');
                            s.emit('update_game_' + data._id);
                        }
                        
                        return res.status(200).json({
                            error: false,
                            errormessage: "",
                            game: obj_to_socket,
                        });
                    })
                    .catch((reason: any) => {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                }).catch((reason: any) => {
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
            })
            .catch((reason: any) => {
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            });

        
    } catch (e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
        
    }
}

const getGame = async function(req: any, res: any, next: any) {
    let game_id = req.params.id_game;

    let theGame = await gameModel
        .getModel()
        .findOne({
            _id: game_id,
        })
        .exec();
    
    if (!theGame) {
        return next(utils.createError(404, error_string.GAME_NOT_FOUND));
    }

    let infoToReturn = await theGame.getFullInfo();

    return res.status(200).json({
        error: false,
        errormessage: "",
        game: infoToReturn,
    });
}

const getGamesGeneric = async function(userId: any) {
    const reports = await reportModel
    .getModel()
    .find({
        $and: [
            {
                idSender: userId
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

    const games = await gameModel
    .getModel()
    .find({
        $and: [
            {
                $or: [
                    {
                        idPlayer1: userId,
                    },
                    {
                        idPlayer2: userId,
                    },
                ],
            },
            {
                idPlayer1: {
                    $nin: playersToIgnore
                }
            },
            {
                idPlayer2: {
                    $nin: playersToIgnore
                }
            }
        ]
    })
    .exec();

    const gamesToReturn = [];
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        let gameToReturn = await game.getFullInfo();
        gamesToReturn.push(gameToReturn);
    }

    return gamesToReturn;
}

const getGames = async function(req: any, res: any, next: any) {
    const jwt_user = req.user;

    try {
        const gamesToReturn = await getGamesGeneric(jwt_user.id);

        return res.status(200).json({
            error: false,
            message: "",
            games: gamesToReturn
        });
    } catch (e) {
        console.log("e", e)
        return next(utils.createError(500, "Errore impreviso"));
    }        
}

const playVideo = async function(req: any, res: any, next: any) {
    let fileId = req.params.id_video;

    UploadUtils.getGfs()
    .find({_id: ObjectId(fileId), contentType: "video/mp4"})
    .toArray((err: any, files: any) => {
        if (!files || files.length === 0) {
        return res.status(404).json({
            err: "no files exist"
        });
        }
        UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID( files[0]._id.toString())).pipe(res);
    });
}

const downloadVideo = async function(req: any, res: any, next: any) {
    let fileId = req.params.id_video;

    UploadUtils.getGfs()
    .find({_id: ObjectId(fileId), contentType: "video/mp4"})
    .toArray((err: any, files: any) => {
        if (!files || files.length === 0) {
        return res.status(404).json({
            err: "no files exist"
        });
        }

        res.set('Content-Type', files[0].contentType);
        res.set('Content-Disposition', 'inline; filename="' + files[0].filename + '"');

        var readstream = UploadUtils.getGfs().createReadStream({
            _id: files[0]._id
        });

        readstream.on("error", function (err: any) {
            console.log("Got an error while processing stream: ", err.message);
            res.end();
        });

        readstream.pipe(res);
    });
}

const upload = async function(req: any, res: any, next: any) {
    const game_id = req.params.id_game;
    const round_id = req.params.id_round;
    const image_id = req.params.id_image;
    const truth = (req.params.truth === "true");
    const playerId = req.user.id;
    
    try {
        let theRound = await roundModel
        .getModel()
        .findOne({
            _id: round_id,
        })
        .exec();
    
        if (!theRound) {
            return next(utils.createError(404, error_string.ROUND_NOT_FOUND));
        }

        theRound.setImageId(image_id);

        let theGame = await gameModel
        .getModel()
        .findOne({
            _id: game_id,
        })
        .exec();
    
        if (!theGame) {
            return next(utils.createError(404, error_string.GAME_NOT_FOUND));
        }

        /* Update round video id */

        let fileName = round_id;
        UploadUtils.getGfs()
        .find({filename: fileName, contentType: "video/mp4"})
        .toArray((err: any, files: any) => {
            if(!files || files.length === 0) {
                /* No video found */
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            }

            const file = files[0]; // only one video

            theRound.setVideoId(file._id);
            theRound.setTruth(truth);

            theGame.setJoinable();

            theGame.save().then(async (gameData: any) => {
                theRound
                .save()
                .then(async (data: any) => {
                    const idOtherPlayer = gameData.getOtherPlayerId(playerId);
                    const s = socket.getSocket(idOtherPlayer);
                    if(s) {
                        s.emit('update_game_all');
                        s.emit('update_game_' + gameData._id);
                    }

                    let toReturn = await gameData.getFullInfo();
                    return res.status(200).json({
                        error: false,
                        errormessage: "",
                        game: toReturn,
                    });
                })
                .catch((reason: any) => {
                    console.log(reason);
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
            }).catch((reason: any) => {
                //console.log(reason);
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            });
        });    
    } catch (e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }
}

const notUpload = async function(req: any, res: any, next: any) {
    const game_id = req.params.id_game;
    const round_id = req.params.id_round;
    const playerId = req.user.id;

    let theRound = await roundModel
    .getModel()
    .findOne({
        _id: round_id,
    })
    .exec();
    
    if (!theRound) {
        return next(utils.createError(404, error_string.ROUND_NOT_FOUND));
    }

    let theGame = await gameModel
    .getModel()
    .findOne({
        _id: game_id,
    })
    .exec();

    if (!theGame) {
        return next(utils.createError(404, error_string.GAME_NOT_FOUND));
    }

    theRound.setImageId('no-content');
    theRound.setVideoId('no-content');
    theRound.setTruth(null);
    theRound.setAnswer(null);
    

    theGame.setJoinable();

    if(theGame.turnNumber === 5) {
        theGame.finishGame();

        let idP1 = theGame.idPlayer1;
        let idP2 = theGame.idPlayer2;

        
        let player = await userModel
            .getModel()
            .findOne({
                _id: idP1,
            })
            .exec();

        let otherPlayer = await userModel
            .getModel()
            .findOne({
                _id: idP2,
            })
            .exec();

        if (!otherPlayer || !player) {
            return next(utils.createError(404, error_string.USER_NOT_FOUND));
        }

        let punteggio = await theGame.getScore(idP1);

        player.addPoints(punteggio.my_score);
        otherPlayer.addPoints(punteggio.other_player);

        if(punteggio.my_score > punteggio.other_player) {
            player.addWin();
            otherPlayer.addLose();

            theGame.setIdWinner(idP1);
        }
        else if(punteggio.my_score === punteggio.other_player) {
            player.addDraw();
            otherPlayer.addDraw();

            theGame.setIdWinner("draw");
        }
        else {
            player.addLose();
            otherPlayer.addWin();

            theGame.setIdWinner(idP2);
        }

        await player.save();
        await otherPlayer.save();
    }
    else{
        await theGame.addRound();
        theGame.increaseTurnNumber();
    }
    

    theGame.save().then(async (gameData: any) => {
        theRound
        .save()
        .then(async (data: any) => {
            const idOtherPlayer = gameData.getOtherPlayerId(playerId);
            const s = socket.getSocket(idOtherPlayer);
            if(s) {
                s.emit('update_game_all');
                s.emit('update_game_' + gameData._id);
            }

            let toReturn = await gameData.getFullInfo();
            return res.status(200).json({
                error: false,
                errormessage: "",
                game: toReturn,
            });
        })
        .catch((reason: any) => {
            //console.log(reason);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    }).catch((reason: any) => {
        //console.log(reason);
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });
};

const startGame = async function(req: any, res: any, next: any) {
    const jwt_user = req.user;

    let createNewGame = Math.random() < 0; // TODO: cambiare con probabilità

    const joinable_rooms = await gameModel
        .getModel()
        .find({
            joinable: true,
            idPlayer1: { $ne: jwt_user.id },
        })
        .exec();

    if (joinable_rooms.length == 0) {
        createNewGame = true;
    } else if (joinable_rooms.length < 100) {
        createNewGame = false;
    }

    if (createNewGame) {
        // Create a new room
        const new_game = gameModel.newGame(jwt_user.id);
        await new_game.initGame();

        new_game
        .save()
        .then(async (data: any) => {
        
            const toReturn = await data.getFullInfo();
            try {
                return res.status(200).json({
                    error: false,
                    message: "",
                    created: true,
                    game: toReturn,
                });
            } catch (e) {
                return next(utils.createError(500, "Errore impreviso"));
            }
        })
        .catch((reason: any) => {
            console.log(reason);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    } else {
        // Join a new room
        const roomToJoin =
            joinable_rooms[Math.floor(Math.random() * joinable_rooms.length)];

        roomToJoin.joinGame(jwt_user.id);

        roomToJoin
        .save()
        .then(async (data: any) => {
            const toReturn = await data.getFullInfo();
            try {
                return res.status(200).json({
                    error: false,
                    message: "",
                    created: false,
                    game: toReturn,
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
}

const startGameWithPlayer = async function(req: any, res: any, next: any) {
    const jwt_user = req.user;
    const id_player = req.params.id_player;
    const id_request = req.params.id_request;
    const playerId = jwt_user.id;

    const new_game = gameModel.newGameWithPlayer(id_player, jwt_user.id);
    await new_game.initGame();

    await gameRequestModel.getModel().deleteOne({
        _id: ObjectId(id_request)
    });

    new_game
    .save()
    .then(async (data: any) => {
        const idOtherPlayer = data.getOtherPlayerId(playerId);
        const s = socket.getSocket(idOtherPlayer);
        if(s) {
            s.emit('update_game_all');
            s.emit('update_requests');
            s.emit('new_game_from_request', jwt_user.nickname);
        }

        const toReturn = await data.getFullInfo();
        try {
            return res.status(200).json({
                error: false,
                message: "",
                created: true,
                game: toReturn,
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

const setAnswer = async function(req: any, res: any, next: any) {
    const playerId = req.user.id;
    const game_id = req.params.id_game;
	const round_id = req.params.id_round;

    const answer = req.body.answer;

    try {
        let theGame = await gameModel
            .getModel()
            .findOne({
                _id: game_id,
            })
            .exec();

        if (!theGame) {
            return next(utils.createError(404, error_string.GAME_NOT_FOUND));
        }

        if (theGame.turnNumber == -1) {
            let toReturn = await theGame.getFullInfo();

            return res.status(200).json({
                error: false,
                errormessage: "",
                game: toReturn,
            });
            // La partita è conclusa
            //return next(utils.createError(412, error_string.GAME_FINISHED));
        }

        let theRound = await roundModel
            .getModel()
            .findOne({
                _id: round_id,
            })
            .exec();

        if (!theRound) {
            return next(utils.createError(404, error_string.ROUND_NOT_FOUND));
        }

        // set round answer
        theRound.setAnswer(answer);

        theRound
        .save()
        .then(async (data: any) => {        
            // add round and increase turn
            if(theGame.turnNumber === 5) {
                // game finito
                theGame.finishGame();

                let idP1 = theGame.idPlayer1;
				let idP2 = theGame.idPlayer2;

                let otherPlayer = await userModel
                    .getModel()
                    .findOne({
                        _id: idP2,
                    })
                    .exec();

                let player = await userModel
                    .getModel()
                    .findOne({
                        _id: idP1,
                    })
                    .exec();

                if (!otherPlayer || !player) {
                    return next(utils.createError(404, error_string.USER_NOT_FOUND));
                }

                let punteggio = await theGame.getScore(idP1);

                player.addPoints(punteggio.my_score);
                otherPlayer.addPoints(punteggio.other_player);

                if(punteggio.my_score > punteggio.other_player) {
                    player.addWin();
                    otherPlayer.addLose();

                    theGame.setIdWinner(idP1);
                }
                else if(punteggio.my_score === punteggio.other_player) {
                    player.addDraw();
                    otherPlayer.addDraw();

                    theGame.setIdWinner("draw");
                }
                else {
                    player.addLose();
                    otherPlayer.addWin();

                    theGame.setIdWinner(idP2);
                }

                player.save();
                otherPlayer.save();
            }
            else {
                await theGame.addRound();
                theGame.increaseTurnNumber();
            }
            
            theGame.save()
            .then(async (gameData: any) => {
                const idOtherPlayer = gameData.getOtherPlayerId(playerId);
                const s = socket.getSocket(idOtherPlayer);
                if(s) {
                    s.emit('update_game_all');
                    s.emit('update_game_' + gameData._id);
                }
                

                let toReturn = await gameData.getFullInfo();

                return res.status(200).json({
                    error: false,
                    errormessage: "",
                    game: toReturn,
                });
            })
            .catch((reason: any) => {
                //console.log(reason);
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            });
        })
        .catch((reason: any) => {
            //console.log(reason);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });

    }catch(e: any) {
        //console.log("We", e.toString())
    }
}

const getAllGames = async function(req: any, res: any, next: any) {
    let games = await gameModel
        .getModel()
        .find({ })
        .exec();

    let gamesToReturn = [];

    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        let gameToReturn = await game.getFullInfo();
        gamesToReturn.push(gameToReturn);
    }

    return res.status(200).json({
        error: false,
        errormessage: "",
        games: gamesToReturn,
    });
};

const changeWinner = async (req: any, res: any, next: any) => {
    let gameId = req.params.id;
    let playerId = req.params.player;

    const game = await gameModel
        .getModel()
        .findOne({
            _id: gameId
        })
        .exec();

    game.setIdWinner(playerId);

    game.save().then(async (gameData: any) => {
        try {
            let gameToReturn = await gameData.getFullInfo();
            return res.status(200).json({
                error: false,
                message: "",
                game: gameToReturn
            });
        } catch (e) {
            return next(utils.createError(500, "Errore impreviso"));
        }
    }).catch((reason: any) => {
        console.log(reason);
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });
}

export {
    getGames,
    startGame,
    upload,
    notUpload,
    playVideo,
    setAnswer,
    getGame,
    surrender,
    downloadVideo,
    getGamesGeneric,
    getAllGames,
    changeWinner,
    startGameWithPlayer
}