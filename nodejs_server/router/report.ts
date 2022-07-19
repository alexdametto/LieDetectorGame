"use strict";

import { isAdmin } from "../services/auth";

var express = require("express");
var router = express.Router();

const reportModel = require("../models/report");
const error_string = require("../error_string");

const { getReports, createReport, closeReport, getReport, getReportsByUser, createVideoReport } = require("../services/report");

router.post("/close/:id", isAdmin(), closeReport);
router.post("/video/:id_game/:id_reported/:id_video", createVideoReport);
router.post("/:id_game/:id_reported", createReport);
router.get("/", getReports);
router.get("/:id", getReport);
router.get("/user/:id", getReportsByUser);

export {
    router
}