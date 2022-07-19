"use strict";

const jsonwt = require("jsonwebtoken"); // JWT generation
const user = require("../models/user");
const error_string = require("../error_string").ErrorString;
const MailService = require("./mail");
const utils = require("../utils");
const secretJWT = utils.getJWTSecret();
var crypto = require("crypto");

const changePassword = async function(req: any, res: any, next: any) {
	const userId = req.user.id;
	const newPassword = req.body.newPassword;
	const oldPassword = req.body.oldPassword;

	console.log("userId", userId)

	let userToUpdate = await user
		.getModel()
		.findOne({
			_id: userId
		})
		.exec();

	if (!userToUpdate) {
		return res.status(404).json({
			error: true,
			message: "User not found",
		});
	}

	if(userToUpdate.validatePassword(oldPassword)) {
		userToUpdate.setPassword(newPassword);

		userToUpdate.save().then((newUser: any) => {
			return res.status(200).json({
				error: false,
				message: ""
			});
		})
		.catch((reason : any) => {
			return next(utils.createError(500, error_string.DATABASE_ERROR));
		});
	}
	else {
		return res.status(400).json({
			error: true,
			message: "Passwords not matching.",
		});
	}
}

const recoverPassword = async function(req: any, res: any, next: any) {
	const email = req.body.email;

	let userToRecover = await user
		.getModel()
		.findOne({
			email: email
		})
		.exec();

	if (!userToRecover) {
		return res.status(404).json({
			error: true,
			message: "USER_NOT_FOUND",
		});
	}

	// generate new password
	let newPassword =  "";
	const specialChars = ['@', '#', '$', '%', '^', '&', '+', '=', '!', '?']
	const randomUppercase = String.fromCharCode(65+Math.floor(Math.random() * 26));
	const randomLowercase = String.fromCharCode(97+Math.floor(Math.random() * 26));
	const randomDigit = Math.floor(Math.random() * 10);
	const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];

	const otherChars = crypto.randomBytes(Math.floor(Math.random() * 5) + 3).toString('hex');
	const finalString = randomUppercase + randomLowercase + randomDigit + randomSpecialChar + otherChars;
	newPassword = finalString.split('').sort(function(){return 0.5-Math.random()}).join('');
	
	const hashedPsw = crypto.createHash('sha512').update(newPassword).digest('hex');
	userToRecover.setPassword(hashedPsw);

	//console.log(newPassword)

	userToRecover.save().then((newUser: any) => {
		return res.status(200).json({
			error: false,
			message: ""
		});

		// commento codice invio mail
		/*MailService.getMailService().sendMail({
			from: `"LieDetectionGame" <${process.env.EMAIL}>`, // sender address
			to: email, // list of receivers
			subject: "Lie Detection App - Password reset", // Subject line
			text: `Dear ${userToRecover.nickname}, this is your new password to access LieDetectionGame: ${newPassword}. You can now login with this new password and we advise you to change it immediately. LieDetection Team`, // plain text body
			html: `Dear ${userToRecover.nickname}, <br> this is your new password to access LieDetectionGame: <b>${newPassword}</b>. <br> You can now login with this new password and we advise you to change it immediately. <br> LieDetection Team`, // html body
		}).then((info: any) => {
			return res.status(200).json({
				error: false,
				message: ""
			});
		}).catch((reason : any) => {
			return next(utils.createError(500, "Errore invio email"));
		});*/
	})
	.catch((reason : any) => {
		return next(utils.createError(500, error_string.DATABASE_ERROR));
	});
}

const register = function(req: any, res: any, next: any) {
	const newUser = user.newUser({
		email: req.body.email,
		participate: req.body.participate,
		dataProcessing: req.body.dataProcessing,
		publishingImages: req.body.publishingImages
	});

	if (!req.body.password) {
		return next(utils.createError(412, error_string.USER_MISS_PASSWORD));
	}
	newUser.setPassword(req.body.password);

	newUser
		.save()
		.then((data: any) => {
			var tokendata = {
				email: req.body.email,
				id: data._id,
				nickname: req.body.nickname,
				//admin: req.user.admin
			};
	
			const token = jsonwt.sign(tokendata, secretJWT, {
				expiresIn: utils.getJWTExpires(),
			});
	
			return res.status(200).json({
				error: false,
				message: "",
				token: token,
			});
		})
		.catch((reason : any) => {
			if (reason.code === 11000)
				return next(utils.createError(409, error_string.USER_EXIST));
			/*if (reason.code === 17280)
				return next(utils.createError(412, error_string.NICKNAME_INVALID));*/
			return next(utils.createError(500, error_string.DATABASE_ERROR));
		});
}

const autenticazione = function(email: string, password: string, done: any) {
	user.getModel().findOne(
		{
			email: email
		},
		(err: any, user: any) => {
			if (err) {
				return done(utils.createError(500, error_string.DATABASE_ERROR));
			}
			if (!user) {
				return done(utils.createError(404, error_string.USER_NOT_FOUND));
			}
			if(user.banned) {
				return done(utils.createError(401, error_string.USER_BANNED));
			}
			if (user.validatePassword(password)) {
				return done(null, user);
			}
			return done(utils.createError(401, error_string.USER_INVALID_PASSWORD));
		}
	);
}

const login = function(req: any, res: any, next: any) {
	var tokendata = {
		email: req.user.email,
		id: req.user._id,
		nickname: req.user.nickname,
		//admin: req.user.admin
	};

	console.log(
		"Nuovo login effettuato da " + req.user.email + ". Generazione JWT"
	);

	const token = jsonwt.sign(tokendata, secretJWT, {
		expiresIn: utils.getJWTExpires(),
	});

	return res.status(200).json({
		error: false,
		message: "",
		token: token,
	});
}

const loginAdmin = function(req: any, res: any, next: any) {
	if(req && req.user && !req.user.admin) {
		return next(utils.createError(404, error_string.ADMIN_ONLY));
	}

	var tokendata = {
		email: req.user.email,
		id: req.user._id,
		nickname: req.user.nickname,
		//admin: req.user.admin
	};

	console.log(
		"Nuovo login effettuato da " + req.user.email + ". Generazione JWT"
	);

	const token = jsonwt.sign(tokendata, secretJWT, {
		expiresIn: utils.getJWTExpires(),
	});

	return res.status(200).json({
		error: false,
		message: "",
		token: token,
	});
}

const renew = function(req: any, res: any, next: any) {
	const id = utils.getUserId(req);
	user.getModel().findOne(
		{
			_id: id,
		},
		(err: any, user: any) => {
			if (err) {
				return next(utils.createError(500, error_string.DATABASE_ERROR));
			}
			if (!user) {
				return next(utils.createError(404, error_string.USER_NOT_FOUND));
			}

			const tokendata = req.user;
			delete tokendata.iat;
			delete tokendata.exp;

			const newToken = {
				email: user.email,
				id: user._id,
				nickname: user.nickname,
			};

			//console.log("Rinnovo token per utente", JSON.stringify(tokendata));
			const token_signed = jsonwt.sign(newToken, secretJWT, {
				expiresIn: utils.getJWTExpires(),
			});

			return res.status(200).json({
				error: false,
				errormessage: "",
				token: token_signed,
			});
		}
	);
}

// for ADMIN-ONLY endpoints
const isAdmin = () => {
	return async function(req: any, res: any, next: any) {
		const id = utils.getUserId(req);
		const currentUser = await user.getModel().findOne({
				_id: id,
		});
	  
		if (!currentUser || !currentUser.admin) {
			return res.status(403).send({
				error: true,
				errormessage: "This endpoint is only for admins."
			});
		}
	  	next();
	}
}

export {
	register,
	autenticazione,
	login,
	renew,
	loginAdmin,
	changePassword,
	recoverPassword,
	isAdmin
}