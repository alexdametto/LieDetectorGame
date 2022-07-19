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
exports.getRandomImage = exports.deleteAllimages = exports.deleteImage = exports.getImages = exports.uploadImageMultiple = exports.uploadImage = void 0;
var UploadUtils = require("../uploadUtils").UploadUtils;
var ObjectId = require('mongodb').ObjectId;
var jsonwt = require("jsonwebtoken"); // JWT generation
var user = require("../models/user");
var error_string = require("../error_string").ErrorString;
var utils = require("../utils");
var secretJWT = utils.getJWTSecret();
var uploadImageMultiple = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, res.status(200).json({
                    error: false,
                    errormessage: "",
                })];
        });
    });
};
exports.uploadImageMultiple = uploadImageMultiple;
var uploadImage = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, res.status(200).json({
                    error: false,
                    errormessage: "",
                })];
        });
    });
};
exports.uploadImage = uploadImage;
var getImages = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName;
        return __generator(this, function (_a) {
            fileName = "GameImage";
            UploadUtils.getGfs()
                .find({ filename: fileName })
                .toArray(function (err, files) {
                return res.status(200).json({
                    error: false,
                    message: "",
                    images: files
                });
            });
            return [2 /*return*/];
        });
    });
};
exports.getImages = getImages;
var deleteAllimages = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, UploadUtils.getGfs()
                        .find({ 'filename': 'GameImage' })
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
exports.deleteAllimages = deleteAllimages;
var deleteImage = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId;
        return __generator(this, function (_a) {
            fileId = req.params.image_id;
            UploadUtils.getGfs().delete(ObjectId(fileId)).then(function (data) {
                return res.status(200).json({
                    error: false,
                    errormessage: "",
                });
            }).catch(function (err) {
                return res.status(500).json({
                    error: true,
                    errormessage: "Error while deleting image",
                });
            });
            return [2 /*return*/];
        });
    });
};
exports.deleteImage = deleteImage;
var getRandomImage = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var avoidIds, image;
        return __generator(this, function (_a) {
            avoidIds = req.query.avoid ? req.query.avoid.split(",").filter(function (e) { return e !== 'no-content'; }).map(function (e) { return ObjectId(e); }) : [];
            image = UploadUtils.getGfs()
                .find({
                _id: { $nin: avoidIds },
                filename: "GameImage"
            }).toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                var index = Math.round(Math.random() * (files.length - 1));
                res.setHeader("image-id", files[index]._id.toString());
                UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID(files[index]._id.toString())).pipe(res);
            });
            return [2 /*return*/];
        });
    });
};
exports.getRandomImage = getRandomImage;
