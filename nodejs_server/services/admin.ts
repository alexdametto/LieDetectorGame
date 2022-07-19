"use strict";

const fs = require('fs');

const { UploadUtils } = require("../uploadUtils");

const {ObjectId} = require('mongodb');

const jsonwt = require("jsonwebtoken"); // JWT generation

const user = require("../models/user");
const game = require("../models/game");
const round = require("../models/round");
const report = require("../models/report");
const gameRequest = require("../models/gameRequest");


const error_string = require("../error_string").ErrorString;

const utils = require("../utils");
const secretJWT = utils.getJWTSecret();

const socket = require('./socket').getSockets();

const setConsent = async function(req: any, res: any, next: any) {
    const consent = req.body.consent;

    await fs.writeFileSync('./assets/CONSENT.txt', consent);

    return res.status(200).json({
        error: false,
        message: "",
    });
}

const setPrivacy = async function(req: any, res: any, next: any) {
    const privacy = req.body.privacy;

    await fs.writeFileSync('./assets/PRIVACY.txt', privacy);

    return res.status(200).json({
        error: false,
        message: "",
    });
}

const transformAdmin = async function(req: any, res: any, next: any) {
    const userId = req.body.userId;
    const isAdmin = req.body.admin;

    let userToAdmin = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();
    
    if (!userToAdmin) {
        return res.status(404).json({
            error: true,
            message: "User not found.",
        });
    }

    userToAdmin.setAdmin(isAdmin);

    userToAdmin.save().then(async (newUser: any) => {
        const infoToReturn = await newUser.getFullInfo();

		return res.status(200).json({
			error: false,
			message: "",
            user: infoToReturn
		});
    })
	.catch((reason : any) => {
		return next(utils.createError(500, error_string.DATABASE_ERROR));
	});
};

const deleteUser = async function(req: any, res: any, next: any) {
    const userId = req.body.userId;
    
    let userToRecover = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();

	if (!userToRecover) {
		return res.status(404).json({
			error: true,
			message: "User not found.",
		});
	}

    // elimino tutti i video
    await UploadUtils.getGfs()
    .find({'metadata.userId': userId})
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

    // elimino user su DB
    await user.getModel().deleteOne({
        _id: userId
    });

    // ottengo i game (per poi, dopo cancellati, mandare socket)
    const games = await game.getModel().find({
        $or:[
            {
                idPlayer1: userId
            },
            {
                idPlayer2: userId
            }
        ]
    });

    // elimino i game
    await game.getModel().deleteMany({
        $or:[
            {
                idPlayer1: userId
            },
            {
                idPlayer2: userId
            }
        ]
    });

    const gamesID = [];
    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        const gameID = game._id;
        gamesID.push(gameID)
    }

    // elimino i round
    await round.getModel().deleteMany({
        idGame: {
            $in: gamesID
        }
    });

    // invio messaggi socket per i game
    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        const gameID = game._id;
        let otherPlayerID = "";
        if(game.idPlayer1 === userId) {
            otherPlayerID = game.idPlayer2;
        }
        else {
            otherPlayerID = game.idPlayer1;
        }

        const s = socket.getSocket(otherPlayerID);
        if(s) {
            s.emit('deleted_game_' + gameID);
            s.emit('refresh_games');
        }
    }

    // prendo gameRequest
    const requests = await gameRequest.getModel().find({
        $or:[
            {
                idSender: userId
            },
            {
                idReceiver: userId
            }
        ]
    });

    // elimino le gameRequest
    await gameRequest.getModel().deleteMany({
        $or:[
            {
                idSender: userId
            },
            {
                idReceiver: userId
            }
        ]
    });

    // invio socket per game request
    for(let i = 0; i < requests.length; i++) {
        const req = requests[i];
        let otherPlayerID = "";

        if(req.idSender === userId) {
            otherPlayerID = req.idReceiver;
        }
        else {
            otherPlayerID = req.idSender;
        }

        const s = socket.getSocket(otherPlayerID);
        if(s) {
            s.emit('reload_requests');
        }
    }

    // elimino i report
    await report.getModel().deleteMany({
        $or:[
            {
                idSender: userId
            },
            {
                idReported: userId
            }
        ]
    });

    return res.status(200).json({
        error: false,
        message: "",
    });
};

const changeUserInfo = async function(req: any, res: any, next: any) {
    const userId = req.body.userId;
    const userInfo = {
        sex: req.body.sex,
        age: req.body.age,
        educationalQualification: req.body.educationalQualification,
        nickname: req.body.nickname
    };

    let db_users = await user
        .getModel()
        .find({
            nickname: req.body.nickname,
            _id: {
                $ne: userId
            }
        })
        .exec();

    if(db_users.length > 0) {
        return res.status(409).json({
            error: false,
            errormessage: 'DUPLICATE_NICKNAME',
        });
    }

    let userToChange = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();

    if (!userToChange) {
        return res.status(404).json({
            error: true,
            message: "USER_NOT_FOUND",
        });
    }

    userToChange.setInfo(userInfo);

    userToChange.save().then(async (newUser: any) => {
        const infoToReturn = await newUser.getFullInfo();

		return res.status(200).json({
			error: false,
			message: "",
            user: infoToReturn
		});
    })
	.catch((reason : any) => {
		return next(utils.createError(500, error_string.DATABASE_ERROR));
	});
};

const changePassword = async function(req: any, res: any, next: any) {
    const userId = req.body.userId;

    let userToChangePassword = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();

    if (!userToChangePassword) {
        return res.status(404).json({
            error: true,
            message: "USER_NOT_FOUND",
        });
    }

    userToChangePassword.setPassword(req.body.newPassword);

    userToChangePassword.save().then(async (newUser: any) => {
        const infoToReturn = await newUser.getFullInfo();

		return res.status(200).json({
			error: false,
			message: "",
            user: infoToReturn
		});
    })
	.catch((reason : any) => {
		return next(utils.createError(500, error_string.DATABASE_ERROR));
	});
};

const getStats = async function(req: any, res: any, next: any) {
    // TODO: mettere filtro per utenti attivi
    let db_users = await user
        .getModel()
        .find({
            nickname: { $ne: "" },
            banned: false
        })
        .exec();

    let db_games = await game
        .getModel()
        .find({})
        .exec();

    return res.status(200).json({
        error: false,
        errormessage: "",
        data: {
            totalUsers: db_users.length,
            totalGames: db_games.length,
            activeGames: db_games.filter((g:any) => g.idWinner === null).length
        }
    });
}

const getLeaderboard = async function(req: any, res: any, next: any) {
    let allUsers = await user
        .getModel()
        .find({ nickname: { $ne: "" }, banned: false })
        .exec();

    // TODO: mettere filtro per utenti attivi
    let byWins = [...allUsers]
    byWins = byWins.sort((a: any, b: any) => {
        return b.win - a.win;
    });

    byWins = byWins.slice(0, 20).map((elem: any) => elem.getFullInfo());

    let byRate = [...allUsers];
    byRate.sort((a: any, b: any) => {
        if(b.win + b.lose + b.draws === 0) {
            return -1;
        }
        else if(a.win + a.lose + a.draws === 0) {
            return 1;
        }
        return (b.win/(b.win + b.lose + b.draws)) - (a.win/(a.win + a.lose + a.draws));
    });
    byRate = byRate.slice(0, 20).map((elem: any) => elem.getFullInfo());

    let byMatches = [...allUsers]
    byMatches.sort((a: any, b: any) => {
        return ((b.win + b.lose + b.draws)) - ((a.win + a.lose + a.draws));
    });
    byMatches = byMatches.slice(0, 20).map((elem: any) => elem.getFullInfo());

    let byPoints = [...allUsers];
    byPoints.sort((a: any, b: any) => {
        return b.points - a.points;
    });
    byPoints = byPoints.slice(0, 20).map((elem: any) => elem.getFullInfo());

    return res.status(200).json({
        error: false,
        errormessage: "",
        data: {
            byWins: byWins,
            byRate: byRate,
            byMatches: byMatches,
            byPoints: byPoints
        }
    });
}

const getAllImages = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    const gridFs = UploadUtils.getGfs();

    const images = await gridFs.find({contentType: {$ne: "video/mp4"}}).toArray();

    return res.status(200).json({
        error: false,
        errormessage: "",
        images: images
    });
}

const downloadImage = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }
    
    let fileId = req.params.id;

    UploadUtils.getGfs()
    .find({_id: ObjectId(fileId)})
    .toArray((err: any, files: any) => {
        if (!files || files.length === 0) {
        return res.status(404).json({
            err: "no files exist"
        });
        }
        UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID( files[0]._id.toString())).pipe(res);
    });
}

const getAllVideo = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    const gridFs = UploadUtils.getGfs();

    const rounds = await round
    .getModel()
    .find({ })
    .exec();

    const videos = await gridFs.find({contentType: "video/mp4"}).toArray();
    const images = await gridFs.find({contentType: {$ne: "video/mp4"}}).toArray();

    let videosToReturn = videos.map((v: any) => {
        const videoToReturn = {... v};

        if(!videoToReturn.metadata) {
            videoToReturn.metadata = {};
        }

        const videoRound = rounds.find((r: any) => {
            return r.videoId && r.videoId.toString() === v._id.toString()
        });

        if(videoRound) {
            const videoImage = images.find((img: any) => {
                return videoRound.imageId.toString() && videoRound.imageId === img._id.toString()
            });

            videoToReturn.metadata.imageId = videoRound.imageId;
            videoToReturn.metadata.answer = videoRound.answer;

            if(videoImage && videoImage.metadata) {
                videoToReturn.metadata.imageComplexity = videoImage.metadata.complexity
            }
        }

        return videoToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        videos: videosToReturn
    });
}

const downloadVideo = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let fileId = req.params.id;

    UploadUtils.getGfs()
    .find({_id: ObjectId(fileId), contentType: "video/mp4"})
    .toArray((err: any, files: any) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
        }
        UploadUtils.getGfs().openDownloadStream(require('mongodb').ObjectID( files[0]._id.toString())).pipe(res);
    });
}

const getAllUsers = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let allUsers = await user
        .getModel()
        .find({ })
        .exec();
    
    const usersToReturn = allUsers.map((u: any) => {
        const objectToReturn = u.toJSON();

        delete objectToReturn.password;
        delete objectToReturn.salt;

        return objectToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        users: usersToReturn
    });
};

const getAllGames = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let allGames = await game
        .getModel()
        .find({ })
        .exec();
    
    const gamesToReturn = allGames.map((u: any) => {
        const objectToReturn = u.toJSON();

        return objectToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        games: gamesToReturn
    });
};

const getAllRounds = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let allRounds = await round
        .getModel()
        .find({ })
        .exec();
    
    const roundsToReturn = allRounds.map((u: any) => {
        const objectToReturn = u.toJSON();

        return objectToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        rounds: roundsToReturn
    });
};

const getAllReports = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let allReports = await report
        .getModel()
        .find({ })
        .exec();
    
    const reportsToReturn = allReports.map((u: any) => {
        const objectToReturn = u.toJSON();

        return objectToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        reports: reportsToReturn
    });
};

const getAllGameRequests = async function(req: any, res: any, next: any) {
    if(req.user.email !== process.env.EMAIL) {
        return res.status(403).json({
            error: true,
            errormessage: ""
        });
    }

    let allGameRequests = await gameRequest
        .getModel()
        .find({ })
        .exec();
    
    const requestsToReturn = allGameRequests.map((u: any) => {
        const objectToReturn = u.toJSON();

        return objectToReturn;
    });

    return res.status(200).json({
        error: false,
        errormessage: "",
        requests: requestsToReturn
    });
};

export {
    changePassword,
    getStats,
    getLeaderboard,
    getAllVideo,
    downloadVideo,
    getAllImages,
    downloadImage,
    getAllUsers,
    getAllGames,
    getAllRounds,
    getAllReports,
    getAllGameRequests,
    changeUserInfo,
    deleteUser,
    transformAdmin,
    setConsent,
    setPrivacy
}