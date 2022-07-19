"use strict";

import { isAdmin } from "../services/auth";

var express = require("express");
var router = express.Router();

const { uploadImage, uploadImageMultiple, getImages, deleteImage, deleteAllimages, getRandomImage } = require("../services/image");
const { UploadUtils } = require("../uploadUtils");

router.post("/multiUploadImage/:complexity", isAdmin(), UploadUtils.getUpload().array("upload"), uploadImageMultiple);
router.post("/uploadImage", isAdmin(), UploadUtils.getUpload().single("upload"), uploadImage);
router.get("/images", getImages);
router.delete("/all", isAdmin(), deleteAllimages);
router.delete("/:image_id", isAdmin(), deleteImage);

router.get("/random", getRandomImage);

export {
    router
}