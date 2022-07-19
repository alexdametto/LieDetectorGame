"use strict";

const fs = require('fs');

const { UploadUtils } = require("../uploadUtils");

const {ObjectId} = require('mongodb');

const jsonwt = require("jsonwebtoken"); // JWT generation
const user = require("../models/user");
const error_string = require("../error_string").ErrorString;

const utils = require("../utils");
const secretJWT = utils.getJWTSecret();

const getConsent = async function(req: any, res: any, next: any) {
    fs.readFile('./assets/CONSENT.txt', (err: any, data: any) => {
        res.write(data);

        return res.end();
    });
};

const getPrivacy = async function(req: any, res: any, next: any) {
    fs.readFile('./assets/PRIVACY.txt', (err: any, data: any) => {
        res.write(data);

        return res.end();
    });
};

const emailAlreadyUsed = async function(req: any, res: any, next: any) {
    let email = req.body.email;

    let userExists = await user
		.getModel()
		.findOne({
			email: email
		})
		.exec();

	if (userExists) {
		return res.status(200).json({
			error: false,
			message: "",
            exists: true
		});
	}

    return res.status(200).json({
        error: false,
        message: "",
        exists: false
    });
}

const loadImage = async function(req: any, res: any, next: any) {
    let fileId = req.params.image_id;

    UploadUtils.getGfs()
    .find({_id: ObjectId(fileId)})
    .toArray((err: any, files: any) => {
        if (!files || files.length === 0) {
        return res.status(404).json({
            err: "no files exist"
        });
        }

        //res.setHeader("content-type", files[0].contentType);
        
        UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID( files[0]._id.toString())).pipe(res);
    });
}

export {
    loadImage,
    emailAlreadyUsed,
    getConsent,
    getPrivacy
}