"use strict";

import { isAdmin } from "../services/auth";

var express = require("express");
var router = express.Router();

const { setConsent, setPrivacy, changePassword, changeUserInfo, deleteUser, transformAdmin, getStats, getLeaderboard, getAllVideo, downloadVideo, getAllUsers, getAllGames, getAllRounds, getAllReports, getAllGameRequests, getAllImages, downloadImage } = require("../services/admin");

router.get("/stats", isAdmin(), getStats);
router.get("/leaderboard", getLeaderboard);

router.post("/changePassword", isAdmin(), changePassword);
router.post("/changeUserInfo", isAdmin(), changeUserInfo);
router.post("/transformAdmin", isAdmin(), transformAdmin);
router.post("/deleteUser", isAdmin(), deleteUser);
router.post("/setConsent", isAdmin(), setConsent);
router.post("/setPrivacy", isAdmin(), setPrivacy);

router.get("/export/allVideo", isAdmin(), getAllVideo);
router.get("/export/downloadVideo/:id", isAdmin(), downloadVideo);

router.get("/export/allImages", isAdmin(), getAllImages);
router.get("/export/downloadImage/:id", isAdmin(), downloadImage);

router.get("/export/allUsers", isAdmin(), getAllUsers);

router.get("/export/allGames", isAdmin(), getAllGames);

router.get("/export/allRounds", isAdmin(), getAllRounds);

router.get("/export/allReports", isAdmin(), getAllReports);

router.get("/export/allGameRequests", isAdmin(), getAllGameRequests);

export {
    router
}