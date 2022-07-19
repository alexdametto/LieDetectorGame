"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.deleteUser = exports.getAllUsers = exports.unbanUser = exports.banUser = exports.updateInfo = exports.updateNickname = exports.getUserInfo = void 0;
var game_1 = require("./game");
var report_1 = require("./report");
var user = require("../models/user");
var game = require("../models/game");
var round = require("../models/round");
var report = require("../models/report");
var gameRequest = require("../models/gameRequest");
var socket = require('./socket').getSockets();
var jsonwt = require("jsonwebtoken"); // JWT generation
var utils = require("../utils");
var uploadUtils_1 = require("../uploadUtils");
var error_string = require("../error_string");
var deleteUser = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userToRecover, games, gamesID, i, game_2, gameID, i, game_3, gameID, otherPlayerID, s, requests, i, req_1, otherPlayerID, s;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.user.id;
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: userId
                        })
                            .exec()];
                case 1:
                    userToRecover = _a.sent();
                    if (!userToRecover) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "User not found.",
                            })];
                    }
                    // elimino tutti i video
                    return [4 /*yield*/, uploadUtils_1.UploadUtils.getGfs()
                            .find({ 'metadata.userId': userId })
                            .toArray(function (err, files) { return __awaiter(_this, void 0, void 0, function () {
                            var i, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(!files || files.length === 0)) return [3 /*break*/, 1];
                                        return [3 /*break*/, 5];
                                    case 1:
                                        i = 0;
                                        _a.label = 2;
                                    case 2:
                                        if (!(i < files.length)) return [3 /*break*/, 5];
                                        file = files[i];
                                        return [4 /*yield*/, uploadUtils_1.UploadUtils.getGfs().delete(file._id)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // elimino tutti i video
                    _a.sent();
                    // elimino user su DB
                    return [4 /*yield*/, user.getModel().deleteOne({
                            _id: userId
                        })];
                case 3:
                    // elimino user su DB
                    _a.sent();
                    return [4 /*yield*/, game.getModel().find({
                            $or: [
                                {
                                    idPlayer1: userId
                                },
                                {
                                    idPlayer2: userId
                                }
                            ]
                        })];
                case 4:
                    games = _a.sent();
                    // elimino i game
                    return [4 /*yield*/, game.getModel().deleteMany({
                            $or: [
                                {
                                    idPlayer1: userId
                                },
                                {
                                    idPlayer2: userId
                                }
                            ]
                        })];
                case 5:
                    // elimino i game
                    _a.sent();
                    gamesID = [];
                    for (i = 0; i < games.length; i++) {
                        game_2 = games[i];
                        gameID = game_2._id;
                        gamesID.push(gameID);
                    }
                    // elimino i round
                    return [4 /*yield*/, round.getModel().deleteMany({
                            idGame: {
                                $in: gamesID
                            }
                        })];
                case 6:
                    // elimino i round
                    _a.sent();
                    // invio messaggi socket per i game
                    for (i = 0; i < games.length; i++) {
                        game_3 = games[i];
                        gameID = game_3._id;
                        otherPlayerID = "";
                        if (game_3.idPlayer1 === userId) {
                            otherPlayerID = game_3.idPlayer2;
                        }
                        else {
                            otherPlayerID = game_3.idPlayer1;
                        }
                        s = socket.getSocket(otherPlayerID);
                        if (s) {
                            s.emit('deleted_game_' + gameID);
                            s.emit('refresh_games');
                        }
                    }
                    return [4 /*yield*/, gameRequest.getModel().find({
                            $or: [
                                {
                                    idSender: userId
                                },
                                {
                                    idReceiver: userId
                                }
                            ]
                        })];
                case 7:
                    requests = _a.sent();
                    // elimino le gameRequest
                    return [4 /*yield*/, gameRequest.getModel().deleteMany({
                            $or: [
                                {
                                    idSender: userId
                                },
                                {
                                    idReceiver: userId
                                }
                            ]
                        })];
                case 8:
                    // elimino le gameRequest
                    _a.sent();
                    // invio socket per game request
                    for (i = 0; i < requests.length; i++) {
                        req_1 = requests[i];
                        otherPlayerID = "";
                        if (req_1.idSender === userId) {
                            otherPlayerID = req_1.idReceiver;
                        }
                        else {
                            otherPlayerID = req_1.idSender;
                        }
                        s = socket.getSocket(otherPlayerID);
                        if (s) {
                            s.emit('reload_requests');
                        }
                    }
                    // elimino i report
                    return [4 /*yield*/, report.getModel().deleteMany({
                            $or: [
                                {
                                    idSender: userId
                                },
                                {
                                    idReported: userId
                                }
                            ]
                        })];
                case 9:
                    // elimino i report
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            message: "",
                        })];
            }
        });
    });
};
exports.deleteUser = deleteUser;
var getUserInfo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userToReturn, games, reports, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: userId
                        })
                            .exec()];
                case 2:
                    userToReturn = _a.sent();
                    return [4 /*yield*/, game_1.getGamesGeneric(userId)];
                case 3:
                    games = _a.sent();
                    return [4 /*yield*/, report_1.getReportsByUserGeneric(userId)];
                case 4:
                    reports = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            user: __assign(__assign({}, userToReturn.getFullInfo()), { games: games, myReportList: reports.filter(function (r) { return r.sender.id.toString() === userId.toString(); }), reportAgainstMeList: reports.filter(function (r) { return r.reported.id.toString() === userId.toString(); }) })
                        })];
                case 5:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.getUserInfo = getUserInfo;
var updateNickname = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt_user, nickname, db_users, db_user, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt_user = req.user;
                    nickname = req.body.nickname;
                    if (!utils.checkNickname(nickname)) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user
                            .getModel()
                            .find({
                            nickname: req.body.nickname,
                            _id: {
                                $ne: jwt_user.id
                            }
                        })
                            .exec()];
                case 2:
                    db_users = _a.sent();
                    if (db_users.length > 0) {
                        return [2 /*return*/, res.status(409).json({
                                error: false,
                                errormessage: 'DUPLICATE_NICKNAME',
                            })];
                    }
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: jwt_user.id
                        })
                            .exec()];
                case 3:
                    db_user = _a.sent();
                    db_user.setNickname(nickname);
                    db_user
                        .save()
                        .then(function (data) {
                        var newToken = {
                            email: jwt_user.email,
                            id: jwt_user.id,
                            nickname: nickname
                        };
                        var token_signed = jsonwt.sign(newToken, utils.getJWTSecret(), {
                            expiresIn: utils.getJWTExpires()
                        });
                        return res.status(200).json({
                            error: false,
                            errormessage: "",
                            new_token: token_signed
                        });
                    })
                        .catch(function (reason) {
                        console.log("Oh?", reason);
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                case 5: return [3 /*break*/, 7];
                case 6:
                    try {
                        return [2 /*return*/, res.status(412).json({
                                error: true,
                                errormessage: error_string.NICKNAME_INVALID
                            })];
                    }
                    catch (e) {
                        return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                    }
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.updateNickname = updateNickname;
var updateInfo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt_user, toUpdate, db_users, db_user, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt_user = req.user;
                    toUpdate = {
                        sex: req.body.sex,
                        age: req.body.age,
                        educationalQualification: req.body.educationalQualification,
                        nickname: req.body.nickname
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user
                            .getModel()
                            .find({
                            nickname: req.body.nickname,
                            _id: {
                                $ne: jwt_user.id
                            }
                        })
                            .exec()];
                case 2:
                    db_users = _a.sent();
                    if (db_users.length > 0) {
                        return [2 /*return*/, res.status(409).json({
                                error: false,
                                errormessage: 'DUPLICATE_NICKNAME',
                            })];
                    }
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: jwt_user.id
                        })
                            .exec()];
                case 3:
                    db_user = _a.sent();
                    db_user.setInfo(toUpdate);
                    db_user
                        .save()
                        .then(function (data) {
                        var newToken = {
                            email: jwt_user.email,
                            id: jwt_user.id,
                            nickname: toUpdate.nickname
                        };
                        var token_signed = jsonwt.sign(newToken, utils.getJWTSecret(), {
                            expiresIn: utils.getJWTExpires()
                        });
                        return res.status(200).json({
                            error: false,
                            errormessage: "",
                            new_token: token_signed
                        });
                    })
                        .catch(function (reason) {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.updateInfo = updateInfo;
var banUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userToBan, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, user
                        .getModel()
                        .findOne({
                        _id: userId
                    })
                        .exec()];
            case 2:
                userToBan = _a.sent();
                userToBan.ban();
                userToBan.save().then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var objToSend;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, data.getFullInfo()];
                            case 1:
                                objToSend = _a.sent();
                                return [2 /*return*/, res.status(200).json({
                                        error: false,
                                        errormessage: "",
                                        user: objToSend,
                                    })];
                        }
                    });
                }); }).catch(function (reason) {
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                console.log(e_4);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.banUser = banUser;
var unbanUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userToBan, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, user
                        .getModel()
                        .findOne({
                        _id: userId
                    })
                        .exec()];
            case 2:
                userToBan = _a.sent();
                userToBan.unban();
                userToBan.save().then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var objToSend;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, data.getFullInfo()];
                            case 1:
                                objToSend = _a.sent();
                                return [2 /*return*/, res.status(200).json({
                                        error: false,
                                        errormessage: "",
                                        user: objToSend,
                                    })];
                        }
                    });
                }); }).catch(function (reason) {
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [3 /*break*/, 4];
            case 3:
                e_5 = _a.sent();
                console.log(e_5);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.unbanUser = unbanUser;
var getAllUsers = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var allUsers, usersToReturn, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user
                        .getModel()
                        .find({
                        nickname: { $ne: "" }
                    })
                        .exec()];
            case 1:
                allUsers = _a.sent();
                usersToReturn = allUsers.map(function (user) {
                    return user.getFullInfo();
                });
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        data: usersToReturn
                    })];
            case 2:
                e_6 = _a.sent();
                console.log(e_6);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllUsers = getAllUsers;
