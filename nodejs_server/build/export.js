"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var ObjectId = require('mongodb').ObjectId;
var fs = require("fs");
// For database
var mongoose = require("mongoose");
var Colors = require("colors.ts");
Colors.enable();
// setup env
require('dotenv').config();
// Connect to db
mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, function (err, dbConnection) {
    return __awaiter(this, void 0, void 0, function () {
        var gridFs, videoIds, dir, promises, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (err) {
                        console.log(("Errore durante la connessione al db " + process.env.DB_CONNECTION).red);
                        process.exit();
                    }
                    console.log(("Connesso al database " + process.env.DB_CONNECTION).green);
                    gridFs = new mongoose.mongo.GridFSBucket(dbConnection.connections[0].db);
                    return [4 /*yield*/, gridFs.find({ contentType: "video/mp4" }).toArray()];
                case 1:
                    videoIds = _a.sent();
                    dir = "./exportVideo";
                    fs.rmdirSync(dir, { recursive: true });
                    fs.mkdirSync(dir);
                    promises = [];
                    _loop_1 = function (i) {
                        var video, idString, writeStream, stringToWrite;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    video = videoIds[i];
                                    idString = video._id.toString();
                                    writeStream = fs.createWriteStream(dir + "/" + video._id + ".mp4");
                                    stringToWrite = "";
                                    stringToWrite += "TRUTH=" + video.metadata.truth + ";";
                                    stringToWrite += "USERID=" + video.metadata.userId + ";";
                                    return [4 /*yield*/, fs.writeFile(dir + "/" + video._id + ".txt", stringToWrite, function () { })];
                                case 1:
                                    _a.sent();
                                    // esporto video
                                    console.log("Inizio esportazione video " + (i + 1) + " di " + videoIds.length);
                                    // creo promise
                                    promises.push(new Promise(function (resolve, reject) {
                                        var stream = gridFs.openDownloadStream(require('mongodb').ObjectID(idString)).pipe(writeStream);
                                        stream.on("finish", function () {
                                            console.log("Finita esportazione video " + (i + 1) + " di " + videoIds.length);
                                            // la promise è terminata
                                            resolve();
                                        });
                                    }));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < videoIds.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1(i)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: 
                // attendo scrittura di tutti i video
                return [4 /*yield*/, Promise.all(promises)];
                case 6:
                    // attendo scrittura di tutti i video
                    _a.sent();
                    console.log("Terminato l'export".green);
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
});
