import { Grid } from "@material-ui/core";
import VideoService from '../../services/videoService';
import ImageService from '../../services/imageService';
import VideoPlayer from './VideoPlayer'
import GameService from "../../services/gameService";

const getPlayerFromTurn = (game, roundIndex) => {
    if(roundIndex % 2 === 0) {
        return game.idPlayer1.nickname;
    }
    else {
        return game.idPlayer2.nickname;
    }
}

const getOtherPlayerFromTurn = (game, roundIndex) => {
    if(roundIndex % 2 === 0) {
        return game.idPlayer2.nickname;
    }
    else {
        return game.idPlayer1.nickname;
    }
}

function GameInfo({game}) {

    return (
        <Grid container>
            <Grid container className="game-info-container">
                <div className="punteggio-container">
                    <div className="first-player">
                        {game.tempScore.player1}
                    </div>
                    <div className="mid-container">
                        -
                    </div>
                    <div className="second-player">
                        {game.tempScore.player2}
                    </div>
                    </div>
                    <div className="nickname-container">
                    <div className="first-player">
                        {game.idPlayer1.nickname}
                    </div>
                    <div className="mid-container">
                        -
                    </div>
                    <div className="second-player">
                        {game.idPlayer2 ? game.idPlayer2.nickname : "N.D."}
                    </div>
                </div>
            </Grid>

            <Grid container>
                <div className="status-container">
                    <b>Stato: </b> {game.status === "finished" ? "Terminato" : GameService.getStatusMessage(game.status, game, undefined)}
                </div>
            </Grid>
            
            {
                game.idWinner && game.idWinner !== 'draw' ? (
                    <Grid>
                        <div className="status-container">
                            <b>Vincitore: </b> {game.idWinner === game.idPlayer1.id ? game.idPlayer1.nickname : game.idPlayer2.nickname}
                        </div>
                    </Grid>
                ) : null
            }

            <Grid container className="round-container">
                
                <div className="titolo-lista-round">
                    Lista dei round:
                </div>

                {
                    game.rounds.map((round, index) => {
                        return (
                            <Grid container item xs={12} className="single-round">
                                <div className="titolo-round">
                                    Round {index + 1}
                                </div>

                                <Grid container>
                                    <Grid container item xs={12}>
                                        {
                                            round.imageId === "no-content" ? (
                                                <div className="info-immagine">
                                                    Il giocatore {getPlayerFromTurn(game, index)} ha deciso di non inviare nessun video (perso il round a tavolino).
                                                </div>
                                            ) : round.imageId === null ? (
                                                <div className="info-immagine">
                                                    Il giocatore {getPlayerFromTurn(game, index)} non ha ancora descritto un immagine.
                                                </div>
                                            ) : (
                                                <div className="info-immagine">
                                                    <div className="descrizione-immagine">
                                                        Il giocatore {getPlayerFromTurn(game, index)} ha descritto questa immagine:
                                                    </div>

                                                    <div className="img-container">
                                                        <img alt={`Immagine per il round ${index + 1}`} src={ImageService.getImageUrl(round.imageId)} />
                                                    </div>
                                                    
                                                    <div className="descrizione-dichiarazione-immagine">
                                                        {getPlayerFromTurn(game, index)} ha dichiarato di aver detto {round.truth ? 'la verità' : 'una bugia'}.
                                                    </div>

                                                    <div className="video-player-container">
                                                        <VideoPlayer videoUrl={VideoService.getVideoUrl(round.videoId)}>
                                                        </VideoPlayer>
                                                    </div>

                                                    {
                                                        round.answer !== null ? (
                                                            <div className="descrizione-risposta-immagine">
                                                                {getOtherPlayerFromTurn(game, index)} pensa che sia {round.answer ? 'una verità' : 'una bugia'}
                                                            </div>
                                                        ) : (
                                                            <div className="descrizione-risposta-immagine">
                                                                {getOtherPlayerFromTurn(game, index)} deve ancora visionare il video.
                                                            </div>
                                                        )
                                                    }

                                                    {
                                                        round.truth !== null && round.answer !== null ? (
                                                            round.truth === round.answer ? (
                                                                <div className="descrizione-risultato-immagine">
                                                                    {getOtherPlayerFromTurn(game, index)} ha indovinato ed ha guadagnato un punto (+1).
                                                                </div>
                                                            ) : (
                                                                <div className="descrizione-risultato-immagine">
                                                                    {getOtherPlayerFromTurn(game, index)} non ha indovinato. {getPlayerFromTurn(game, index)} ha guadagnato un punto (+1).
                                                                </div>
                                                            )
                                                        ) : null
                                                    }

                                                </div>
                                            ) 
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        )
                    })
                }

                
            </Grid>
        </Grid>
        
    )
}

export default GameInfo;