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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrivacy = exports.setConsent = exports.transformAdmin = exports.deleteUser = exports.changeUserInfo = exports.getAllGameRequests = exports.getAllReports = exports.getAllRounds = exports.getAllGames = exports.getAllUsers = exports.downloadImage = exports.getAllImages = exports.downloadVideo = exports.getAllVideo = exports.getLeaderboard = exports.getStats = exports.changePassword = void 0;
var fs = require('fs');
var UploadUtils = require("../uploadUtils").UploadUtils;
var ObjectId = require('mongodb').ObjectId;
var jsonwt = require("jsonwebtoken"); // JWT generation
var user = require("../models/user");
var game = require("../models/game");
var round = require("../models/round");
var report = require("../models/report");
var gameRequest = require("../models/gameRequest");
var error_string = require("../error_string").ErrorString;
var utils = require("../utils");
var secretJWT = utils.getJWTSecret();
var socket = require('./socket').getSockets();
var setConsent = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var consent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consent = req.body.consent;
                    return [4 /*yield*/, fs.writeFileSync('./assets/CONSENT.txt', consent)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            message: "",
                        })];
            }
        });
    });
};
exports.setConsent = setConsent;
var setPrivacy = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var privacy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privacy = req.body.privacy;
                    return [4 /*yield*/, fs.writeFileSync('./assets/PRIVACY.txt', privacy)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            message: "",
                        })];
            }
        });
    });
};
exports.setPrivacy = setPrivacy;
var transformAdmin = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, isAdmin, userToAdmin;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.body.userId;
                    isAdmin = req.body.admin;
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: userId
                        })
                            .exec()];
                case 1:
                    userToAdmin = _a.sent();
                    if (!userToAdmin) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "User not found.",
                            })];
                    }
                    userToAdmin.setAdmin(isAdmin);
                    userToAdmin.save().then(function (newUser) { return __awaiter(_this, void 0, void 0, function () {
                        var infoToReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, newUser.getFullInfo()];
                                case 1:
                                    infoToReturn = _a.sent();
                                    return [2 /*return*/, res.status(200).json({
                                            error: false,
                                            message: "",
                                            user: infoToReturn
                                        })];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.transformAdmin = transformAdmin;
var deleteUser = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userToRecover, games, gamesID, i, game_1, gameID, i, game_2, gameID, otherPlayerID, s, requests, i, req_1, otherPlayerID, s;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.body.userId;
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
                    return [4 /*yield*/, UploadUtils.getGfs()
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
                                        return [4 /*yield*/, UploadUtils.getGfs().delete(file._id)];
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
                        game_1 = games[i];
                        gameID = game_1._id;
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
                        game_2 = games[i];
                        gameID = game_2._id;
                        otherPlayerID = "";
                        if (game_2.idPlayer1 === userId) {
                            otherPlayerID = game_2.idPlayer2;
                        }
                        else {
                            otherPlayerID = game_2.idPlayer1;
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
var changeUserInfo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userInfo, db_users, userToChange;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.body.userId;
                    userInfo = {
                        sex: req.body.sex,
                        age: req.body.age,
                        educationalQualification: req.body.educationalQualification,
                        nickname: req.body.nickname
                    };
                    return [4 /*yield*/, user
                            .getModel()
                            .find({
                            nickname: req.body.nickname,
                            _id: {
                                $ne: userId
                            }
                        })
                            .exec()];
                case 1:
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
                            _id: userId
                        })
                            .exec()];
                case 2:
                    userToChange = _a.sent();
                    if (!userToChange) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "USER_NOT_FOUND",
                            })];
                    }
                    userToChange.setInfo(userInfo);
                    userToChange.save().then(function (newUser) { return __awaiter(_this, void 0, void 0, function () {
                        var infoToReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, newUser.getFullInfo()];
                                case 1:
                                    infoToReturn = _a.sent();
                                    return [2 /*return*/, res.status(200).json({
                                            error: false,
                                            message: "",
                                            user: infoToReturn
                                        })];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.changeUserInfo = changeUserInfo;
var changePassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userToChangePassword;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.body.userId;
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: userId
                        })
                            .exec()];
                case 1:
                    userToChangePassword = _a.sent();
                    if (!userToChangePassword) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "USER_NOT_FOUND",
                            })];
                    }
                    userToChangePassword.setPassword(req.body.newPassword);
                    userToChangePassword.save().then(function (newUser) { return __awaiter(_this, void 0, void 0, function () {
                        var infoToReturn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, newUser.getFullInfo()];
                                case 1:
                                    infoToReturn = _a.sent();
                                    return [2 /*return*/, res.status(200).json({
                                            error: false,
                                            message: "",
                                            user: infoToReturn
                                        })];
                            }
                        });
                    }); })
                        .catch(function (reason) {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.changePassword = changePassword;
var getStats = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var db_users, db_games;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user
                        .getModel()
                        .find({
                        nickname: { $ne: "" },
                        banned: false
                    })
                        .exec()];
                case 1:
                    db_users = _a.sent();
                    return [4 /*yield*/, game
                            .getModel()
                            .find({})
                            .exec()];
                case 2:
                    db_games = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            data: {
                                totalUsers: db_users.length,
                                totalGames: db_games.length,
                                activeGames: db_games.filter(function (g) { return g.idWinner === null; }).length
                            }
                        })];
            }
        });
    });
};
exports.getStats = getStats;
var getLeaderboard = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers, byWins, byRate, byMatches, byPoints;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user
                        .getModel()
                        .find({ nickname: { $ne: "" }, banned: false })
                        .exec()];
                case 1:
                    allUsers = _a.sent();
                    byWins = __spreadArrays(allUsers);
                    byWins = byWins.sort(function (a, b) {
                        return b.win - a.win;
                    });
                    byWins = byWins.slice(0, 20).map(function (elem) { return elem.getFullInfo(); });
                    byRate = __spreadArrays(allUsers);
                    byRate.sort(function (a, b) {
                        if (b.win + b.lose + b.draws === 0) {
                            return -1;
                        }
                        else if (a.win + a.lose + a.draws === 0) {
                            return 1;
                        }
                        return (b.win / (b.win + b.lose + b.draws)) - (a.win / (a.win + a.lose + a.draws));
                    });
                    byRate = byRate.slice(0, 20).map(function (elem) { return elem.getFullInfo(); });
                    byMatches = __spreadArrays(allUsers);
                    byMatches.sort(function (a, b) {
                        return ((b.win + b.lose + b.draws)) - ((a.win + a.lose + a.draws));
                    });
                    byMatches = byMatches.slice(0, 20).map(function (elem) { return elem.getFullInfo(); });
                    byPoints = __spreadArrays(allUsers);
                    byPoints.sort(function (a, b) {
                        return b.points - a.points;
                    });
                    byPoints = byPoints.slice(0, 20).map(function (elem) { return elem.getFullInfo(); });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            data: {
                                byWins: byWins,
                                byRate: byRate,
                                byMatches: byMatches,
                                byPoints: byPoints
                            }
                        })];
            }
        });
    });
};
exports.getLeaderboard = getLeaderboard;
var getAllImages = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var gridFs, images;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    gridFs = UploadUtils.getGfs();
                    return [4 /*yield*/, gridFs.find({ contentType: { $ne: "video/mp4" } }).toArray()];
                case 1:
                    images = _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            images: images
                        })];
            }
        });
    });
};
exports.getAllImages = getAllImages;
var downloadImage = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId;
        return __generator(this, function (_a) {
            if (req.user.email !== process.env.EMAIL) {
                return [2 /*return*/, res.status(403).json({
                        error: true,
                        errormessage: ""
                    })];
            }
            fileId = req.params.id;
            UploadUtils.getGfs()
                .find({ _id: ObjectId(fileId) })
                .toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID(files[0]._id.toString())).pipe(res);
            });
            return [2 /*return*/];
        });
    });
};
exports.downloadImage = downloadImage;
var getAllVideo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var gridFs, rounds, videos, images, videosToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    gridFs = UploadUtils.getGfs();
                    return [4 /*yield*/, round
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    rounds = _a.sent();
                    return [4 /*yield*/, gridFs.find({ contentType: "video/mp4" }).toArray()];
                case 2:
                    videos = _a.sent();
                    return [4 /*yield*/, gridFs.find({ contentType: { $ne: "video/mp4" } }).toArray()];
                case 3:
                    images = _a.sent();
                    videosToReturn = videos.map(function (v) {
                        var videoToReturn = __assign({}, v);
                        if (!videoToReturn.metadata) {
                            videoToReturn.metadata = {};
                        }
                        var videoRound = rounds.find(function (r) {
                            return r.videoId && r.videoId.toString() === v._id.toString();
                        });
                        if (videoRound) {
                            var videoImage = images.find(function (img) {
                                return videoRound.imageId.toString() && videoRound.imageId === img._id.toString();
                            });
                            videoToReturn.metadata.imageId = videoRound.imageId;
                            videoToReturn.metadata.answer = videoRound.answer;
                            if (videoImage && videoImage.metadata) {
                                videoToReturn.metadata.imageComplexity = videoImage.metadata.complexity;
                            }
                        }
                        return videoToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            videos: videosToReturn
                        })];
            }
        });
    });
};
exports.getAllVideo = getAllVideo;
var downloadVideo = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId;
        return __generator(this, function (_a) {
            if (req.user.email !== process.env.EMAIL) {
                return [2 /*return*/, res.status(403).json({
                        error: true,
                        errormessage: ""
                    })];
            }
            fileId = req.params.id;
            UploadUtils.getGfs()
                .find({ _id: ObjectId(fileId), contentType: "video/mp4" })
                .toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID(files[0]._id.toString())).pipe(res);
            });
            return [2 /*return*/];
        });
    });
};
exports.downloadVideo = downloadVideo;
var getAllUsers = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers, usersToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    return [4 /*yield*/, user
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    allUsers = _a.sent();
                    usersToReturn = allUsers.map(function (u) {
                        var objectToReturn = u.toJSON();
                        delete objectToReturn.password;
                        delete objectToReturn.salt;
                        return objectToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            users: usersToReturn
                        })];
            }
        });
    });
};
exports.getAllUsers = getAllUsers;
var getAllGames = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allGames, gamesToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    return [4 /*yield*/, game
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    allGames = _a.sent();
                    gamesToReturn = allGames.map(function (u) {
                        var objectToReturn = u.toJSON();
                        return objectToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            games: gamesToReturn
                        })];
            }
        });
    });
};
exports.getAllGames = getAllGames;
var getAllRounds = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allRounds, roundsToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    return [4 /*yield*/, round
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    allRounds = _a.sent();
                    roundsToReturn = allRounds.map(function (u) {
                        var objectToReturn = u.toJSON();
                        return objectToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            rounds: roundsToReturn
                        })];
            }
        });
    });
};
exports.getAllRounds = getAllRounds;
var getAllReports = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allReports, reportsToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    return [4 /*yield*/, report
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    allReports = _a.sent();
                    reportsToReturn = allReports.map(function (u) {
                        var objectToReturn = u.toJSON();
                        return objectToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            reports: reportsToReturn
                        })];
            }
        });
    });
};
exports.getAllReports = getAllReports;
var getAllGameRequests = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var allGameRequests, requestsToReturn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.user.email !== process.env.EMAIL) {
                        return [2 /*return*/, res.status(403).json({
                                error: true,
                                errormessage: ""
                            })];
                    }
                    return [4 /*yield*/, gameRequest
                            .getModel()
                            .find({})
                            .exec()];
                case 1:
                    allGameRequests = _a.sent();
                    requestsToReturn = allGameRequests.map(function (u) {
                        var objectToReturn = u.toJSON();
                        return objectToReturn;
                    });
                    return [2 /*return*/, res.status(200).json({
                            error: false,
                            errormessage: "",
                            requests: requestsToReturn
                        })];
            }
        });
    });
};
exports.getAllGameRequests = getAllGameRequests;
