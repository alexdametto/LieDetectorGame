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
exports.isAdmin = exports.recoverPassword = exports.changePassword = exports.loginAdmin = exports.renew = exports.login = exports.autenticazione = exports.register = void 0;
var jsonwt = require("jsonwebtoken"); // JWT generation
var user = require("../models/user");
var error_string = require("../error_string").ErrorString;
var MailService = require("./mail");
var utils = require("../utils");
var secretJWT = utils.getJWTSecret();
var crypto = require("crypto");
var changePassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, newPassword, oldPassword, userToUpdate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.user.id;
                    newPassword = req.body.newPassword;
                    oldPassword = req.body.oldPassword;
                    console.log("userId", userId);
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            _id: userId
                        })
                            .exec()];
                case 1:
                    userToUpdate = _a.sent();
                    if (!userToUpdate) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "User not found",
                            })];
                    }
                    if (userToUpdate.validatePassword(oldPassword)) {
                        userToUpdate.setPassword(newPassword);
                        userToUpdate.save().then(function (newUser) {
                            return res.status(200).json({
                                error: false,
                                message: ""
                            });
                        })
                            .catch(function (reason) {
                            return next(utils.createError(500, error_string.DATABASE_ERROR));
                        });
                    }
                    else {
                        return [2 /*return*/, res.status(400).json({
                                error: true,
                                message: "Passwords not matching.",
                            })];
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports.changePassword = changePassword;
var recoverPassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var email, userToRecover, newPassword, specialChars, randomUppercase, randomLowercase, randomDigit, randomSpecialChar, otherChars, finalString, hashedPsw;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = req.body.email;
                    return [4 /*yield*/, user
                            .getModel()
                            .findOne({
                            email: email
                        })
                            .exec()];
                case 1:
                    userToRecover = _a.sent();
                    if (!userToRecover) {
                        return [2 /*return*/, res.status(404).json({
                                error: true,
                                message: "USER_NOT_FOUND",
                            })];
                    }
                    newPassword = "";
                    specialChars = ['@', '#', '$', '%', '^', '&', '+', '=', '!', '?'];
                    randomUppercase = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    randomLowercase = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                    randomDigit = Math.floor(Math.random() * 10);
                    randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
                    otherChars = crypto.randomBytes(Math.floor(Math.random() * 5) + 3).toString('hex');
                    finalString = randomUppercase + randomLowercase + randomDigit + randomSpecialChar + otherChars;
                    newPassword = finalString.split('').sort(function () { return 0.5 - Math.random(); }).join('');
                    hashedPsw = crypto.createHash('sha512').update(newPassword).digest('hex');
                    userToRecover.setPassword(hashedPsw);
                    //console.log(newPassword)
                    userToRecover.save().then(function (newUser) {
                        return res.status(200).json({
                            error: false,
                            message: ""
                        });
                        // commento codice invio mail
                        /*MailService.getMailService().sendMail({
                            from: `"LieDetectionGame" <${process.env.EMAIL}>`, // sender address
                            to: email, // list of receivers
                            subject: "Lie Detection App - Password reset", // Subject line
                            text: `Dear ${userToRecover.nickname}, this is your new password to access LieDetectionGame: ${newPassword}. You can now login with this new password and we advise you to change it immediately. LieDetection Team`, // plain text body
                            html: `Dear ${userToRecover.nickname}, <br> this is your new password to access LieDetectionGame: <b>${newPassword}</b>. <br> You can now login with this new password and we advise you to change it immediately. <br> LieDetection Team`, // html body
                        }).then((info: any) => {
                            return res.status(200).json({
                                error: false,
                                message: ""
                            });
                        }).catch((reason : any) => {
                            return next(utils.createError(500, "Errore invio email"));
                        });*/
                    })
                        .catch(function (reason) {
                        return next(utils.createError(500, error_string.DATABASE_ERROR));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.recoverPassword = recoverPassword;
var register = function (req, res, next) {
    var newUser = user.newUser({
        email: req.body.email,
        participate: req.body.participate,
        dataProcessing: req.body.dataProcessing,
        publishingImages: req.body.publishingImages
    });
    if (!req.body.password) {
        return next(utils.createError(412, error_string.USER_MISS_PASSWORD));
    }
    newUser.setPassword(req.body.password);
    newUser
        .save()
        .then(function (data) {
        var tokendata = {
            email: req.body.email,
            id: data._id,
            nickname: req.body.nickname,
        };
        var token = jsonwt.sign(tokendata, secretJWT, {
            expiresIn: utils.getJWTExpires(),
        });
        return res.status(200).json({
            error: false,
            message: "",
            token: token,
        });
    })
        .catch(function (reason) {
        if (reason.code === 11000)
            return next(utils.createError(409, error_string.USER_EXIST));
        /*if (reason.code === 17280)
            return next(utils.createError(412, error_string.NICKNAME_INVALID));*/
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });
};
exports.register = register;
var autenticazione = function (email, password, done) {
    user.getModel().findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(utils.createError(500, error_string.DATABASE_ERROR));
        }
        if (!user) {
            return done(utils.createError(404, error_string.USER_NOT_FOUND));
        }
        if (user.banned) {
            return done(utils.createError(401, error_string.USER_BANNED));
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done(utils.createError(401, error_string.USER_INVALID_PASSWORD));
    });
};
exports.autenticazione = autenticazione;
var login = function (req, res, next) {
    var tokendata = {
        email: req.user.email,
        id: req.user._id,
        nickname: req.user.nickname,
    };
    console.log("Nuovo login effettuato da " + req.user.email + ". Generazione JWT");
    var token = jsonwt.sign(tokendata, secretJWT, {
        expiresIn: utils.getJWTExpires(),
    });
    return res.status(200).json({
        error: false,
        message: "",
        token: token,
    });
};
exports.login = login;
var loginAdmin = function (req, res, next) {
    if (req && req.user && !req.user.admin) {
        return next(utils.createError(404, error_string.ADMIN_ONLY));
    }
    var tokendata = {
        email: req.user.email,
        id: req.user._id,
        nickname: req.user.nickname,
    };
    console.log("Nuovo login effettuato da " + req.user.email + ". Generazione JWT");
    var token = jsonwt.sign(tokendata, secretJWT, {
        expiresIn: utils.getJWTExpires(),
    });
    return res.status(200).json({
        error: false,
        message: "",
        token: token,
    });
};
exports.loginAdmin = loginAdmin;
var renew = function (req, res, next) {
    var id = utils.getUserId(req);
    user.getModel().findOne({
        _id: id,
    }, function (err, user) {
        if (err) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
        if (!user) {
            return next(utils.createError(404, error_string.USER_NOT_FOUND));
        }
        var tokendata = req.user;
        delete tokendata.iat;
        delete tokendata.exp;
        var newToken = {
            email: user.email,
            id: user._id,
            nickname: user.nickname,
        };
        //console.log("Rinnovo token per utente", JSON.stringify(tokendata));
        var token_signed = jsonwt.sign(newToken, secretJWT, {
            expiresIn: utils.getJWTExpires(),
        });
        return res.status(200).json({
            error: false,
            errormessage: "",
            token: token_signed,
        });
    });
};
exports.renew = renew;
// for ADMIN-ONLY endpoints
var isAdmin = function () {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, currentUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = utils.getUserId(req);
                        return [4 /*yield*/, user.getModel().findOne({
                                _id: id,
                            })];
                    case 1:
                        currentUser = _a.sent();
                        if (!currentUser || !currentUser.admin) {
                            return [2 /*return*/, res.status(403).send({
                                    error: true,
                                    errormessage: "This endpoint is only for admins."
                                })];
                        }
                        next();
                        return [2 /*return*/];
                }
            });
        });
    };
};
exports.isAdmin = isAdmin;
