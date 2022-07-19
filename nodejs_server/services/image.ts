"use strict";

const { UploadUtils } = require("../uploadUtils");

const {ObjectId} = require('mongodb');

const jsonwt = require("jsonwebtoken"); // JWT generation
const user = require("../models/user");
const error_string = require("../error_string").ErrorString;

const utils = require("../utils");
const secretJWT = utils.getJWTSecret();

const uploadImageMultiple = async function(req: any, res: any, next: any) {
    return res.status(200).json({
        error: false,
        errormessage: "",
    });
}

const uploadImage = async function(req: any, res: any, next: any) {
    return res.status(200).json({
        error: false,
        errormessage: "",
    });
}

const getImages = async function(req: any, res: any, next: any) {
    let fileName = "GameImage";
    UploadUtils.getGfs()
	.find({filename: fileName})
    .toArray((err: any, files: any) => {
        return res.status(200).json({
            error: false,
            message: "",
            images: files
        });
    });
}

const deleteAllimages = async function(req: any, res: any, next: any) {
    await UploadUtils.getGfs()
    .find({'filename': 'GameImage'})
    .toArray(async (err: any, files: any) => {
        if (!files || files.length === 0) {
            // non fare niente
        }
        else {
            for(let i = 0; i < files.length; i++) {
                const file = files[i];
                await UploadUtils.getGfs().delete(file._id);
            }
        }
    });

    return res.status(200).json({
        error: false,
        message: "",
    });
};

const deleteImage = async function(req: any, res: any, next: any) {
    let fileId = req.params.image_id;
    
    UploadUtils.getGfs().delete(ObjectId(fileId)).then((data: any) => {
        return res.status(200).json({
            error: false,
            errormessage: "",
        });
    }).catch((err: any) => {
        return res.status(500).json({
            error: true,
            errormessage: "Error while deleting image",
        });
    });

    
}

const getRandomImage = async function(req: any, res: any, next: any) {
    const avoidIds = req.query.avoid ? req.query.avoid.split(",").filter((e: any) => e !== 'no-content').map((e:any) => ObjectId(e)) : [];

    let image = UploadUtils.getGfs()
	.find(
        {
            _id: { $nin: avoidIds },
            filename: "GameImage"
        }).toArray((err: any, files: any) => {
            if (!files || files.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
            }

            let index = Math.round(Math.random() * (files.length - 1));

            res.setHeader("image-id", files[index]._id.toString());

            UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID( files[index]._id.toString())).pipe(res);
    });
}

export {
	uploadImage,
    uploadImageMultiple,
    getImages,
    deleteImage,
    deleteAllimages,
    getRandomImage
}