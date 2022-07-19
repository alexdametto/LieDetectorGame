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
var fs = require("fs");
var mime = require('mime-types');
var sha512 = require('js-sha512').sha512;
// setup env
require('dotenv').config();
console.log("Server URL: " + process.env.SERVER_URL);
var axios = require("axios").create({ baseUrl: process.env.SERVER_URL });
var Colors = require("colors.ts");
Colors.enable();
var dir = "./exportDatabase";
if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
}
fs.mkdirSync(dir);
console.log("Effettuo login con utenza admin " + process.env.EMAIL);
var LOGIN_REQUEST = {
    url: process.env.SERVER_URL + "auth/admin_login",
    method: 'get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
        'authorization': "Basic " + Buffer.from(process.env.EMAIL + ":" + sha512(process.env.ADMIN_PASSWORD)).toString('base64'),
    }
};
axios(LOGIN_REQUEST)
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var jwt, AUTH_HEADERS, GET_ALL_VIDEOS_REQUEST, videosResponse, videos, _loop_1, writeVideoPromise, i, GET_ALL_IMAGES_REQUEST, imagesResponse, images, _loop_2, writeImagePromise, i, GET_ALL_USERS_REQUEST, usersResponse, users, i, user, TEXT_PATH, stringToWrite, GET_ALL_GAMES_REQUEST, gameResponse, games, i, game, TEXT_PATH, stringToWrite, GET_ALL_ROUNDS_REQUEST, roundResponse, rounds, i, round, TEXT_PATH, stringToWrite, GET_ALL_REPORTS_REQUEST, reportResponse, reports, i, report, TEXT_PATH, stringToWrite, GET_ALL_GAME_REQUESTS_REQUEST, gameRequestsResponse, gameRequests, i, request, TEXT_PATH, stringToWrite;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt = res.data.token;
                console.log('JWT ottenuto con successo.'.green);
                AUTH_HEADERS = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cache-control': 'no-cache',
                    'authorization': "Bearer " + jwt,
                };
                // Esportazione video
                console.log("Inizio esportazione di tutti i video.");
                GET_ALL_VIDEOS_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allVideo",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                return [4 /*yield*/, axios(GET_ALL_VIDEOS_REQUEST)];
            case 1:
                videosResponse = _a.sent();
                videos = videosResponse.data.videos;
                console.log("Ci sono " + videos.length + " video.");
                fs.mkdirSync(dir + "/video");
                _loop_1 = function (i) {
                    var video, VIDEO_PATH, TEXT_PATH, DOWNLOAD_VIDEO_REQUEST, videoDownloaded, writeVideoStream, stringToWrite;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                video = videos[i];
                                VIDEO_PATH = dir + "/video/" + video._id + ".mp4";
                                TEXT_PATH = dir + "/video/" + video._id + ".txt";
                                DOWNLOAD_VIDEO_REQUEST = {
                                    url: process.env.SERVER_URL + "admin/export/downloadVideo/" + video._id,
                                    method: 'get',
                                    headers: AUTH_HEADERS,
                                    responseType: 'stream',
                                };
                                return [4 /*yield*/, axios(DOWNLOAD_VIDEO_REQUEST)];
                            case 1:
                                videoDownloaded = _a.sent();
                                writeVideoStream = fs.createWriteStream(VIDEO_PATH);
                                writeVideoPromise = new Promise(function (resolve, reject) {
                                    videoDownloaded.data.pipe(writeVideoStream);
                                    writeVideoStream.on("finish", function () {
                                        console.log("Finita esportazione video " + (i + 1) + " di " + videos.length);
                                        // la promise è terminata
                                        resolve();
                                    });
                                });
                                return [4 /*yield*/, writeVideoPromise];
                            case 2:
                                _a.sent();
                                stringToWrite = JSON.stringify(video);
                                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < videos.length)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_1(i)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                console.log("Terminata esportazione video.".green);
                // Esportazione immagini
                console.log("Inizio esportazione delle immagini.");
                GET_ALL_IMAGES_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allImages",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                return [4 /*yield*/, axios(GET_ALL_IMAGES_REQUEST)];
            case 6:
                imagesResponse = _a.sent();
                images = imagesResponse.data.images;
                console.log("Ci sono " + images.length + " immagini.");
                fs.mkdirSync(dir + "/image");
                _loop_2 = function (i) {
                    var image, IMAGE_PATH, TEXT_PATH, DOWNLOAD_IMAGE_REQUEST, imageDownload, writeImageStream, stringToWrite;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                image = images[i];
                                IMAGE_PATH = dir + "/image/" + image._id + "." + mime.extension(image.contentType);
                                TEXT_PATH = dir + "/image/" + image._id + ".txt";
                                DOWNLOAD_IMAGE_REQUEST = {
                                    url: process.env.SERVER_URL + "admin/export/downloadImage/" + image._id,
                                    method: 'get',
                                    headers: AUTH_HEADERS,
                                    responseType: 'stream',
                                };
                                return [4 /*yield*/, axios(DOWNLOAD_IMAGE_REQUEST)];
                            case 1:
                                imageDownload = _a.sent();
                                writeImageStream = fs.createWriteStream(IMAGE_PATH);
                                writeImagePromise = new Promise(function (resolve, reject) {
                                    imageDownload.data.pipe(writeImageStream);
                                    writeImageStream.on("finish", function () {
                                        console.log("Finita esportazione immagine " + (i + 1) + " di " + images.length);
                                        // la promise è terminata
                                        resolve();
                                    });
                                });
                                return [4 /*yield*/, writeImagePromise];
                            case 2:
                                _a.sent();
                                stringToWrite = JSON.stringify(image);
                                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 7;
            case 7:
                if (!(i < images.length)) return [3 /*break*/, 10];
                return [5 /*yield**/, _loop_2(i)];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 7];
            case 10:
                console.log("Terminata esportazione delle immagini.".green);
                // Esportazione Utenti
                console.log("Inizio esportazione di tutti gli utenti.");
                GET_ALL_USERS_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allUsers",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                fs.mkdirSync(dir + "/user");
                return [4 /*yield*/, axios(GET_ALL_USERS_REQUEST)];
            case 11:
                usersResponse = _a.sent();
                users = usersResponse.data.users;
                i = 0;
                _a.label = 12;
            case 12:
                if (!(i < users.length)) return [3 /*break*/, 15];
                user = users[i];
                TEXT_PATH = dir + "/user/" + user._id + ".txt";
                stringToWrite = JSON.stringify(user);
                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
            case 13:
                _a.sent();
                _a.label = 14;
            case 14:
                i++;
                return [3 /*break*/, 12];
            case 15:
                console.log("Terminata esportazione utenti.".green);
                // Esportazione game
                console.log("Inizio esportazione di tutti i game.");
                GET_ALL_GAMES_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allGames",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                fs.mkdirSync(dir + "/game");
                return [4 /*yield*/, axios(GET_ALL_GAMES_REQUEST)];
            case 16:
                gameResponse = _a.sent();
                games = gameResponse.data.games;
                i = 0;
                _a.label = 17;
            case 17:
                if (!(i < games.length)) return [3 /*break*/, 20];
                game = games[i];
                TEXT_PATH = dir + "/game/" + game._id + ".txt";
                stringToWrite = JSON.stringify(game);
                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
            case 18:
                _a.sent();
                _a.label = 19;
            case 19:
                i++;
                return [3 /*break*/, 17];
            case 20:
                console.log("Terminata esportazione game.".green);
                // Esportazione round
                console.log("Inizio esportazione di tutti i round.");
                GET_ALL_ROUNDS_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allRounds",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                fs.mkdirSync(dir + "/round");
                return [4 /*yield*/, axios(GET_ALL_ROUNDS_REQUEST)];
            case 21:
                roundResponse = _a.sent();
                rounds = roundResponse.data.rounds;
                i = 0;
                _a.label = 22;
            case 22:
                if (!(i < rounds.length)) return [3 /*break*/, 25];
                round = rounds[i];
                TEXT_PATH = dir + "/round/" + round._id + ".txt";
                stringToWrite = JSON.stringify(round);
                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
            case 23:
                _a.sent();
                _a.label = 24;
            case 24:
                i++;
                return [3 /*break*/, 22];
            case 25:
                console.log("Terminata esportazione dei round.".green);
                // Esportazione report
                console.log("Inizio esportazione di tutti i report.");
                GET_ALL_REPORTS_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allReports",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                fs.mkdirSync(dir + "/report");
                return [4 /*yield*/, axios(GET_ALL_REPORTS_REQUEST)];
            case 26:
                reportResponse = _a.sent();
                reports = reportResponse.data.reports;
                i = 0;
                _a.label = 27;
            case 27:
                if (!(i < reports.length)) return [3 /*break*/, 30];
                report = reports[i];
                TEXT_PATH = dir + "/report/" + report._id + ".txt";
                stringToWrite = JSON.stringify(report);
                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
            case 28:
                _a.sent();
                _a.label = 29;
            case 29:
                i++;
                return [3 /*break*/, 27];
            case 30:
                console.log("Terminata esportazione dei report.".green);
                // Esportazione game requests
                console.log("Inizio esportazione delle game request.");
                GET_ALL_GAME_REQUESTS_REQUEST = {
                    url: process.env.SERVER_URL + "admin/export/allGameRequests",
                    method: 'get',
                    headers: AUTH_HEADERS
                };
                fs.mkdirSync(dir + "/gameRequests");
                return [4 /*yield*/, axios(GET_ALL_GAME_REQUESTS_REQUEST)];
            case 31:
                gameRequestsResponse = _a.sent();
                gameRequests = gameRequestsResponse.data.requests;
                i = 0;
                _a.label = 32;
            case 32:
                if (!(i < gameRequests.length)) return [3 /*break*/, 35];
                request = gameRequests[i];
                TEXT_PATH = dir + "/gameRequests/" + request._id + ".txt";
                stringToWrite = JSON.stringify(request);
                return [4 /*yield*/, fs.writeFile(TEXT_PATH, stringToWrite, function () { })];
            case 33:
                _a.sent();
                _a.label = 34;
            case 34:
                i++;
                return [3 /*break*/, 32];
            case 35:
                console.log("Terminata esportazione delle game request.".green);
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (error) {
    console.log("error", error);
    process.exit();
});
