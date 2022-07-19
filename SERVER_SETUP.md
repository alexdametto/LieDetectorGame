# Server Setup 
Questa guida ha lo scopo di illustrare come effettuare il setup del server dell'applicazione (con database + backend) su un server linux.

## Installare MiniConda
Prima di tutto è necessario installare miniconda. Per installarlo bisogna eseguire questi comandi.

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
chmod +x Miniconda3-latest-Linux-x86_64.sh
./Miniconda3-latest-Linux-x86_64.sh
```

## Setup Conda
Prima di tutto è necessario creare l'environment di conda.

```bash
conda create -n LieDetection
```

Poi bisogna attivare questo env:

```bash
conda activate LieDetection
```

Ora bisogna installare i pacchetti necessari:

```bash
conda install -c anaconda mongodb
conda install -c conda-forge nodejs
conda install -c conda-forge/label/gcc7 nodejs
conda install -c conda-forge/label/cf201901 nodejs
conda install -c conda-forge/label/cf202003 nodejs
conda update nodejs
npm install n -g
npm install env-cmd -g
npm install typescript -g
```

MongoDB servirà per eseguire il database in locale, mentre NPM (che sarà già installato automaticamente da conda) verrà utilizzato per eseguire il backend. E' necessario tuttavia installare env-cmd e tsc per poter avviare il backend.

## Creare database in locale
Una volta attivato l'env di conda, bisogna creare il database. Per fare questo:

```bash
mkdir DataBase
mongod --dbpath DataBase --fork --logpath mongod.log
```

In questo caso il database è già avviato senza problemi. La prima volta però bisogna cambiare username e password.

Eseguiamo quindi i seguenti comandi

```bash
mongo
use liedetectiondb
db.createUser({	
    user: "admin",
	pwd: "admin",
	roles:[{role: "readWrite" , db:"liedetectiondb"}]
})
```

## Avviare il tutto
Prima di tutto vanno terminati i processi di mongod e npm.

Una volta aggiornato il codice poi, per avviare il database basta:

```bash
mongod --dbpath DataBase --fork --logpath mongod.log
```

Valutate voi se serve cancellare la cartella DataBase. La cancellazione di questa cartella (e ricreazione) porta quindi alla cancellazione TOTALE del database.

Invece per avviare il backend è necessario eseguire

```bash
nohup npm run start-server & disown
```

dentro la cartella nodejs_server.

MongoDB all'avvio creerà un file mongod.log, mentre il backend avrà no-hup.out come file di log.