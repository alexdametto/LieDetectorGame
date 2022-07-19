var express = require("express");
var app = express();
const {ObjectId} = require('mongodb');
var fs = require("fs");

// For database
const mongoose = require("mongoose");

import Colors = require("colors.ts");
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
}, async function(err: any, dbConnection: any) {
    if(err) {
		console.log(`Errore durante la connessione al db ${process.env.DB_CONNECTION}`.red);
		process.exit();
	}

    console.log(`Connesso al database ${process.env.DB_CONNECTION}`.green)

    const gridFs = new mongoose.mongo.GridFSBucket(dbConnection.connections[0].db);

    const videoIds = await gridFs.find({contentType: "video/mp4"}).toArray();

    const dir = "./exportVideo";

    fs.rmdirSync(dir, { recursive: true });
    fs.mkdirSync(dir);

    const promises = [];
    for(let i = 0; i < videoIds.length; i++) {
        const video = videoIds[i];
        const idString = video._id.toString();
        const writeStream = fs.createWriteStream(`${dir}/${video._id}.mp4`);

        // salvo info del video su file di testo
        let stringToWrite = "";
        stringToWrite += "TRUTH=" + video.metadata.truth + ";";
        stringToWrite += "USERID=" + video.metadata.userId + ";";

        await fs.writeFile(`${dir}/${video._id}.txt`, stringToWrite, () => {});

        // esporto video
        console.log(`Inizio esportazione video ${i + 1} di ${videoIds.length}`);

        // creo promise
        promises.push(new Promise((resolve: any, reject: any) => {
            const stream = gridFs.openDownloadStream(require('mongodb').ObjectID(idString)).pipe(writeStream);
            
            stream.on("finish", () => {
                console.log(`Finita esportazione video ${i + 1} di ${videoIds.length}`);
                
                // la promise è terminata
                resolve()
            });
        }));
    }

    // attendo scrittura di tutti i video
    await Promise.all(promises);

    console.log("Terminato l'export".green);
    process.exit();
});