"use strict";

var express = require("express");
var router = express.Router();

const { createGameRequest, getRequests, getPlayers, getPlayersByNickname, deleteGameRequest } = require("../services/gameRequest");

router.post("/:id_receiver", createGameRequest);
router.get("/", getRequests);
router.get("/players", getPlayers);
router.get("/players/:nickname", getPlayersByNickname);
router.delete("/:id_game_request", deleteGameRequest);

export {
    router
}