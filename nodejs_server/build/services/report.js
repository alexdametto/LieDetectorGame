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
exports.getReportsByUser = exports.getReportsByUserGeneric = exports.getReport = exports.closeReport = exports.getReports = exports.createVideoReport = exports.createReport = void 0;
var UploadUtils = require("../uploadUtils").UploadUtils;
var ObjectId = require('mongodb').ObjectId;
var jsonwt = require("jsonwebtoken"); // JWT generation
var user = require("../models/user");
var reportModel = require("../models/report");
var gameModel = require("../models/game");
var error_string = require("../error_string").ErrorString;
var utils = require("../utils");
var secretJWT = utils.getJWTSecret();
var createReport = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt_user, game_id, reported_id, type, report, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt_user = req.user;
                game_id = req.params.id_game;
                reported_id = req.params.id_reported;
                type = req.body.type;
                return [4 /*yield*/, reportModel.newModel(jwt_user.id, reported_id, game_id, null, type, req.body.description, req.body.reason)];
            case 1:
                report = _a.sent();
                return [4 /*yield*/, gameModel
                        .getModel()
                        .findOne({
                        _id: game_id
                    })
                        .exec()];
            case 2:
                game = _a.sent();
                game.setfrozen(true);
                game.save().then(function (gameData) {
                    report.save()
                        .then(function (data) {
                        try {
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
                }).catch(function (reason) {
                    console.log(reason);
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [2 /*return*/];
        }
    });
}); };
exports.createReport = createReport;
var createVideoReport = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt_user, game_id, reported_id, video_id, type, report, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt_user = req.user;
                game_id = req.params.id_game;
                reported_id = req.params.id_reported;
                video_id = req.params.id_video;
                type = "VIDEO";
                return [4 /*yield*/, reportModel.newModel(jwt_user.id, reported_id, game_id, video_id, type, "", req.body.reason)];
            case 1:
                report = _a.sent();
                return [4 /*yield*/, gameModel
                        .getModel()
                        .findOne({
                        _id: game_id
                    })
                        .exec()];
            case 2:
                game = _a.sent();
                game.setfrozen(true);
                game.save().then(function (gameData) {
                    report.save()
                        .then(function (data) {
                        try {
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
                }).catch(function (reason) {
                    console.log(reason);
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [2 /*return*/];
        }
    });
}); };
exports.createVideoReport = createVideoReport;
var getReports = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var reports, reportsToReturn, i, report, reportToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, reportModel.getModel().find({}).exec()];
            case 1:
                reports = _a.sent();
                reportsToReturn = [];
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < reports.length)) return [3 /*break*/, 5];
                report = reports[i];
                return [4 /*yield*/, report.getFullInfo()];
            case 3:
                reportToReturn = _a.sent();
                reportsToReturn.push(reportToReturn);
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, res.status(200).json({
                    error: false,
                    errormessage: "",
                    reports: reportsToReturn
                })];
        }
    });
}); };
exports.getReports = getReports;
var getReport = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var report_id, report, objToSend, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                report_id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, reportModel
                        .getModel()
                        .findOne({
                        _id: report_id
                    })
                        .exec()];
            case 2:
                report = _a.sent();
                return [4 /*yield*/, report.getFullInfo()];
            case 3:
                objToSend = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        report: objToSend,
                    })];
            case 4:
                e_1 = _a.sent();
                console.log(e_1);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getReport = getReport;
var closeReport = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var report_id, report, game, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                report_id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, reportModel
                        .getModel()
                        .findOne({
                        _id: report_id
                    })
                        .exec()];
            case 2:
                report = _a.sent();
                report.close();
                return [4 /*yield*/, gameModel.getModel().findOne({
                        _id: report.idGame
                    })];
            case 3:
                game = _a.sent();
                game.setfrozen(false);
                return [4 /*yield*/, game.save()];
            case 4:
                _a.sent();
                report.save().then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var objToSend;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, data.getFullInfo()];
                            case 1:
                                objToSend = _a.sent();
                                return [2 /*return*/, res.status(200).json({
                                        error: false,
                                        errormessage: "",
                                        report: objToSend,
                                    })];
                        }
                    });
                }); }).catch(function (reason) {
                    return next(utils.createError(500, error_string.DATABASE_ERROR));
                });
                return [3 /*break*/, 6];
            case 5:
                e_2 = _a.sent();
                console.log(e_2);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.closeReport = closeReport;
var getReportsByUserGeneric = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var reports, reportsToReturn, i, report, reportToReturn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, reportModel
                    .getModel()
                    .find({
                    $or: [
                        {
                            idSender: userId
                        },
                        {
                            idReported: userId
                        }
                    ]
                })
                    .exec()];
            case 1:
                reports = _a.sent();
                reportsToReturn = [];
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < reports.length)) return [3 /*break*/, 5];
                report = reports[i];
                return [4 /*yield*/, report.getFullInfo()];
            case 3:
                reportToReturn = _a.sent();
                reportsToReturn.push(reportToReturn);
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, reportsToReturn];
        }
    });
}); };
exports.getReportsByUserGeneric = getReportsByUserGeneric;
var getReportsByUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, reports, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getReportsByUserGeneric(userId)];
            case 2:
                reports = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        error: false,
                        errormessage: "",
                        reports: reports,
                    })];
            case 3:
                e_3 = _a.sent();
                console.log(e_3);
                return [2 /*return*/, next(utils.createError(500, "Errore impreviso"))];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getReportsByUser = getReportsByUser;
