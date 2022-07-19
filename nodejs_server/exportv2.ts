var express = require("express");
var app = express();
var fs = require("fs");
const mime = require('mime-types')
const { sha512 } = require('js-sha512');
// setup env
require('dotenv').config();

console.log(`Server URL: ${process.env.SERVER_URL}`);

const axios = require("axios").create({baseUrl: process.env.SERVER_URL});

import Colors = require("colors.ts");
Colors.enable();

const dir = "./exportDatabase";

if(fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
}
fs.mkdirSync(dir);

console.log(`Effettuo login con utenza admin ${process.env.EMAIL}`);

const LOGIN_REQUEST = {
    url: `${process.env.SERVER_URL}auth/admin_login`,
    method: 'get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
        'authorization': `Basic ${Buffer.from(`${process.env.EMAIL}:${sha512(process.env.ADMIN_PASSWORD)}`).toString('base64')}`,
    }
}

axios(LOGIN_REQUEST)
.then(async (res: any) => {
    const jwt = res.data.token;
    console.log('JWT ottenuto con successo.'.green)

    const AUTH_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
        'authorization': `Bearer ${jwt}`,
    }

    // Esportazione video
    console.log(`Inizio esportazione di tutti i video.`);
    const GET_ALL_VIDEOS_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allVideo`,
        method: 'get',
        headers: AUTH_HEADERS
    }

    const videosResponse = await axios(GET_ALL_VIDEOS_REQUEST);
    const videos = videosResponse.data.videos;

    console.log(`Ci sono ${videos.length} video.`);
    fs.mkdirSync(dir + "/video");

    for(let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const VIDEO_PATH = `${dir}/video/${video._id}.mp4`
        const TEXT_PATH = `${dir}/video/${video._id}.txt`

        const DOWNLOAD_VIDEO_REQUEST = {
            url: `${process.env.SERVER_URL}admin/export/downloadVideo/${video._id}`,
            method: 'get',
            headers: AUTH_HEADERS,
            responseType: 'stream',
        };

        const videoDownloaded = await axios(DOWNLOAD_VIDEO_REQUEST);

        const writeVideoStream = fs.createWriteStream(VIDEO_PATH);

        var writeVideoPromise = new Promise((resolve: any, reject: any) => {
            videoDownloaded.data.pipe(writeVideoStream);
            
            writeVideoStream.on("finish", () => {
                console.log(`Finita esportazione video ${i + 1} di ${videos.length}`);
                
                // la promise è terminata
                resolve()
            });
        });

        await writeVideoPromise;

        // creazione file di testo
        let stringToWrite = JSON.stringify(video);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione video.`.green);

    // Esportazione immagini
    console.log(`Inizio esportazione delle immagini.`);
    const GET_ALL_IMAGES_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allImages`,
        method: 'get',
        headers: AUTH_HEADERS
    }

    const imagesResponse = await axios(GET_ALL_IMAGES_REQUEST);
    const images = imagesResponse.data.images;

    console.log(`Ci sono ${images.length} immagini.`);
    fs.mkdirSync(dir + "/image");

    for(let i = 0; i < images.length; i++) {
        const image = images[i];
        const IMAGE_PATH = `${dir}/image/${image._id}.${mime.extension(image.contentType)}`
        const TEXT_PATH = `${dir}/image/${image._id}.txt`

        const DOWNLOAD_IMAGE_REQUEST = {
            url: `${process.env.SERVER_URL}admin/export/downloadImage/${image._id}`,
            method: 'get',
            headers: AUTH_HEADERS,
            responseType: 'stream',
        };

        const imageDownload = await axios(DOWNLOAD_IMAGE_REQUEST);

        const writeImageStream = fs.createWriteStream(IMAGE_PATH);

        var writeImagePromise = new Promise((resolve: any, reject: any) => {
            imageDownload.data.pipe(writeImageStream);
            
            writeImageStream.on("finish", () => {
                console.log(`Finita esportazione immagine ${i + 1} di ${images.length}`);
                
                // la promise è terminata
                resolve()
            });
        });

        await writeImagePromise;

        // creazione file di testo
        let stringToWrite = JSON.stringify(image);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione delle immagini.`.green);

    // Esportazione Utenti
    console.log(`Inizio esportazione di tutti gli utenti.`);
    const GET_ALL_USERS_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allUsers`,
        method: 'get',
        headers: AUTH_HEADERS
    };

    fs.mkdirSync(dir + "/user");

    const usersResponse = await axios(GET_ALL_USERS_REQUEST);
    const users = usersResponse.data.users;

    for(let i = 0; i < users.length; i++) {
        const user = users[i];

        const TEXT_PATH = `${dir}/user/${user._id}.txt`
        // creazione file di testo
        let stringToWrite = JSON.stringify(user);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione utenti.`.green);

    // Esportazione game
    console.log(`Inizio esportazione di tutti i game.`);
    const GET_ALL_GAMES_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allGames`,
        method: 'get',
        headers: AUTH_HEADERS
    };

    fs.mkdirSync(dir + "/game");

    const gameResponse = await axios(GET_ALL_GAMES_REQUEST);
    const games = gameResponse.data.games;

    for(let i = 0; i < games.length; i++) {
        const game = games[i];

        const TEXT_PATH = `${dir}/game/${game._id}.txt`
        // creazione file di testo
        let stringToWrite = JSON.stringify(game);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione game.`.green);

    // Esportazione round
    console.log(`Inizio esportazione di tutti i round.`);
    const GET_ALL_ROUNDS_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allRounds`,
        method: 'get',
        headers: AUTH_HEADERS
    };

    fs.mkdirSync(dir + "/round");

    const roundResponse = await axios(GET_ALL_ROUNDS_REQUEST);
    const rounds = roundResponse.data.rounds;

    for(let i = 0; i < rounds.length; i++) {
        const round = rounds[i];

        const TEXT_PATH = `${dir}/round/${round._id}.txt`
        // creazione file di testo
        let stringToWrite = JSON.stringify(round);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione dei round.`.green);

    // Esportazione report
    console.log(`Inizio esportazione di tutti i report.`);
    const GET_ALL_REPORTS_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allReports`,
        method: 'get',
        headers: AUTH_HEADERS
    };

    fs.mkdirSync(dir + "/report");

    const reportResponse = await axios(GET_ALL_REPORTS_REQUEST);
    const reports = reportResponse.data.reports;

    for(let i = 0; i < reports.length; i++) {
        const report = reports[i];

        const TEXT_PATH = `${dir}/report/${report._id}.txt`
        // creazione file di testo
        let stringToWrite = JSON.stringify(report);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione dei report.`.green);

    // Esportazione game requests
    console.log(`Inizio esportazione delle game request.`);
    const GET_ALL_GAME_REQUESTS_REQUEST = {
        url: `${process.env.SERVER_URL}admin/export/allGameRequests`,
        method: 'get',
        headers: AUTH_HEADERS
    };

    fs.mkdirSync(dir + "/gameRequests");

    const gameRequestsResponse = await axios(GET_ALL_GAME_REQUESTS_REQUEST);
    const gameRequests = gameRequestsResponse.data.requests;

    for(let i = 0; i < gameRequests.length; i++) {
        const request = gameRequests[i];

        const TEXT_PATH = `${dir}/gameRequests/${request._id}.txt`
        // creazione file di testo
        let stringToWrite = JSON.stringify(request);

        await fs.writeFile(TEXT_PATH, stringToWrite, () => {});
    }

    console.log(`Terminata esportazione delle game request.`.green);
})
.catch((error: any) => {
    console.log("error", error)
    process.exit();
})