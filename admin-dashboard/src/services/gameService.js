import AuthService from "./authService";

class GameService {
    static async getGames() {
        return fetch(process.env.REACT_APP_API_URL + "game/getAllGames", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async getGame(id) {
        return fetch(process.env.REACT_APP_API_URL + "game/" + id, {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async updateWinner(idGame, idWinner) {
        return fetch(process.env.REACT_APP_API_URL + "game/winner/" + idGame + "/" + idWinner, {
            method: 'POST',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static getStatusMessage = (message, game, userId) => {
        let toReturn = "";
        switch(message) {
            case "in_progress":
                toReturn = "In corso.";
                break;
            case "frozen":
                toReturn = "In attesa di revisione.";
                break;
            case "closed":
                toReturn = "Chiuso da un amministratore.";
                break;
            case "finished": 
                toReturn = game.idWinner === 'draw' ? 'Pareggio' : (game.idWinner === userId) ? 'Vittoria!' : 'Sconfitta.';
                break;
            default:
                break;
        }
    
        return toReturn;
    }
}

export default GameService;