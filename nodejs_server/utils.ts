"use strict";

const jwtDecode = require("jwt-decode");
const user = require("./models/user");
const round = require("./models/round");
const game = require("./models/game");
var crypto = require("crypto");

const nicknamePattern = "^[a-zA-Z0-9_-]{3,8}$";

const getUserInfo = async function(id: string) {
	try {
		let u = await user
			.getModel()
			.findOne({
				_id: id
			})
			.exec();

		if (!u) {
			return undefined;
		}

		return u.getInfo();
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

const getGameInfo = async function(id: string) {
	try {
		let g = await game
			.getModel()
			.findOne({
				_id: id
			})
			.exec();

		if (!g) {
			return undefined;
		}

		return g.getFullInfo();
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

const getRoundInfo = async function(id: string) {
	try {
		let r = await round
			.getModel()
			.findOne({
				_id: id
			})
			.exec();

		if (!r) {
			return undefined;
		}

		return r.getFullInfo();
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

const getRoundsInfo = async function(ids: string[]) {
	try {
		let roundsFromDb = await round
			.getModel()
			.find({
				_id: {
					$in: ids
				}
			})
			.exec();
		
			const rounds = [];
			for(var i = 0; i < ids.length; i++) {
				const id = ids[i];

				const roundFromDB = roundsFromDb.filter((r: any) => {
					return r._id.toString() === id
				})[0];

				const roundToPush = await roundFromDB.getFullInfo();

				rounds.push(roundToPush);
			}

			return rounds;
	} catch (e) {
		console.log(e);
		return [];
	}
}

const getJWTSecret = function() {
	return process.env.JWT_SECRET;
}

const checkNickname = function(new_nickname: string) {
	return RegExp(nicknamePattern).test(new_nickname);
}

const getJWTExpires = function() {
	return process.env.TK_EXPIRE;
}

const createError = function(code: number, msg: string) {
	return {
		statusCode: code,
		error: true,
		message: msg
	};
}

const decodeToken = function(tk: string) {
	return jwtDecode(tk);
}

const getUserId = function (req: any) {
	let tk = req.get("Authorization").split(" ")[1];
	return jwtDecode(tk).id;
}

const getUserNickname = function(req: any) {
	let tk = req.get("Authorization").split(" ")[1];
	return jwtDecode(tk).nickname;
}

const startDB = async function() {
	try {
		const u = await user.getModel().findOne({
			email: process.env.EMAIL
		}).exec();

		// se non c'è nessun admin
		if (!u) {
			console.log("Admin non trovato, creo una nuova utenza".yellow)
			const newUser = user.newUser({
				nickname: "Admin",
				email: process.env.EMAIL,
				admin: true,
			});

			const hashedPsw = crypto.createHash('sha512').update(process.env.ADMIN_PASSWORD).digest('hex');

			newUser.setPassword(hashedPsw);
			await newUser.save();
		}
		else {
			console.log("L'utenza admin esiste già.".green)
		}
	} catch (e) {
	}
}

export {
	nicknamePattern,
	getUserInfo,
	getRoundInfo,
	getJWTSecret,
	checkNickname,
	getJWTExpires,
	createError,
	decodeToken,
	getUserId,
	getUserNickname,
	getGameInfo,
	getRoundsInfo,
	startDB
}