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
exports.getSchema = exports.getModel = exports.newGameWithPlayer = exports.newGame = void 0;
var mongoose = require("mongoose");
var newRound = require('./round').newRound;
var utils = require("../utils");
var gameSchema = new mongoose.Schema({
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
}, {
    timestamps: true
});
gameSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
gameSchema.methods.initGame = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.rounds = [];
                    return [4 /*yield*/, this.addRound()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
gameSchema.methods.getOtherPlayerId = function (playerId) {
    return this.idPlayer1 === playerId ? this.idPlayer2 : this.idPlayer1;
};
gameSchema.methods.finishGame = function () {
    this.turnNumber = -1;
};
gameSchema.methods.joinGame = function (id) {
    this.idPlayer2 = id;
    this.joinable = false;
};
gameSchema.methods.addRound = function () {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newRound(this._id).save().then(function (round) {
                        _this.rounds.push(round.getFullInfo().id);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
gameSchema.methods.increaseTurnNumber = function () {
    this.turnNumber++;
};
gameSchema.methods.setIdWinner = function (idWinner) {
    this.idWinner = idWinner;
};
gameSchema.methods.setJoinable = function () {
    if (this.idPlayer2 === null) {
        this.joinable = true;
    }
};
gameSchema.methods.surrend = function (myId) {
    this.joinable = false;
    this.surrendered = true;
    this.idWinner = (myId == this.idPlayer1) ? this.idPlayer2 : this.idPlayer1;
    this.turnNumber = -1;
};
gameSchema.methods.getFullInfo = function () {
    return __awaiter(this, void 0, void 0, function () {
        var rounds, player1, player2, punteggio, tempScore, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, utils.getRoundsInfo(this.rounds)];
                case 1:
                    rounds = _a.sent();
                    return [4 /*yield*/, utils.getUserInfo(this.idPlayer1)];
                case 2:
                    player1 = _a.sent();
                    return [4 /*yield*/, utils.getUserInfo(this.idPlayer2)];
                case 3:
                    player2 = _a.sent();
                    punteggio = this.getScoreRound(this.idPlayer1, rounds);
                    punteggio.player1 = punteggio.my_score;
                    punteggio.player2 = punteggio.other_player;
                    delete punteggio.my_score;
                    delete punteggio.other_player;
                    tempScore = this.getScoreTemporaneaRound(this.idPlayer1, rounds);
                    tempScore.player1 = tempScore.my_score;
                    tempScore.player2 = tempScore.other_player;
                    delete tempScore.my_score;
                    delete tempScore.other_player;
                    status = "in_progress";
                    if (this.frozen) {
                        status = "frozen";
                    }
                    else if (this.closed) {
                        status = "closed";
                    }
                    else if (this.idWinner !== null) {
                        status = "finished";
                    }
                    return [2 /*return*/, {
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
                        }];
            }
        });
    });
};
gameSchema.methods.isMyVideo = function (idPlayer, index) {
    if ((idPlayer == this.idPlayer1 && index % 2 == 0) || (idPlayer == this.idPlayer2 && index % 2 === 1)) {
        return true;
    }
    return false;
};
gameSchema.methods.correctPredictionRound = function (round) {
    if (round.videoId === 'no-content') {
        return true;
    }
    return round.answer === round.truth;
};
gameSchema.methods.correctPrediction = function (index) {
    return __awaiter(this, void 0, void 0, function () {
        var round;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, utils.getRoundInfo(this.rounds[index])];
                case 1:
                    round = _a.sent();
                    if (round.videoId === 'no-content') {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, round.answer === round.truth];
            }
        });
    });
};
gameSchema.methods.getScoreTemporaneaRound = function (idPlayer, rounds) {
    var punteggio = {
        my_score: 0,
        other_player: 0
    };
    for (var i = 0; i < this.rounds.length; i++) {
        // se non è l'ultimo oppure se è l'ultimo e c'è idWinner
        var completedRound = (i < (this.rounds.length - 1)) || (this.idWinner !== "" && this.rounds.length === 6);
        if (completedRound) {
            if (this.isMyVideo(idPlayer, i)) {
                if (this.correctPredictionRound(rounds[i])) {
                    punteggio.other_player++;
                }
                else
                    punteggio.my_score++;
            }
            else {
                if (this.correctPredictionRound(rounds[i])) {
                    punteggio.my_score++;
                }
                else
                    punteggio.other_player++;
            }
        }
    }
    return punteggio;
};
gameSchema.methods.getScoreTemporanea = function (idPlayer) {
    return __awaiter(this, void 0, void 0, function () {
        var punteggio, i, completedRound;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    punteggio = {
                        my_score: 0,
                        other_player: 0
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < this.rounds.length)) return [3 /*break*/, 6];
                    completedRound = (i < (this.rounds.length - 1)) || (this.idWinner !== "" && this.rounds.length === 6);
                    if (!completedRound) return [3 /*break*/, 5];
                    if (!this.isMyVideo(idPlayer, i)) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.correctPrediction(i)];
                case 2:
                    if (_a.sent()) {
                        punteggio.other_player++;
                    }
                    else
                        punteggio.my_score++;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, this.correctPrediction(i)];
                case 4:
                    if (_a.sent()) {
                        punteggio.my_score++;
                    }
                    else
                        punteggio.other_player++;
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, punteggio];
            }
        });
    });
};
gameSchema.methods.getScoreRound = function (idPlayer, rounds) {
    return this.getScoreTemporaneaRound(idPlayer, rounds);
};
gameSchema.methods.getScore = function (idPlayer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, this.getScoreTemporanea(idPlayer)];
        });
    });
};
gameSchema.methods.setfrozen = function (value) {
    this.frozen = value;
};
gameSchema.methods.setClosed = function (winner) {
    this.joinable = false;
    this.surrendered = false;
    this.idWinner = winner;
    this.turnNumber = -1;
    this.closed = true;
};
function getSchema() {
    return gameSchema;
}
exports.getSchema = getSchema;
var gameModel;
function getModel() {
    if (!gameModel) {
        gameModel = mongoose.model("game", getSchema());
    }
    return gameModel;
}
exports.getModel = getModel;
function newGame(idPlayer1) {
    var _gameModel = getModel();
    var game = new _gameModel({
        idPlayer1: idPlayer1,
    });
    return game;
}
exports.newGame = newGame;
function newGameWithPlayer(idPlayer1, idPlayer2) {
    var _gameModel = getModel();
    var game = new _gameModel({
        idPlayer1: idPlayer1,
        idPlayer2: idPlayer2
    });
    return game;
}
exports.newGameWithPlayer = newGameWithPlayer;
