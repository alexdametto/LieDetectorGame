"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var auth_1 = require("../services/auth");
var express = require("express");
var router = express.Router();
exports.router = router;
var gameModel = require("../models/game");
var error_string = require("../error_string");
var _a = require("../services/game"), changeWinner = _a.changeWinner, downloadVideo = _a.downloadVideo, getGame = _a.getGame, getGames = _a.getGames, startGame = _a.startGame, startGameWithPlayer = _a.startGameWithPlayer, upload = _a.upload, notUpload = _a.notUpload, playVideo = _a.playVideo, setAnswer = _a.setAnswer, surrender = _a.surrender, getAllGames = _a.getAllGames;
var UploadUtils = require("../uploadUtils").UploadUtils;
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
router.post("/winner/:id/:player", auth_1.isAdmin(), changeWinner);
