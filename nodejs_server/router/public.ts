"use strict";

var express = require("express");
var router = express.Router();

const { loadImage, emailAlreadyUsed, getConsent, getPrivacy } = require("../services/public");

router.get("/consent", getConsent);
router.get("/privacy", getPrivacy);
router.get("/:image_id", loadImage);
router.post("/emailAlreadyUsed", emailAlreadyUsed);

export {
    router
}