"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorString = void 0;
var ErrorString = /** @class */ (function () {
    function ErrorString() {
    }
    Object.defineProperty(ErrorString, "USER_NOT_FOUND", {
        // User
        get: function () {
            return "Utente non trovato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_MISS_PASSWORD", {
        get: function () {
            return "Password mancante";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_INVALID_PASSWORD", {
        get: function () {
            return "Password non valida";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_EXIST", {
        get: function () {
            return "Utente già presente";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_ONLINE", {
        get: function () {
            return "Utente già online";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_NOT_ONLINE", {
        get: function () {
            return "Utente non online";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_DELETE", {
        get: function () {
            return "Utente eliminato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "NICKNAME_INVALID", {
        get: function () {
            return "Nickname non valido";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_BANNED", {
        get: function () {
            return "Utente bloccato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ADMIN_ONLY", {
        //ADMIN
        get: function () {
            return "Non sei amministratore";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ALREADY_ADMIN", {
        get: function () {
            return "L'utente è già amministratore";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "DELETE_ADMIN", {
        get: function () {
            return "Non puoi cancellare un amministratore";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "DEST_NOT_FOUND", {
        //MESSAGGI
        get: function () {
            return "Destinatario non trovato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ROUND_NOT_FOUND", {
        // ROUND
        get: function () {
            return "Round non trovato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "TESTO_MANCANTE", {
        //GAME
        get: function () {
            return "Testo della domanda mancante.";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_FINISHED", {
        get: function () {
            return "La partita si è già conclusa.";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "USER_IN_GAME", {
        get: function () {
            return "Utente in game";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_SCHEMA_SENT", {
        get: function () {
            return "Schieramento già inviato";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_SCHEMA", {
        get: function () {
            return "Schema non valido";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_TURN", {
        get: function () {
            return "Non è il tuo turno";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_COOR_NOT_VALID", {
        get: function () {
            return "Coordinate non valide";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_COOR_HIT", {
        get: function () {
            return "Coordinata già colpita";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "GAME_NOT_FOUND", {
        get: function () {
            return "Partita non trovata";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ROOM_NOT_FOUND", {
        //ROOM
        get: function () {
            return "Room non esistente";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "YOUR_ROOM", {
        get: function () {
            return "Sei proprietario di una stanza";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ROOM_FOUND", {
        get: function () {
            return "Stanza gioco già esistente";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "DATABASE_ERROR", {
        get: function () {
            return "Errore database";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ERRORE", {
        get: function () {
            return "Errore";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorString, "ENDPOINT", {
        get: function () {
            return "Endpoint invalido";
        },
        enumerable: false,
        configurable: true
    });
    return ErrorString;
}());
exports.ErrorString = ErrorString;
