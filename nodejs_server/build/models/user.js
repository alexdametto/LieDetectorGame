"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchema = exports.getModel = exports.newUser = void 0;
var mongoose = require("mongoose");
var crypto = require("crypto");
var SocketService = require('../services/socket');
var userSchema = new mongoose.Schema({
    nickname: {
        type: mongoose.SchemaTypes.String,
        default: ""
    },
    email: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    admin: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    points: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
        required: true
    },
    win: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
        required: true
    },
    lose: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
        required: true
    },
    draws: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
        required: true
    },
    banned: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
    sex: {
        type: mongoose.SchemaTypes.String,
        default: 'NOT_DEFINED'
    },
    age: {
        type: mongoose.SchemaTypes.Number,
        default: -1,
        required: true
    },
    educationalQualification: {
        type: mongoose.SchemaTypes.String,
        default: 'NOT_DEFINED'
    },
    participate: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
    dataProcessing: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
    publishingImages: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    },
}, {
    timestamps: true
});
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
userSchema.methods.getInfo = function () {
    var fullInfo = {
        id: this._id,
        nickname: this.nickname,
        email: this.email,
        banned: this.banned,
        online: SocketService.getSockets().checkIfExist(this._id)
    };
    return fullInfo;
};
userSchema.methods.getFullInfo = function () {
    var fullInfo = {
        id: this._id,
        nickname: this.nickname,
        email: this.email,
        points: this.points,
        wins: this.win,
        losses: this.lose,
        draws: this.draws,
        banned: this.banned,
        sex: this.sex,
        age: this.age,
        admin: this.admin,
        educationalQualification: this.educationalQualification,
        online: SocketService.getSockets().checkIfExist(this._id)
    };
    return fullInfo;
};
userSchema.methods.setAdmin = function (admin) {
    this.admin = admin;
};
userSchema.methods.addPoints = function (points) {
    this.points = this.points + points;
};
userSchema.methods.addWin = function () {
    this.win++;
};
userSchema.methods.addLose = function () {
    this.lose++;
};
userSchema.methods.addDraw = function () {
    this.draws++;
};
userSchema.methods.setNickname = function (nickname) {
    this.nickname = nickname;
};
userSchema.methods.updatePersonalInfo = function (info) {
    this.age = info.age;
    this.sex = info.sex;
    this.educationalQualification = info.educationalQualification;
};
userSchema.methods.setInfo = function (info) {
    this.age = info.age;
    this.sex = info.sex;
    this.educationalQualification = info.educationalQualification;
    this.setNickname(info.nickname);
};
userSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString("hex");
    var hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    this.password = hmac.digest("hex"); // The final digest depends both by the password and the salt
};
userSchema.methods.validatePassword = function (pwd) {
    var hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    var digest = hmac.digest("hex");
    return this.password === digest;
};
userSchema.methods.ban = function () {
    this.banned = true;
};
userSchema.methods.unban = function () {
    this.banned = false;
};
function getSchema() {
    return userSchema;
}
exports.getSchema = getSchema;
var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model("users", getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function newUser(data) {
    var _usermodel = getModel();
    var user = new _usermodel(data);
    return user;
}
exports.newUser = newUser;
