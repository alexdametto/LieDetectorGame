var express = require("express");
var app = express();

// For logging
import Colors = require("colors.ts");
import { UploadUtils } from "./uploadUtils";
Colors.enable();

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// for mail
const nodemailer = require('nodemailer');

// HTTP to start the server
const http = require("http").Server(app);

// Socket IO for online/offline
const io = require('socket.io')(http);

// Body parse and CORS for the app
const bodyParser = require("body-parser");
const cors = require("cors");

// For database
const mongoose = require("mongoose");

// auth middleware per express
const passport = require("passport");

// JWT parsing middleware per express
const expressJwt = require("express-jwt"); 

const utils = require("./utils");

// Socket service
const socketClass = require('./services/socket');
const socket = new(socketClass)(io);

socketClass.setSocket(socket);

// mail
const MailService = require('./services/mail');

// setup env
require('dotenv').config();

// setup connection to mail
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	service: 'gmail',
	auth: {
	  user: process.env.EMAIL,
	  pass: process.env.PSW_EMAIL,
	},
});

if (!process.env.JWT_SECRET || !process.env.TK_EXPIRE) {
	console.log("Chiave JWT_SECRET o TK_EXPIRE non trovata".red);
	process.exit(-1);
}

// JWT Middleware
const auth = expressJwt({ secret:  process.env.JWT_SECRET }) 

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Enable middleware for express
app.use(cors());
app.use(bodyParser.json({limit: '4mb'}));
app.use(
	bodyParser.urlencoded({
		limit: '4mb',
		extended: true,
		parameterLimit: 1000000
	})
);
app.use(express.json());
app.use(passport.initialize());

// Connect to db
mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_CONNECTION, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}, function(err: any, dbConnection: any) {
	if(err) {
		console.log("Error connecting to db".red);
		process.exit(-1);
	}

	UploadUtils.setGfs(new mongoose.mongo.GridFSBucket(dbConnection.connections[0].db));

	const storage = new GridFsStorage({ 
		url : process.env.DB_CONNECTION,
		file: (req: any, file: any) => {
			return new Promise((resolve, reject) => {
				if(req && req.params && req.params.truth) {
					// video
					const filename = req.params.id_round;
					let metadata = null;
	
					metadata = {
						"truth": (req.params.truth === "true"),
						"userId": req.user.id
					}
	
					const fileInfo = {
					  filename: filename,
					  metadata: metadata
					};
					resolve(fileInfo);
				}
				else {
					// image
					let metadata = null;
	
					metadata = {
						"complexity": req && req.params && req.params.complexity ? parseInt(req.params.complexity) : 1,
					}

					const fileInfo = {
					  filename: "GameImage",
					  metadata: metadata
					};
					resolve(fileInfo);
				}
			});
		}
	});

	const upload = multer({
		storage
	});

	UploadUtils.setStorage(storage);
	UploadUtils.setUpload(upload);

	const auth_router = require("./router/auth");
	app.use("/auth", auth_router);

	const public_router = require("./router/public");
	app.use("/public", public_router.router);

	const user_router = require("./router/user");
	app.use("/users", auth, user_router);

	const game_router = require("./router/game");
	app.use("/game", auth, game_router.router);

	const image_router = require("./router/image");
	app.use("/image", auth, image_router.router);

	const admin_router = require("./router/admin");
	app.use("/admin", auth, admin_router.router);

	const report_router = require("./router/report");
	app.use("/report", auth, report_router.router);

	const game_request_router = require("./router/gameRequest");
	app.use("/gameRequest", auth, game_request_router.router);

	app.use((req: any, res: any, next: any) => {
		res.status(404).json({
			statusCode: 404,
			error: true,
			message: "Endpoint non trovato",
		});
	});

	utils.startDB();

	
	// Per usare il server mail, prendere il codice con label CODICE_SERVER e inserirlo dentro il then di questo metodo
	// transporter.verify().then(() => {		
	// 	MailService.setMailService(transporter);
	// 	console.log("Connesso al server mail".green)
	//
	//	Inserire CODICE_SERVER qua
	//
	// }).catch(console.error);


	// LABEL: CODICE_SERVER
	http.listen(PORT, () => {
		// connected
		console.log(`Server in ascolto sulla porta ${PORT}`.green);
		
		io.sockets.setMaxListeners(0);

		io.on('connection', (s: any) => {
			s.on('auth', (token: any) => {
				try {
					socket.createSocket(token.id, s);

					s.on('logout', () => {
						socket.deleteSocket(token.id, s.id);
					});

					s.on('disconnect', () => {
						socket.deleteSocket(token.id, s.id);
					});
				}
				catch(ex) {

				}
			});
		});
	});

	
});