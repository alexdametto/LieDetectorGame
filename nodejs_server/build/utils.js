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
exports.startDB = exports.getRoundsInfo = exports.getGameInfo = exports.getUserNickname = exports.getUserId = exports.decodeToken = exports.createError = exports.getJWTExpires = exports.checkNickname = exports.getJWTSecret = exports.getRoundInfo = exports.getUserInfo = exports.nicknamePattern = void 0;
var jwtDecode = require("jwt-decode");
var user = require("./models/user");
var round = require("./models/round");
var game = require("./models/game");
var crypto = require("crypto");
var nicknamePattern = "^[a-zA-Z0-9_-]{3,8}$";
exports.nicknamePattern = nicknamePattern;
var getUserInfo = function (id) {
    return __awaiter(this, void 0, void 0, function () {
        var u, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: id
                        })
                            .exec()];
                case 1:
                    u = _a.sent();
                    if (!u) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, u.getInfo()];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.getUserInfo = getUserInfo;
var getGameInfo = function (id) {
    return __awaiter(this, void 0, void 0, function () {
        var g, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, game
                            .getModel()
                            .findOne({
                            _id: id
                        })
                            .exec()];
                case 1:
                    g = _a.sent();
                    if (!g) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, g.getFullInfo()];
                case 2:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.getGameInfo = getGameInfo;
var getRoundInfo = function (id) {
    return __awaiter(this, void 0, void 0, function () {
        var r, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, round
                            .getModel()
                            .findOne({
                            _id: id
                        })
                            .exec()];
                case 1:
                    r = _a.sent();
                    if (!r) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, r.getFullInfo()];
                case 2:
                    e_3 = _a.sent();
                    console.log(e_3);
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.getRoundInfo = getRoundInfo;
var getRoundsInfo = function (ids) {
    return __awaiter(this, void 0, void 0, function () {
        var roundsFromDb, rounds, _loop_1, i, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, round
                            .getModel()
                            .find({
                            _id: {
                                $in: ids
                            }
                        })
                            .exec()];
                case 1:
                    roundsFromDb = _a.sent();
                    rounds = [];
                    _loop_1 = function () {
                        var id, roundFromDB, roundToPush;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = ids[i];
                                    roundFromDB = roundsFromDb.filter(function (r) {
                                        return r._id.toString() === id;
                                    })[0];
                                    return [4 /*yield*/, roundFromDB.getFullInfo()];
                                case 1:
                                    roundToPush = _a.sent();
                                    rounds.push(roundToPush);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < ids.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, rounds];
                case 6:
                    e_4 = _a.sent();
                    console.log(e_4);
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.getRoundsInfo = getRoundsInfo;
var getJWTSecret = function () {
    return process.env.JWT_SECRET;
};
exports.getJWTSecret = getJWTSecret;
var checkNickname = function (new_nickname) {
    return RegExp(nicknamePattern).test(new_nickname);
};
exports.checkNickname = checkNickname;
var getJWTExpires = function () {
    return process.env.TK_EXPIRE;
};
exports.getJWTExpires = getJWTExpires;
var createError = function (code, msg) {
    return {
        statusCode: code,
        error: true,
        message: msg
    };
};
exports.createError = createError;
var decodeToken = function (tk) {
    return jwtDecode(tk);
};
exports.decodeToken = decodeToken;
var getUserId = function (req) {
    var tk = req.get("Authorization").split(" ")[1];
    return jwtDecode(tk).id;
};
exports.getUserId = getUserId;
var getUserNickname = function (req) {
    var tk = req.get("Authorization").split(" ")[1];
    return jwtDecode(tk).nickname;
};
exports.getUserNickname = getUserNickname;
var startDB = function () {
    return __awaiter(this, void 0, void 0, function () {
        var u, newUser, hashedPsw, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, user.getModel().findOne({
                            email: process.env.EMAIL
                        }).exec()];
                case 1:
                    u = _a.sent();
                    if (!!u) return [3 /*break*/, 3];
                    console.log("Admin non trovato, creo una nuova utenza".yellow);
                    newUser = user.newUser({
                        nickname: "Admin",
                        email: process.env.EMAIL,
                        admin: true,
                    });
                    hashedPsw = crypto.createHash('sha512').update(process.env.ADMIN_PASSWORD).digest('hex');
                    newUser.setPassword(hashedPsw);
                    return [4 /*yield*/, newUser.save()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    console.log("L'utenza admin esiste già.".green);
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_5 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.startDB = startDB;
