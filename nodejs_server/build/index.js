"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
// For logging
var Colors = require("colors.ts");
var uploadUtils_1 = require("./uploadUtils");
Colors.enable();
var multer = require("multer");
var GridFsStorage = require("multer-gridfs-storage");
// for mail
var nodemailer = require('nodemailer');
// HTTP to start the server
var http = require("http").Server(app);
// Socket IO for online/offline
var io = require('socket.io')(http);
// Body parse and CORS for the app
var bodyParser = require("body-parser");
var cors = require("cors");
// For database
var mongoose = require("mongoose");
// auth middleware per express
var passport = require("passport");
// JWT parsing middleware per express
var expressJwt = require("express-jwt");
var utils = require("./utils");
// Socket service
var socketClass = require('./services/socket');
var socket = new (socketClass)(io);
socketClass.setSocket(socket);
// mail
var MailService = require('./services/mail');
// setup env
require('dotenv').config();
// setup connection to mail
var transporter = nodemailer.createTransport({
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
var auth = expressJwt({ secret: process.env.JWT_SECRET });
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
// Enable middleware for express
app.use(cors());
app.use(bodyParser.json({ limit: '4mb' }));
app.use(bodyParser.urlencoded({
    limit: '4mb',
    extended: true,
    parameterLimit: 1000000
}));
app.use(express.json());
app.use(passport.initialize());
// Connect to db
mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, function (err, dbConnection) {
    if (err) {
        console.log("Error connecting to db".red);
        process.exit(-1);
    }
    uploadUtils_1.UploadUtils.setGfs(new mongoose.mongo.GridFSBucket(dbConnection.connections[0].db));
    var storage = new GridFsStorage({
        url: process.env.DB_CONNECTION,
        file: function (req, file) {
            return new Promise(function (resolve, reject) {
                if (req && req.params && req.params.truth) {
                    // video
                    var filename = req.params.id_round;
                    var metadata = null;
                    metadata = {
                        "truth": (req.params.truth === "true"),
                        "userId": req.user.id
                    };
                    var fileInfo = {
                        filename: filename,
                        metadata: metadata
                    };
                    resolve(fileInfo);
                }
                else {
                    // image
                    var metadata = null;
                    metadata = {
                        "complexity": req && req.params && req.params.complexity ? parseInt(req.params.complexity) : 1,
                    };
                    var fileInfo = {
                        filename: "GameImage",
                        metadata: metadata
                    };
                    resolve(fileInfo);
                }
            });
        }
    });
    var upload = multer({
        storage: storage
    });
    uploadUtils_1.UploadUtils.setStorage(storage);
    uploadUtils_1.UploadUtils.setUpload(upload);
    var auth_router = require("./router/auth");
    app.use("/auth", auth_router);
    var public_router = require("./router/public");
    app.use("/public", public_router.router);
    var user_router = require("./router/user");
    app.use("/users", auth, user_router);
    var game_router = require("./router/game");
    app.use("/game", auth, game_router.router);
    var image_router = require("./router/image");
    app.use("/image", auth, image_router.router);
    var admin_router = require("./router/admin");
    app.use("/admin", auth, admin_router.router);
    var report_router = require("./router/report");
    app.use("/report", auth, report_router.router);
    var game_request_router = require("./router/gameRequest");
    app.use("/gameRequest", auth, game_request_router.router);
    app.use(function (req, res, next) {
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
    http.listen(PORT, function () {
        // connected
        console.log(("Server in ascolto sulla porta " + PORT).green);
        io.sockets.setMaxListeners(0);
        io.on('connection', function (s) {
            s.on('auth', function (token) {
                try {
                    socket.createSocket(token.id, s);
                    s.on('logout', function () {
                        socket.deleteSocket(token.id, s.id);
                    });
                    s.on('disconnect', function () {
                        socket.deleteSocket(token.id, s.id);
                    });
                }
                catch (ex) {
                }
            });
        });
    });
});
