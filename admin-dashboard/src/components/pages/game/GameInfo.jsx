import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./game.scss";
import GameService from "../../../services/gameService";
import { useParams } from "react-router";
import GameInfoTemplate from "../../common/GameInfo";
import Loader from "react-loader-spinner";

function GameInfo() {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();

    useEffect(() => {
        GameService.getGame(id).then((res) => {
            setGame(res.game);
            setLoading(false);
        });
    }, [id]);

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

    if(!game) {
        return ""
    }

    return (
        <div>
            <Navbar></Navbar>
            <div className="container-game">
                <GameInfoTemplate
                    game={game}
                /> 
            </div>
        </div>
    )
}

export default GameInfo;