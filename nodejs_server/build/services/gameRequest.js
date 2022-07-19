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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameRequest = exports.getPlayersByNickname = exports.getPlayers = exports.getRequests = exports.createGameRequest = void 0;
var user = require("../models/user");
var gameRequestModel = require("../models/gameRequest");
var error_string = require("../error_string").ErrorString;
var ObjectId = require('mongodb').ObjectId;
var utils = require("../utils");
var reportModel = require("../models/report");
var socket = require('./socket').getSockets();
var createGameRequest = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt_user, receiverId, playerId, grModel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt_user = req.user;
                receiverId = req.params.id_receiver;
                playerId = req.user.id;
                return [4 /*yield*/, gameRequestModel.newModel(jwt_user.id, receiverId)];
            case 1:
                grModel = _a.sent();
                grModel.save()
                    .then(function (data) {
                    try {
                        var idOtherPlayer = receiverId;
                        var s = socket.getSocket(idOtherPlayer);
                        if (s) {
                            s.emit('reload_requests');
                            s.emit('new_game_request', jwt_user.nickname);
                        }
                        return res.status(200).json({
                            error: false,
                            message: "",
                        });
                    }
                    catch (e) {
                        return next(utils.createError(500, "Errore impreviso"));
                    }
                })
                    .catch(function (reason) {
                    console.log(reason);
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [2 /*return*/];
        }
    });
}); };
exports.createGameRequest = createGameRequest;
var getRequests = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt_user, reports, playersToIgnore, requests, requestToReturn, i, req_1, reqToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt_user = req.user;
                return [4 /*yield*/, reportModel
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
                        .exec()];
            case 1:
                reports = _a.sent();
                playersToIgnore = reports.map(function (r) {
                    return r.idReported;
                });
                return [4 /*yield*/, gameRequestModel
                        .getModel()
                        .find({
                        $and: [
                            {
                                $or: [
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
                                    $nin: playersToIgnore.map(function (p) { return ObjectId(p); })
                                }
                            },
                            {
                                idReceiver: {
                                    $nin: playersToIgnore.map(function (p) { return ObjectId(p); })
                                }
                            }
                        ]
                    })];
            case 2:
                requests = _a.sent();
                requestToReturn = [];
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < requests.length)) return [3 /*break*/, 6];
                req_1 = requests[i];
                return [4 /*yield*/, req_1.getFullInfo()];
            case 4:
                reqToReturn = _a.sent();
                requestToReturn.push(reqToReturn);
                _a.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, res.status(200).json({
                    error: false,
                    errormessage: "",
                    requests: requestToReturn,
                })];
        }
    });
}); };
exports.getRequests = getRequests;
var searchPlayers = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt_user, reports, playersToIgnore, playersToAvoid, players, playersToReturn, i, p, pToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt_user = req.user;
                return [4 /*yield*/, reportModel
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
                        .exec()];
            case 1:
                reports = _a.sent();
                playersToIgnore = reports.map(function (r) {
                    return r.idReported;
                });
                playersToAvoid = __spreadArrays([jwt_user.id], playersToIgnore);
                return [4 /*yield*/, user
                        .getModel()
                        .find({
                        _id: {
                            $nin: playersToAvoid.map(function (p) { return ObjectId(p); })
                        },
                        nickname: {
                            $ne: ""
                        }
                    })];
            case 2:
                players = _a.sent();
                playersToReturn = [];
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < players.length)) return [3 /*break*/, 6];
                p = players[i];
                return [4 /*yield*/, p.getFullInfo()];
            case 4:
                pToReturn = _a.sent();
                playersToReturn.push(pToReturn);
                _a.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, playersToReturn];
        }
    });
}); };
var getPlayers = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var playersToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, searchPlayers(req, res, next)];
            case 1:
                playersToReturn = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        players: playersToReturn,
                    })];
        }
    });
}); };
exports.getPlayers = getPlayers;
var getPlayersByNickname = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var nick, playersToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nick = req.params.nickname;
                return [4 /*yield*/, searchPlayers(req, res, next)];
            case 1:
                playersToReturn = _a.sent();
                playersToReturn = playersToReturn.filter(function (p) {
                    return p.nickname.toLowerCase().includes(nick.toLowerCase());
                });
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        players: playersToReturn,
                    })];
        }
    });
}); };
exports.getPlayersByNickname = getPlayersByNickname;
var deleteGameRequest = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var gameRequestID, gameRequest, otherPlayerId, s;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gameRequestID = req.params.id_game_request;
                return [4 /*yield*/, gameRequestModel
                        .getModel()
                        .findOne({ _id: gameRequestID })];
            case 1:
                gameRequest = _a.sent();
                otherPlayerId = gameRequest.idSender;
                s = socket.getSocket(otherPlayerId);
                if (s) {
                    s.emit('reload_requests');
                }
                return [4 /*yield*/, gameRequestModel.getModel().deleteOne({ _id: gameRequestID })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        message: "",
                    })];
        }
    });
}); };
exports.deleteGameRequest = deleteGameRequest;
