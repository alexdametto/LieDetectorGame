"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const utils = require("../utils");

var reportSchema = new mongoose.Schema({
	idSender: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    idReported: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
	idGame: {
		type: mongoose.SchemaTypes.String,
        default: null
	},
	description: {
		type: mongoose.SchemaTypes.String,
        default: null
	},
    type: {
        type: String,
        enum: ["NO_TYPE", "NICKNAME", "VIDEO", "CHEAT", "ALTRO"],
        default: "NO_TYPE"
    },
	reason: {
		type: mongoose.SchemaTypes.String,
		required: true
	},
    closed: {
        type: mongoose.SchemaTypes.Boolean,
		default: false,
    },
    idVideo: {
        type: mongoose.SchemaTypes.String,
		default: null
    }
},
{
	timestamps: true
});

reportSchema.pre('save', function(this: any, next: any) {
	this.updatedAt = Date.now();
	next();
});


reportSchema.methods.getFullInfo = async function() {
    const sender = await utils.getUserInfo(this.idSender);
    const reported = await utils.getUserInfo(this.idReported);
    const game = await utils.getGameInfo(this.idGame);

    return {
        id: this._id,
        sender: sender,
        reported: reported,
        reason: this.reason,
        video: this.idVideo,
        description: this.description,
        game: game,
        closed: this.closed
    }
}

reportSchema.methods.close = function() {
    this.closed = true;
}

function getSchema() {
	return reportSchema;
}

let reportModel : any;
function getModel() {
	if (!reportModel) {
		reportModel = mongoose.model("report", getSchema());
	}
	return reportModel;
}

function newModel(idSender: string, idReported: string, idGame: string, idVideo: string, type: string, description: string | null, reason: string) {
    var _reportModel = getModel();
    var round = new _reportModel({
        idSender: idSender,
        idReported: idReported,
        idGame: idGame,
        idVideo: idVideo,
        type: type,
        description: description,
        reason: reason
    });
    return round;
}

export {
    getModel,
    getSchema,
    newModel
}