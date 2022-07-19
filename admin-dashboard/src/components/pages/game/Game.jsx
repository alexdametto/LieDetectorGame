import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./game.scss";
import GameService from "../../../services/gameService";
import Loader from "react-loader-spinner";

function Game() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GameService.getGames().then((res) => {
            console.log(res.games);
            setGames(res.games);
            setLoading(false);
        });
    }, []);

    if(loading) {
        return (
            <div className="loader-container">
                <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={100}
                    width={100}
                />
            </div>
        )
    }

    const columnWidth = 100/4 + "%";

    return (
        <div>
            <Navbar></Navbar>

            <div className="section-info-title">
                Numero totale di giochi: <b>{games.length}</b>
            </div>
            
            <div>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{width: columnWidth}}>Player 1</TableCell>
                                <TableCell style={{width: columnWidth}}>Player 2</TableCell>
                                <TableCell style={{width: columnWidth}}>Stato</TableCell>
                                <TableCell style={{width: columnWidth}}>Azioni</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {
                                games.map((game, index) => {
                                    return (
                                        <TableRow key={index} >
                                            <TableCell style={{width: columnWidth}}>
                                                {game.idPlayer1.nickname}
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                {game.idPlayer2 ? game.idPlayer2.nickname : "N.D."}
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                <div>
                                                {game.status === "finished" ? "Terminato" : GameService.getStatusMessage(game.status, game, undefined)}
                                                </div>
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                <Button href={`/game/${game.id}`} variant="contained" color="primary">
                                                    Visualizza informazioni
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                        </TableBody>
                    </Table>
                    

                </TableContainer>

            </div>
        </div>
    )
}

export default Game;