"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const utils = require("../utils");

var gameRequestSchema = new mongoose.Schema({
	idSender: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    idReceiver: {
        type: mongoose.SchemaTypes.String,
        default: null
    }
},
{
	timestamps: true
});

gameRequestSchema.pre('save', function(this: any, next: any) {
	this.updatedAt = Date.now();
	next();
});


gameRequestSchema.methods.getFullInfo = async function() {
    const sender = await utils.getUserInfo(this.idSender);
    const receiver = await utils.getUserInfo(this.idReceiver);

    return {
        id: this._id,
        sender: sender,
        receiver: receiver,
        updatedAt: this.updatedAt,
        createdAt: this.createdAt
    }
}

function getSchema() {
	return gameRequestSchema;
}

let gameRequestSchemaModel : any;
function getModel() {
	if (!gameRequestSchemaModel) {
		gameRequestSchemaModel = mongoose.model("game_request", getSchema());
	}
	return gameRequestSchemaModel;
}

function newModel(idSender: string, idReceiver: string) {
    var _gameRequestModel = getModel();
    var gameRequest = new _gameRequestModel({
        idSender: idSender,
        idReceiver: idReceiver,
    });
    return gameRequest;
}

export {
    getModel,
    getSchema,
    newModel
}