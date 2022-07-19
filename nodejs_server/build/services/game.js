"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameWithPlayer = exports.changeWinner = exports.getAllGames = exports.getGamesGeneric = exports.downloadVideo = exports.surrender = exports.getGame = exports.setAnswer = exports.playVideo = exports.notUpload = exports.upload = exports.startGame = exports.getGames = void 0;
var uploadUtils_1 = require("../uploadUtils");
var ObjectId = require('mongodb').ObjectId;
var reportModel = require("../models/report");
var gameRequestModel = require("../models/gameRequest");
var jsonwt = require("jsonwebtoken"); // JWT generation
var gameModel = require("../models/game");
var roundModel = require("../models/round");
var userModel = require("../models/user");
var utils = require("../utils");
var error_string = require("../error_string");
var socket = require('./socket').getSockets();
var surrender = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var game_id, jwt_user, playerId, the_game_1, otherPlayerId_1, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                game_id = req.params.id;
                jwt_user = req.user;
                playerId = req.user.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, gameModel
                        .getModel()
                        .findOne({
                        _id: game_id,
                    })
                        .exec()];
            case 2:
                the_game_1 = _a.sent();
                if (!the_game_1) {
                    return [2 /*return*/, next(utils.createError(404, error_string.GAME_NOT_FOUND))];
                }
                the_game_1.surrend(jwt_user.id);
                otherPlayerId_1 = (the_game_1.idPlayer1 == jwt_user.id) ? the_game_1.idPlayer2 : the_game_1.idPlayer1;
                the_game_1.setIdWinner(otherPlayerId_1);
                the_game_1
                    .save()
                    .then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var myId, obj_to_socket, otherPlayer, player, punteggio;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                myId = jwt_user.id;
                                return [4 /*yield*/, data.getFullInfo()];
                            case 1:
                                obj_to_socket = _a.sent();
                                return [4 /*yield*/, userModel
                                        .getModel()
                                        .findOne({
                                        _id: otherPlayerId_1,
                                    })
                                        .exec()];
                            case 2:
                                otherPlayer = _a.sent();
                                return [4 /*yield*/, userModel
                                        .getModel()
                                        .findOne({
                                        _id: myId,
                                    })
                                        .exec()];
                            case 3:
                                player = _a.sent();
                                if (!otherPlayer || !player) {
                                    return [2 /*return*/, next(utils.createError(404, error_string.USER_NOT_FOUND))];
                                }
                                return [4 /*yield*/, the_game_1.getScore(myId)];
                            case 4:
                                punteggio = _a.sent();
                                player.addPoints(punteggio.my_score);
                                otherPlayer.addPoints(punteggio.other_player);
                                otherPlayer.addWin();
                                otherPlayer.save().then(function (d1) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        player.addLose();
                                        player.save().then(function (d2) { return __awaiter(void 0, void 0, void 0, function () {
                                            var idOtherPlayer, s;
                                            return __generator(this, function (_a) {
                                                idOtherPlayer = data.getOtherPlayerId(playerId);
                                                s = socket.getSocket(idOtherPlayer);
                                                if (s) {
                                                    s.emit('update_game_all');
                                                    s.emit('update_game_' + data._id);
                                                }
                                                return [2 /*return*/, res.status(200).json({
                                                        error: false,
                                                        errormessage: "",
                                                        game: obj_to_socket,
                                                    })];
                                            });
                                        }); })
                                            .catch(function (reason) {
                                            return next(utils.createError(500, error_string.DATABASE_ERROR));
                                        });
                                        return [2 /*return*/];
                                    });
                                }); }).catch(function (reason) {
                                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (reason) {
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.surrender = surrender;
var getGame = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var game_id, theGame, infoToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    game_id = req.params.id_game;
                    return [4 /*yield*/, gameModel
                            .getModel()
                            .findOne({
                            _id: game_id,
                        })
                            .exec()];
                case 1:
                    theGame = _a.sent();
                    if (!theGame) {
                        return [2 /*return*/, next(utils.createError(404, error_string.GAME_NOT_FOUND))];
                    }
                    return [4 /*yield*/, theGame.getFullInfo()];
                case 2:
                    infoToReturn = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            game: infoToReturn,
                        })];
            }
        });
    });
};
exports.getGame = getGame;
var getGamesGeneric = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
        var reports, playersToIgnore, games, gamesToReturn, i, game, gameToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, reportModel
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
                        .exec()];
                case 1:
                    reports = _a.sent();
                    playersToIgnore = reports.map(function (r) {
                        return r.idReported;
                    });
                    return [4 /*yield*/, gameModel
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
                            .exec()];
                case 2:
                    games = _a.sent();
                    gamesToReturn = [];
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < games.length)) return [3 /*break*/, 6];
                    game = games[i];
                    return [4 /*yield*/, game.getFullInfo()];
                case 4:
                    gameToReturn = _a.sent();
                    gamesToReturn.push(gameToReturn);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, gamesToReturn];
            }
        });
    });
};
exports.getGamesGeneric = getGamesGeneric;
var getGames = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt_user, gamesToReturn, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt_user = req.user;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getGamesGeneric(jwt_user.id)];
                case 2:
                    gamesToReturn = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            message: "",
                            games: gamesToReturn
                        })];
                case 3:
                    e_2 = _a.sent();
                    console.log("e", e_2);
                    return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getGames = getGames;
var playVideo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId;
        return __generator(this, function (_a) {
            fileId = req.params.id_video;
            uploadUtils_1.UploadUtils.getGfs()
                .find({ _id: ObjectId(fileId), contentType: "video/mp4" })
                .toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                uploadUtils_1.UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID(files[0]._id.toString())).pipe(res);
            });
            return [2 /*return*/];
        });
    });
};
exports.playVideo = playVideo;
var downloadVideo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId;
        return __generator(this, function (_a) {
            fileId = req.params.id_video;
            uploadUtils_1.UploadUtils.getGfs()
                .find({ _id: ObjectId(fileId), contentType: "video/mp4" })
                .toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                res.set('Content-Type', files[0].contentType);
                res.set('Content-Disposition', 'inline; filename="' + files[0].filename + '"');
                var readstream = uploadUtils_1.UploadUtils.getGfs().createReadStream({
                    _id: files[0]._id
                });
                readstream.on("error", function (err) {
                    console.log("Got an error while processing stream: ", err.message);
                    res.end();
                });
                readstream.pipe(res);
            });
            return [2 /*return*/];
        });
    });
};
exports.downloadVideo = downloadVideo;
var upload = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var game_id, round_id, image_id, truth, playerId, theRound_1, theGame_1, fileName, e_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    game_id = req.params.id_game;
                    round_id = req.params.id_round;
                    image_id = req.params.id_image;
                    truth = (req.params.truth === "true");
                    playerId = req.user.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, roundModel
                            .getModel()
                            .findOne({
                            _id: round_id,
                        })
                            .exec()];
                case 2:
                    theRound_1 = _a.sent();
                    if (!theRound_1) {
                        return [2 /*return*/, next(utils.createError(404, error_string.ROUND_NOT_FOUND))];
                    }
                    theRound_1.setImageId(image_id);
                    return [4 /*yield*/, gameModel
                            .getModel()
                            .findOne({
                            _id: game_id,
                        })
                            .exec()];
                case 3:
                    theGame_1 = _a.sent();
                    if (!theGame_1) {
                        return [2 /*return*/, next(utils.createError(404, error_string.GAME_NOT_FOUND))];
                    }
                    fileName = round_id;
                    uploadUtils_1.UploadUtils.getGfs()
                        .find({ filename: fileName, contentType: "video/mp4" })
                        .toArray(function (err, files) {
                        if (!files || files.length === 0) {
                            /* No video found */
                            return next(utils.createError(500, error_string.DATABASE_ERROR));
                        }
                        var file = files[0]; // only one video
                        theRound_1.setVideoId(file._id);
                        theRound_1.setTruth(truth);
                        theGame_1.setJoinable();
                        theGame_1.save().then(function (gameData) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                theRound_1
                                    .save()
                                    .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                    var idOtherPlayer, s, toReturn;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                idOtherPlayer = gameData.getOtherPlayerId(playerId);
                                                s = socket.getSocket(idOtherPlayer);
                                                if (s) {
                                                    s.emit('update_game_all');
                                                    s.emit('update_game_' + gameData._id);
                                                }
                                                return [4 /*yield*/, gameData.getFullInfo()];
                                            case 1:
                                                toReturn = _a.sent();
                                                return [2 /*return*/, res.status(200).json({
                                                        error: false,
                                                        errormessage: "",
                                                        game: toReturn,
                                                    })];
                                        }
                                    });
                                }); })
                                    .catch(function (reason) {
                                    console.log(reason);
                                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                                });
                                return [2 /*return*/];
                            });
                        }); }).catch(function (reason) {
                            //console.log(reason);
                            return next(utils.createError(500, error_string.DATABASE_ERROR));
                        });
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    console.log(e_3);
                    return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.upload = upload;
var notUpload = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var game_id, round_id, playerId, theRound, theGame, idP1, idP2, player, otherPlayer, punteggio;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    game_id = req.params.id_game;
                    round_id = req.params.id_round;
                    playerId = req.user.id;
                    return [4 /*yield*/, roundModel
                            .getModel()
                            .findOne({
                            _id: round_id,
                        })
                            .exec()];
                case 1:
                    theRound = _a.sent();
                    if (!theRound) {
                        return [2 /*return*/, next(utils.createError(404, error_string.ROUND_NOT_FOUND))];
                    }
                    return [4 /*yield*/, gameModel
                            .getModel()
                            .findOne({
                            _id: game_id,
                        })
                            .exec()];
                case 2:
                    theGame = _a.sent();
                    if (!theGame) {
                        return [2 /*return*/, next(utils.createError(404, error_string.GAME_NOT_FOUND))];
                    }
                    theRound.setImageId('no-content');
                    theRound.setVideoId('no-content');
                    theRound.setTruth(null);
                    theRound.setAnswer(null);
                    theGame.setJoinable();
                    if (!(theGame.turnNumber === 5)) return [3 /*break*/, 8];
                    theGame.finishGame();
                    idP1 = theGame.idPlayer1;
                    idP2 = theGame.idPlayer2;
                    return [4 /*yield*/, userModel
                            .getModel()
                            .findOne({
                            _id: idP1,
                        })
                            .exec()];
                case 3:
                    player = _a.sent();
                    return [4 /*yield*/, userModel
                            .getModel()
                            .findOne({
                            _id: idP2,
                        })
                            .exec()];
                case 4:
                    otherPlayer = _a.sent();
                    if (!otherPlayer || !player) {
                        return [2 /*return*/, next(utils.createError(404, error_string.USER_NOT_FOUND))];
                    }
                    return [4 /*yield*/, theGame.getScore(idP1)];
                case 5:
                    punteggio = _a.sent();
                    player.addPoints(punteggio.my_score);
                    otherPlayer.addPoints(punteggio.other_player);
                    if (punteggio.my_score > punteggio.other_player) {
                        player.addWin();
                        otherPlayer.addLose();
                        theGame.setIdWinner(idP1);
                    }
                    else if (punteggio.my_score === punteggio.other_player) {
                        player.addDraw();
                        otherPlayer.addDraw();
                        theGame.setIdWinner("draw");
                    }
                    else {
                        player.addLose();
                        otherPlayer.addWin();
                        theGame.setIdWinner(idP2);
                    }
                    return [4 /*yield*/, player.save()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, otherPlayer.save()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, theGame.addRound()];
                case 9:
                    _a.sent();
                    theGame.increaseTurnNumber();
                    _a.label = 10;
                case 10:
                    theGame.save().then(function (gameData) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            theRound
                                .save()
                                .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                var idOtherPlayer, s, toReturn;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            idOtherPlayer = gameData.getOtherPlayerId(playerId);
                                            s = socket.getSocket(idOtherPlayer);
                                            if (s) {
                                                s.emit('update_game_all');
                                                s.emit('update_game_' + gameData._id);
                                            }
                                            return [4 /*yield*/, gameData.getFullInfo()];
                                        case 1:
                                            toReturn = _a.sent();
                                            return [2 /*return*/, res.status(200).json({
                                                    error: false,
                                                    errormessage: "",
                                                    game: toReturn,
                                                })];
                                    }
                                });
                            }); })
                                .catch(function (reason) {
                                //console.log(reason);
                                return next(utils.createError(500, error_string.DATABASE_ERROR));
                            });
                            return [2 /*return*/];
                        });
                    }); }).catch(function (reason) {
                        //console.log(reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.notUpload = notUpload;
var startGame = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt_user, createNewGame, joinable_rooms, new_game, roomToJoin;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt_user = req.user;
                    createNewGame = Math.random() < 0;
                    return [4 /*yield*/, gameModel
                            .getModel()
                            .find({
                            joinable: true,
                            idPlayer1: { $ne: jwt_user.id },
                        })
                            .exec()];
                case 1:
                    joinable_rooms = _a.sent();
                    if (joinable_rooms.length == 0) {
                        createNewGame = true;
                    }
                    else if (joinable_rooms.length < 100) {
                        createNewGame = false;
                    }
                    if (!createNewGame) return [3 /*break*/, 3];
                    new_game = gameModel.newGame(jwt_user.id);
                    return [4 /*yield*/, new_game.initGame()];
                case 2:
                    _a.sent();
                    new_game
                        .save()
                        .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var toReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, data.getFullInfo()];
                                case 1:
                                    toReturn = _a.sent();
                                    try {
                                        return [2 /*return*/, res.status(200).json({
                                                error: false,
                                                message: "",
                                                created: true,
                                                game: toReturn,
                                            })];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        console.log(reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [3 /*break*/, 4];
                case 3:
                    roomToJoin = joinable_rooms[Math.floor(Math.random() * joinable_rooms.length)];
                    roomToJoin.joinGame(jwt_user.id);
                    roomToJoin
                        .save()
                        .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var toReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, data.getFullInfo()];
                                case 1:
                                    toReturn = _a.sent();
                                    try {
                                        return [2 /*return*/, res.status(200).json({
                                                error: false,
                                                message: "",
                                                created: false,
                                                game: toReturn,
                                            })];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        console.log(reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.startGame = startGame;
var startGameWithPlayer = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt_user, id_player, id_request, playerId, new_game;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt_user = req.user;
                    id_player = req.params.id_player;
                    id_request = req.params.id_request;
                    playerId = jwt_user.id;
                    new_game = gameModel.newGameWithPlayer(id_player, jwt_user.id);
                    return [4 /*yield*/, new_game.initGame()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, gameRequestModel.getModel().deleteOne({
                            _id: ObjectId(id_request)
                        })];
                case 2:
                    _a.sent();
                    new_game
                        .save()
                        .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var idOtherPlayer, s, toReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    idOtherPlayer = data.getOtherPlayerId(playerId);
                                    s = socket.getSocket(idOtherPlayer);
                                    if (s) {
                                        s.emit('update_game_all');
                                        s.emit('update_requests');
                                        s.emit('new_game_from_request', jwt_user.nickname);
                                    }
                                    return [4 /*yield*/, data.getFullInfo()];
                                case 1:
                                    toReturn = _a.sent();
                                    try {
                                        return [2 /*return*/, res.status(200).json({
                                                error: false,
                                                message: "",
                                                created: true,
                                                game: toReturn,
                                            })];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        console.log(reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.startGameWithPlayer = startGameWithPlayer;
var setAnswer = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playerId, game_id, round_id, answer, theGame_2, toReturn, theRound, e_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playerId = req.user.id;
                    game_id = req.params.id_game;
                    round_id = req.params.id_round;
                    answer = req.body.answer;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, gameModel
                            .getModel()
                            .findOne({
                            _id: game_id,
                        })
                            .exec()];
                case 2:
                    theGame_2 = _a.sent();
                    if (!theGame_2) {
                        return [2 /*return*/, next(utils.createError(404, error_string.GAME_NOT_FOUND))];
                    }
                    if (!(theGame_2.turnNumber == -1)) return [3 /*break*/, 4];
                    return [4 /*yield*/, theGame_2.getFullInfo()];
                case 3:
                    toReturn = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            game: toReturn,
                        })];
                case 4: return [4 /*yield*/, roundModel
                        .getModel()
                        .findOne({
                        _id: round_id,
                    })
                        .exec()];
                case 5:
                    theRound = _a.sent();
                    if (!theRound) {
                        return [2 /*return*/, next(utils.createError(404, error_string.ROUND_NOT_FOUND))];
                    }
                    // set round answer
                    theRound.setAnswer(answer);
                    theRound
                        .save()
                        .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var idP1, idP2, otherPlayer, player, punteggio;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(theGame_2.turnNumber === 5)) return [3 /*break*/, 4];
                                    // game finito
                                    theGame_2.finishGame();
                                    idP1 = theGame_2.idPlayer1;
                                    idP2 = theGame_2.idPlayer2;
                                    return [4 /*yield*/, userModel
                                            .getModel()
                                            .findOne({
                                            _id: idP2,
                                        })
                                            .exec()];
                                case 1:
                                    otherPlayer = _a.sent();
                                    return [4 /*yield*/, userModel
                                            .getModel()
                                            .findOne({
                                            _id: idP1,
                                        })
                                            .exec()];
                                case 2:
                                    player = _a.sent();
                                    if (!otherPlayer || !player) {
                                        return [2 /*return*/, next(utils.createError(404, error_string.USER_NOT_FOUND))];
                                    }
                                    return [4 /*yield*/, theGame_2.getScore(idP1)];
                                case 3:
                                    punteggio = _a.sent();
                                    player.addPoints(punteggio.my_score);
                                    otherPlayer.addPoints(punteggio.other_player);
                                    if (punteggio.my_score > punteggio.other_player) {
                                        player.addWin();
                                        otherPlayer.addLose();
                                        theGame_2.setIdWinner(idP1);
                                    }
                                    else if (punteggio.my_score === punteggio.other_player) {
                                        player.addDraw();
                                        otherPlayer.addDraw();
                                        theGame_2.setIdWinner("draw");
                                    }
                                    else {
                                        player.addLose();
                                        otherPlayer.addWin();
                                        theGame_2.setIdWinner(idP2);
                                    }
                                    player.save();
                                    otherPlayer.save();
                                    return [3 /*break*/, 6];
                                case 4: return [4 /*yield*/, theGame_2.addRound()];
                                case 5:
                                    _a.sent();
                                    theGame_2.increaseTurnNumber();
                                    _a.label = 6;
                                case 6:
                                    theGame_2.save()
                                        .then(function (gameData) { return __awaiter(_this, void 0, void 0, function () {
                                        var idOtherPlayer, s, toReturn;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    idOtherPlayer = gameData.getOtherPlayerId(playerId);
                                                    s = socket.getSocket(idOtherPlayer);
                                                    if (s) {
                                                        s.emit('update_game_all');
                                                        s.emit('update_game_' + gameData._id);
                                                    }
                                                    return [4 /*yield*/, gameData.getFullInfo()];
                                                case 1:
                                                    toReturn = _a.sent();
                                                    return [2 /*return*/, res.status(200).json({
                                                            error: false,
                                                            errormessage: "",
                                                            game: toReturn,
                                                        })];
                                            }
                                        });
                                    }); })
                                        .catch(function (reason) {
                                        //console.log(reason);
                                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        //console.log(reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [3 /*break*/, 7];
                case 6:
                    e_4 = _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.setAnswer = setAnswer;
var getAllGames = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var games, gamesToReturn, i, game, gameToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gameModel
                        .getModel()
                        .find({})
                        .exec()];
                case 1:
                    games = _a.sent();
                    gamesToReturn = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < games.length)) return [3 /*break*/, 5];
                    game = games[i];
                    return [4 /*yield*/, game.getFullInfo()];
                case 3:
                    gameToReturn = _a.sent();
                    gamesToReturn.push(gameToReturn);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        games: gamesToReturn,
                    })];
            }
        });
    });
};
exports.getAllGames = getAllGames;
var changeWinner = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var gameId, playerId, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gameId = req.params.id;
                playerId = req.params.player;
                return [4 /*yield*/, gameModel
                        .getModel()
                        .findOne({
                        _id: gameId
                    })
                        .exec()];
            case 1:
                game = _a.sent();
                game.setIdWinner(playerId);
                game.save().then(function (gameData) { return __awaiter(void 0, void 0, void 0, function () {
                    var gameToReturn, e_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, gameData.getFullInfo()];
                            case 1:
                                gameToReturn = _a.sent();
                                return [2 /*return*/, res.status(200).json({
                                        error: false,
                                        message: "",
                                        game: gameToReturn
                                    })];
                            case 2:
                                e_5 = _a.sent();
                                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }).catch(function (reason) {
                    console.log(reason);
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [2 /*return*/];
        }
    });
}); };
exports.changeWinner = changeWinner;
