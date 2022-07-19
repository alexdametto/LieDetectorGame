"use strict";

var express = require("express");
var router = express.Router();
const passportHTTP = require("passport-http"); // implementazione Basic e Digestion auth per HTTP
const passport = require("passport"); // auth middleware per express
const jwt = require("express-jwt"); // JWT parsing middleware per express

const utils = require("../utils");

const auth_service = require("../services/auth");

const auth = jwt({
	secret: utils.getJWTSecret()
});

passport.use(new passportHTTP.BasicStrategy(auth_service.autenticazione));
router.get(
	"/",
	passport.authenticate("basic", {
		session: false
	}),
	auth_service.login
);

router.get(
	"/admin_login",
	passport.authenticate("basic", {
		session: false
	}),
	auth_service.loginAdmin
);


router.post("/", auth_service.register);

router.get("/renew", auth, auth_service.renew);

router.post("/changePassword", auth, auth_service.changePassword)

router.post("/recoverPassword", auth_service.recoverPassword)

module.exports = router;
