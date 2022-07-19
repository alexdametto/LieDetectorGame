# Esportazione del database

In questo file verrà illustrato come lanciare lo script di export del database.

## Pre-requisiti

Come prima cosa è necessario aver installato tutte le dipendenze del progetto di BackEnd. Quindi:

```bash
cd nodejs_server
npm install
```

## Esecuzione dello script

Per poter esportare il database è necessario prima di tutto entrare nella cartella "nodejs_server"

```bash
cd nodejs_server
```

e poi è necessario eseguire il seguente comando

```bash
npm run export
```

Il processo può essere lento (deve scaricare tutti i dati del database che possono essere molti). Al termine dell'operazione, nella cartella "exportDatabase" ci sarà tutto il risultato dell'esportazione del database.

I dati che vengono esportati sono TUTTI quelli presenti nel database, ad eccezione delle password per motivi di sicurezza.