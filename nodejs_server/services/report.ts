"use strict";

import { removeEmitHelper } from "typescript";

const { UploadUtils } = require("../uploadUtils");

const {ObjectId} = require('mongodb');

const jsonwt = require("jsonwebtoken"); // JWT generation
const user = require("../models/user");
const reportModel = require("../models/report");
const gameModel = require("../models/game");
const error_string = require("../error_string").ErrorString;

const utils = require("../utils");
const secretJWT = utils.getJWTSecret();

const createReport = async (req: any, res: any, next: any) => {
    const jwt_user = req.user;
    const game_id = req.params.id_game;
    const reported_id = req.params.id_reported;
    const type = req.body.type;

    const report = await reportModel.newModel(jwt_user.id, reported_id, game_id, null, type, req.body.description, req.body.reason);

    const game = await gameModel
        .getModel()
        .findOne({
            _id: game_id
        })
        .exec();

        
    game.setfrozen(true);

    game.save().then((gameData: any) => {
        report.save()
            .then((data: any) => {
            try {
                return res.status(200).json({
                    error: false,
                    message: "",
                });
            } catch (e) {
                return next(utils.createError(500, "Errore impreviso"));
            }
        })
        .catch((reason: any) => {
            console.log(reason);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    }).catch((reason: any) => {
        console.log(reason);
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });


}

const createVideoReport = async (req: any, res: any, next: any) => {
    const jwt_user = req.user;
    const game_id = req.params.id_game;
    const reported_id = req.params.id_reported;
    const video_id = req.params.id_video;
    const type = "VIDEO";

    const report = await reportModel.newModel(jwt_user.id, reported_id, game_id, video_id, type, "", req.body.reason);

    const game = await gameModel
        .getModel()
        .findOne({
            _id: game_id
        })
        .exec();

    game.setfrozen(true);

    game.save().then((gameData: any) => {
        report.save()
            .then((data: any) => {
                try {
                    return res.status(200).json({
                        error: false,
                        message: "",
                    });
                } catch (e) {
                    return next(utils.createError(500, "Errore impreviso"));
                }
        })
        .catch((reason: any) => {
            console.log(reason);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    }).catch((reason: any) => {
        console.log(reason);
        return next(utils.createError(500, error_string.DATABASE_ERROR));
    });
};

const getReports = async (req: any, res: any, next: any) => {
    const reports = await reportModel.getModel().find({}).exec();

    const reportsToReturn = [];
    for (let i = 0; i < reports.length; i++) {
        let report = reports[i];

        let reportToReturn = await report.getFullInfo();

        reportsToReturn.push(reportToReturn);
    }

    return res.status(200).json({
        error: false,
        errormessage: "",
        reports: reportsToReturn
    });
};

const getReport = async (req: any, res: any, next: any) => {
    const report_id = req.params.id;

    try {
        const report = await reportModel
            .getModel()
            .findOne({
                _id: report_id
            })
            .exec();
        
        let objToSend = await report.getFullInfo();

        return res.status(200).json({
            error: false,
            errormessage: "",
            report: objToSend,
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }
};

const closeReport = async (req: any, res: any, next: any) => {
    const report_id = req.params.id;

    try {
        const report = await reportModel
            .getModel()
            .findOne({
                _id: report_id
            })
            .exec();
        
        report.close();

        const game = await gameModel.getModel().findOne({
            _id: report.idGame
        });

        game.setfrozen(false);
        await game.save();


        report.save().then(async (data : any) => {
            let objToSend = await data.getFullInfo();

            return res.status(200).json({
                error: false,
                errormessage: "",
                report: objToSend,
            });
        }).catch((reason: any) => {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }

}

const getReportsByUserGeneric = async (userId: string) => {
    const reports = await reportModel
        .getModel()
        .find({
            $or: [
                {
                    idSender: userId
                },
                {
                    idReported: userId
                }
            ]
        })
        .exec();

    const reportsToReturn = [];
    for(let i = 0; i < reports.length; i++) {
        let report = reports[i];
        let reportToReturn = await report.getFullInfo();
        reportsToReturn.push(reportToReturn);
    }

    return reportsToReturn;
}

const getReportsByUser = async (req: any, res: any, next: any) => {
    const userId = req.params.id;

    try {
        const reports = await getReportsByUserGeneric(userId);

        return res.status(200).json({
            error: false,
            errormessage: "",
            reports: reports,
        });

    } catch(e) {
        console.log(e);
        return next(utils.createError(500, "Errore impreviso"));
    }
};

export {
    createReport,
    createVideoReport,
    getReports,
    closeReport,
    getReport,
    getReportsByUserGeneric,
    getReportsByUser
}