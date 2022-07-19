"use strict";

import { isAdmin } from "../services/auth";

var express = require("express");
var router = express.Router();

const gameModel = require("../models/game");
const error_string = require("../error_string");

const { changeWinner, downloadVideo, getGame, getGames, startGame, startGameWithPlayer, upload, notUpload, playVideo, setAnswer, surrender, getAllGames } = require("../services/game");
const { UploadUtils } = require("../uploadUtils");

router.get("/start", startGame); // inizio un nuovo gioco
router.get("/startGameWithPlayer/:id_player/:id_request", startGameWithPlayer); // inizio un nuovo gioco
router.get("/", getGames); // ottengo la lista di tutti i giochi

router.get("/getAllGames", getAllGames);

router.get("/:id_game", getGame);

router.post("/upload/:id_game/:id_round/:id_image/:truth", UploadUtils.getUpload().single("upload"), upload);

router.post("/not_upload/:id_game/:id_round", notUpload);

router.get("/play/:id_video", playVideo);
router.get("/download/:id_video", downloadVideo);

router.post("/answer/:id_game/:id_round", setAnswer);

router.get("/:id/surrender", surrender); // mi arrendo

router.post("/winner/:id/:player", isAdmin(), changeWinner);

export {
    router
}