"use strict";

const mongoose = require("mongoose");
const { newRound } = require('./round');

const utils = require("../utils");

const gameSchema = new mongoose.Schema({
    rounds: [mongoose.SchemaTypes.String],
    idPlayer1: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    idPlayer2: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    joinable: {
		type: mongoose.SchemaTypes.Boolean,
		default: false,
	},
    surrendered: {
		type: mongoose.SchemaTypes.Boolean,
		default: false,
	},
    idWinner: {
		type: mongoose.SchemaTypes.String,
		default: null,
	},
    turnNumber: {
        type: mongoose.SchemaTypes.Number,
		default: 0,
    },
	frozen: {
		type: mongoose.SchemaTypes.Boolean,
		default: false,
	},
	closed: {
		type: mongoose.SchemaTypes.Boolean,
		default: false,
	}
},
{
	timestamps: true
});

gameSchema.pre('save', function(this: any, next: any) {
	this.updatedAt = Date.now();
	next();
});

gameSchema.methods.initGame = async function () {
	this.rounds = [];
    await this.addRound();
};

gameSchema.methods.getOtherPlayerId = function(playerId: string) {
	return this.idPlayer1 === playerId ? this.idPlayer2 : this.idPlayer1;
}

gameSchema.methods.finishGame = function() {
    this.turnNumber = -1;
}

gameSchema.methods.joinGame = function (id: string) {
	this.idPlayer2 = id;
	this.joinable = false;
};

gameSchema.methods.addRound = async function () {
    await newRound(this._id).save().then((round: any) => {
	    this.rounds.push(round.getFullInfo().id);
    })
};

gameSchema.methods.increaseTurnNumber = function() {
    this.turnNumber++;
}

gameSchema.methods.setIdWinner = function(idWinner: string) {
	this.idWinner = idWinner;
}

gameSchema.methods.setJoinable = function() {
	if(this.idPlayer2 === null) {
		this.joinable = true;
	}
}

gameSchema.methods.surrend = function(myId: string) {
	this.joinable = false;
	this.surrendered = true;
	this.idWinner = (myId == this.idPlayer1) ? this.idPlayer2 : this.idPlayer1;
	this.turnNumber = -1;
}

gameSchema.methods.getFullInfo = async function() {
    const rounds = await utils.getRoundsInfo(this.rounds);

    const player1 = await utils.getUserInfo(this.idPlayer1);
    const player2 = await utils.getUserInfo(this.idPlayer2);

	const punteggio = this.getScoreRound(this.idPlayer1, rounds);

	punteggio.player1 = punteggio.my_score;
	punteggio.player2 = punteggio.other_player;
	delete punteggio.my_score;
	delete punteggio.other_player;

	const tempScore = this.getScoreTemporaneaRound(this.idPlayer1, rounds);

	tempScore.player1 = tempScore.my_score;
	tempScore.player2 = tempScore.other_player;
	delete tempScore.my_score;
	delete tempScore.other_player;

	let status = "in_progress";
	if(this.frozen) {
		status = "frozen";
	}
	else if(this.closed) {
		status = "closed";
	}
	else if(this.idWinner !== null) {
		status = "finished";
	}

    return {
        id: this._id,
        idPlayer1: {
            id: this.idPlayer1,
            nickname: player1.nickname,
			online: player1.online
        },
        idPlayer2: this.idPlayer2 === null ? null : {
            id: this.idPlayer2,
            nickname: player2.nickname,
			online: player1.online
        },
        joinable: this.joinable,
        surrendered: this.surrendered,
        idWinner: this.idWinner,
        score: this.getScoreRound(this.idPlayer1, rounds),
		tempScore: tempScore,
        rounds: rounds,
        turnNumber: this.turnNumber,
		frozen: this.frozen,
		closed: this.closed,
		punteggio: punteggio,
		status: status,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt
    }
}

gameSchema.methods.isMyVideo = function(idPlayer: string, index: number) {
	if((idPlayer == this.idPlayer1 && index%2 == 0) || (idPlayer == this.idPlayer2 && index%2 === 1)) {
		return true;
	}

	return false;
}

gameSchema.methods.correctPredictionRound = function(round: any) {

	if(round.videoId === 'no-content') {
		return true;
	}

	return round.answer === round.truth;
};

gameSchema.methods.correctPrediction = async function(index: number) {
	let round = await utils.getRoundInfo(this.rounds[index]);

	if(round.videoId === 'no-content') {
		return true;
	}

	return round.answer === round.truth;
};

gameSchema.methods.getScoreTemporaneaRound = function(idPlayer: string, rounds: any) {
	let punteggio = {
		my_score: 0,
		other_player: 0
	}

	for(let i = 0; i < this.rounds.length; i++) {
		// se non è l'ultimo oppure se è l'ultimo e c'è idWinner
		let completedRound = (i < (this.rounds.length - 1)) || (this.idWinner !== "" && this.rounds.length === 6);

		if(completedRound) {
			if(this.isMyVideo(idPlayer, i)) {
				if(this.correctPredictionRound(rounds[i])) {
					punteggio.other_player++;
				}
				else punteggio.my_score++;
			}
			else {
				if(this.correctPredictionRound(rounds[i])) {
					punteggio.my_score++;
				}
				else punteggio.other_player++;
			}
		}
	}


	return punteggio;
}

gameSchema.methods.getScoreTemporanea = async function(idPlayer: string) {
    let punteggio = {
		my_score: 0,
		other_player: 0
	}

	for(let i = 0; i < this.rounds.length; i++) {
		// se non è l'ultimo oppure se è l'ultimo e c'è idWinner
		let completedRound = (i < (this.rounds.length - 1)) || (this.idWinner !== "" && this.rounds.length === 6);

		if(completedRound) {
			if(this.isMyVideo(idPlayer, i)) {
				if(await this.correctPrediction(i)) {
					punteggio.other_player++;
				}
				else punteggio.my_score++;
			}
			else {
				if(await this.correctPrediction(i)) {
					punteggio.my_score++;
				}
				else punteggio.other_player++;
			}
		}
	}


	return punteggio;
}

gameSchema.methods.getScoreRound = function(idPlayer: string, rounds: any) {
	return this.getScoreTemporaneaRound(idPlayer, rounds);
}

gameSchema.methods.getScore = async function(idPlayer: string) {
	return this.getScoreTemporanea(idPlayer);
    /*let punteggio = {
		my_score: 0,
		other_player: 0
	}

    let j = 0;
	for(let i = 0; i < Math.ceil(this.rounds.length/2.0) && i < 3; i++) {
		j = i * 2;

		let completedRound = (j + 1 + 1) < this.rounds.length || (this.idWinner !== "" && this.rounds.length === 6);

		if(completedRound) {
			if(this.isMyVideo(idPlayer, j + 1)) {
				if(await this.correctPrediction(j)) {
					punteggio.other_player++;
				}
				else punteggio.my_score++;

				if(await this.correctPrediction(j+1)) {
					punteggio.my_score++;
				}
				else punteggio.other_player++;
			}
			else {
				if(await this.correctPrediction(j)) {
					punteggio.my_score++;
				}
				else punteggio.other_player++;

				if(await this.correctPrediction(j+1)) {
					punteggio.other_player++;
				}
				else punteggio.my_score++;
			}
		}
	}


	return punteggio;*/
}

gameSchema.methods.setfrozen = function(value: boolean) {
	this.frozen = value;
}

gameSchema.methods.setClosed = function(winner: string) {
	this.joinable = false;
	this.surrendered = false;
	this.idWinner = winner;
	this.turnNumber = -1;
	this.closed = true;
}

function getSchema() {
	return gameSchema;
}


var gameModel : any;
function getModel() {
	if (!gameModel) {
		gameModel = mongoose.model("game", getSchema());
	}
	return gameModel;
}


function newGame(idPlayer1 : string) {
	var _gameModel = getModel();
	var game = new _gameModel({
		idPlayer1: idPlayer1,
	});
	return game;
}

function newGameWithPlayer(idPlayer1 : string, idPlayer2: string) {
	var _gameModel = getModel();
	var game = new _gameModel({
		idPlayer1: idPlayer1,
		idPlayer2: idPlayer2
	});
	return game;
}

export {
    newGame,
	newGameWithPlayer,
    getModel,
    getSchema
};