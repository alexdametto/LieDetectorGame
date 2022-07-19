import { AppBar, Button, Toolbar } from "@material-ui/core";
import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./report.scss";
import ReportService from "../../../services/reportService";
import {useParams} from "react-router-dom";
import UserService from "../../../services/userService";
import GameInfo from "../../common/GameInfo";
import Loader from "react-loader-spinner";
import LoadingModal from "../../common/LoadingModal";
import ConfirmModal from "../../common/ConfirmModal";
import GameService from "../../../services/gameService";

function ReportInfo() {
    const [report, setReport] = useState(null);
    const [banned, setBanned] = useState(false);
    const [closed, setClosed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingModal, setLoadingModal] = useState(false);
    const [banModal, setBanModal] = useState(false);
    const [closeReportModal, setCloseReportModal] = useState(false);
    const [updateWinnerModal, setUpdateWinnerModal] = useState(false);

    const { id } = useParams();

    useEffect(() => {
        ReportService.getReportInfo(id).then((res) => {
            setReport(res.report);
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

    if(!report) {
        return null;
    }

    const banPlayerModal = () => {
        setBanModal(true);
    }

    const closeReportModalHandler = () => {
        setCloseReportModal(true);
    }

    const banPlayer = (report) => {
        setBanModal(false);
        setLoadingModal(true);
        UserService.banPlayer(report.reported.id).then((data) => {
            setBanned(true);
            setLoadingModal(false);
        })
    }

    const closeReport = (report) => {
        setCloseReportModal(false);
        setLoadingModal(true);
        ReportService.closeReport(report.id).then((data) => {
            setClosed(true);
            setLoadingModal(false);
        })
    }

    const showUpdateWinnerModal = () => {
        setUpdateWinnerModal(true);
    }

    const updateWinner = () => {
        setUpdateWinnerModal(false);
        setLoadingModal(true);

        const winner = report.game.idWinner === report.game.idPlayer1.id ? report.game.idPlayer2.id : report.game.idPlayer1.id;

        GameService.updateWinner(report.game.id, winner).then((data) => {
            setReport({
                ...report,
                game: data.game
            })
            setLoadingModal(false);
        })
    }

    return (
        <div className="report-info-page">
            <Navbar></Navbar>

            <LoadingModal
                showModal={loadingModal}
                setShowModal={setLoadingModal}
                />

            <ConfirmModal
                showModal={updateWinnerModal}
                setShowModal={setUpdateWinnerModal}
                title={`Sicuro di voler rendere il giocatore ${report.game.idWinner === report.game.idPlayer1.id ? report.game.idPlayer2.nickname : report.game.idPlayer1.nickname} vincitore?`}
                onClose={(value) => {
                    if(value) {
                        updateWinner();
                    }
                }}
                />

            <ConfirmModal
                showModal={banModal}
                setShowModal={setBanModal}
                title={`Sicuro di voler bannare il giocatore ${report.reported.nickname}?`}
                onClose={(value) => {
                    if(value) {
                        banPlayer(report);
                    }
                }}
                />

            <ConfirmModal
                showModal={closeReportModal}
                setShowModal={setCloseReportModal}
                title={`Sicuro di voler chiudere questo report?`}
                onClose={(value) => {
                    if(value) {
                        closeReport(report);
                    }
                }}
                />

            <AppBar position="static">
                <Toolbar className="toolbar-buttons">
                    <Button variant="contained" disabled={banned || report.reported.banned} onClick={() => banPlayerModal()}>Banna {report.reported.nickname}</Button>
                    <Button variant="contained" disabled={closed || report.closed} onClick={() => closeReportModalHandler()}>Chiudi report</Button>
                    {
                        report.game.idWinner || report.game.turnNumber === -1 ? (
                            <Button variant="contained" disabled={closed || report.closed} onClick={() => showUpdateWinnerModal()}>Rendi {report.game.idWinner === report.game.idPlayer1.id ? report.game.idPlayer2.nickname : report.game.idPlayer1.nickname} vincitore</Button>
                        ) : null
                    }
                </Toolbar>
            </AppBar>

            <div className="report-info">

                <div className="reporter">
                    <b>Report da:</b> {report.sender.nickname}
                </div>

                <div className="reported">
                   <b>Giocatore segnalato:</b> {report.reported.nickname}
                </div>

                <div className="reason">
                    <b>Motivazione:</b> {report.reason}
                </div>

                <div className="description">
                    <b>Descrizione:</b> {report.description ? report.description : 'Nessuna descrizione'}
                </div>

                <GameInfo
                    game={report.game}
                />

            </div>
            
            
        </div>
    )
}

export default ReportInfo;