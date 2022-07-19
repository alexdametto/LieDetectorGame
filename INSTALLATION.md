# Guida al setup ed esecuzione del progetto

In questo file verrà illustrato come installare tutte le dipendenze del progetto in modo da poterlo eseguire correttamente in locale.

## Prerequisiti

### Android Studio

L'app android è stata sviluppata in Android Studio, perciò è necessaria l'installazione attraverso il [sito ufficiale](https://developer.android.com/studio?gclid=Cj0KCQiAmeKQBhDvARIsAHJ7mF7u__XYJdAIT8l1n3vA_WrBgx3929NKC1SMgjWJtCRzXb1YB4IjYHUaApwQEALw_wcB&gclsrc=aw.ds).

### Node
Il progetto di BackEnd è stato sviluppato in NodeJS mentre il progetto della DashBoard è stato sviluppato in react. Per l'esecuzione di questi due progetto è quindi necessario installare Node 16. 

Per installarlo su windows basta andare sul sito di [Node](https://nodejs.org/en/download/).
Per installarlo su Ubuntu basta eseguire i seguenti comandi:

```bash
cd ~
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt -y install nodejs
```

Dopo aver installato queste dipendenze, eseguendo il comando:

```bash
node -v
```

dovremmo ottenere:

```bash
v16.14.0
```

In questo modo node sarà correttamente installato.

## Database MongoDB

Per il database ci sono 2 possibilità:
- Installarsi mongodb in locale ed aggiornare i file d'ambiente del BackEnd in modo da utilizzare il database appena creato
- Usare il sito web MongoDB Atlas che permette la creazione di un database gratuito (limitato a 500 MB)

Per l'uso in locale è consigliato usare MongoDB Atlas mentre per l'uso sul server di produzione è consigliato usare MongoDB in locale.

## Esecuzione del BackEnd

Posizioniamoci nella cartella "nodejs_server" del progetto.

### Impostazione dei file d'ambiente

Come prima cosa dobbiamo andare ad impostare correttamente il file d'ambiente. In quella cartella abbiamo 2 file .env:
- .env: questo file viene usato per l'avvio del progetto in locale, con database di test
- .env.server: questo file viene usato per l'avvio del backend puntando al database di produzione

Apriamo quindi il file che ci interessa ed avremmo le seguenti variabili da configurare:
- DB_CONNECTION: inserire l'URL di connessione al database
- PORT: la porta in cui eseguire il backend
- JWT_SECRET: è una stringa utilizzata come "segreto" per la codifica del JWT
- EMAIL: email dell'account amministratore che viene creato in automatico per l'utilizzo della dashboard di amministratore e per il recupero della password
- ADMIN_PASSWORD: password dell'account di amministratore dell'app
- PSW_EMAIL: password dell'email (ad esempio gmail) per l'inivio delle email agli utenti in caso di recupero password (funzionalità ad oggi dismessa). L'email utilizzata per l'invio delle email agli utenti è la stessa dell'account di amministratore.
- SERVER_URL: indica l'URL del server da utilizzare per esportare il database. Questo verrà spiegato meglio nella sezione dedicata all'export del database.

### Installazione delle dipendenze per il progetto di backend

Come prima cosa vanno installati tutti i pacchetti necessari alla corretta esecuzione del progetto.

Per l'installazione dei pacchetti npm basta eseguire il comando:

```bash
npm install
```

### Esecuzione

Una volta installati i pacchetti, abbiamo la possibilità di:
- In locale: questo comando andrà ad eseguire il backend con il file d'ambiente .env

```bash
npm run start-nodemon
```

- Sul server: questo comando andrà ad eseguire il backend con il file d'ambiente .env.server

```bash
npm run start-server
```

### Esportazione del database
Per l'esportazione del database di sviluppo (andrà ad usare il file .env) è necessario eseguire questo comando

```bash
npm run export-local
```

mentre per esportare il database di produzione (andrà ad usare il file .env.server)

```bash
npm run export
```

## Esecuzione della DashBoard

Posizioniamoci nella cartella "admin-dashboard" del progetto.

### Impostazione dei file d'ambiente

Come prima cosa dobbiamo andare ad impostare correttamente il file d'ambiente. In quella cartella abbiamo 2 file .env:
- .env.local: utilizzato per l'esecuzione con BackEnd in locale
- .env.prod: utilizzato per l'esecuzione della dashboard puntando al server di produzione.

Le variabili d'ambiente da configurare sono:
- REACT_APP_API_URL: contiene il link al progetto di BackEnd

### Installazione delle dipendenze per la DashBoard

Come prima cosa vanno installati tutti i pacchetti necessari alla corretta esecuzione del progetto.

Per l'installazione dei pacchetti npm basta eseguire il comando:

```bash
npm install
```

### Esecuzione

Una volta installati i pacchetti, abbiamo la possibilità di:
- In locale: questo comando andrà ad eseguire la dashboard puntando al progetto di BackEnd in locale con il file d'ambiente .env.local

```bash
npm run start-local
```

- Sul server: questo comando andrà ad eseguire la dashboard puntando al progetto di BackEnd di produzione con il file d'ambiente .env.prod

```bash
npm run start-prod
```

## App Android

Per poter modificare il codice dell'app android è necessario aprire la cartella "android_app" con Android Studio.

Per poter permettere lo sviluppo locale e i test in produzione, è stato creato in file Constants.java. Questo file contiene il campo "API_URL" che deve contenere il link al progetto di BackEnd. Questo link sarà:
- "http://localhost:port/" nel caso di sviluppo locale
- "http://server_url:port/" (attuale link del progetto di BackEnd sul server dell'Università) nel caso di app per la produzione. 

E' quindi necessario, prima di generare l'apk di produzione, impostare correttamente questa variabile in modo che l'app usi il backend di produzione.