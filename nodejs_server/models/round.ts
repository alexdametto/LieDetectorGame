"use strict";

const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
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
},
{
	timestamps: true
});

roundSchema.pre('save', function(this: any, next: any) {
	this.updatedAt = Date.now();
	next();
});


roundSchema.methods.setTruth = function(truth : boolean) {
    this.truth = truth;
}

roundSchema.methods.setAnswer = function(answer : boolean) {
    this.answer = answer;
}

roundSchema.methods.setVideoId = function(videoId : string) {
    this.videoId = videoId;
}

roundSchema.methods.setImageId = function(imageId : string) {
    this.imageId = imageId;
}

roundSchema.methods.getFullInfo = function() {
    return {
        id: this._id,
        idGame: this.idGame,
        imageId: this.imageId,
        videoId: this.videoId,
        truth: this.truth,
        answer: this.answer
    }
}

function getSchema() {
	return roundSchema;
}

let roundModel : any;
function getModel() {
	if (!roundModel) {
		roundModel = mongoose.model("round", getSchema());
	}
	return roundModel;
}


function newRound(idGame: string) {
    var _roundModel = getModel();
    var round = new _roundModel({
        idGame: idGame
    });
    return round;
}

export {
    getModel,
    getSchema,
    newRound
}