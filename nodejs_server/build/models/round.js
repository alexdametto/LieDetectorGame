"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRound = exports.getSchema = exports.getModel = void 0;
var mongoose = require("mongoose");
var roundSchema = new mongoose.Schema({
    idGame: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    imageId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    videoId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    truth: {
        type: mongoose.SchemaTypes.Boolean,
        default: null
    },
    answer: {
        type: mongoose.SchemaTypes.Boolean,
        default: null
    }
}, {
    timestamps: true
});
roundSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
roundSchema.methods.setTruth = function (truth) {
    this.truth = truth;
};
roundSchema.methods.setAnswer = function (answer) {
    this.answer = answer;
};
roundSchema.methods.setVideoId = function (videoId) {
    this.videoId = videoId;
};
roundSchema.methods.setImageId = function (imageId) {
    this.imageId = imageId;
};
roundSchema.methods.getFullInfo = function () {
    return {
        id: this._id,
        idGame: this.idGame,
        imageId: this.imageId,
        videoId: this.videoId,
        truth: this.truth,
        answer: this.answer
    };
};
function getSchema() {
    return roundSchema;
}
exports.getSchema = getSchema;
var roundModel;
function getModel() {
    if (!roundModel) {
        roundModel = mongoose.model("round", getSchema());
    }
    return roundModel;
}
exports.getModel = getModel;
function newRound(idGame) {
    var _roundModel = getModel();
    var round = new _roundModel({
        idGame: idGame
    });
    return round;
}
exports.newRound = newRound;
