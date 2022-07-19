import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./utenti.scss";
import UserService from "../../../services/userService";
import ErrorModal from "../../common/ErrorModal";
import { useHistory, useParams } from "react-router";
import { AppBar, Box, Button, Tab, Tabs, useTheme } from "@material-ui/core";
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from "@material-ui/styles";
import Loader from "react-loader-spinner";
import ConfirmModal from "../../common/ConfirmModal";
import LoadingModal from "../../common/LoadingModal";
import GameService from "../../../services/gameService";
import ModifyUserInfoModal from "../../common/ModifyUserInfoModal";
import ModifyUserPasswordModal from "../../common/ModifyUserPasswordModal";
import AdminService from "../../../services/adminService";
import JwtService from "../../../services/jwtService";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    );
}

const useTabStyles = makeStyles({
    root: {
      justifyContent: "center"
    },
    scroller: {
      flexGrow: "0"
    }
});

function UtentiInfo() {
    const [user, setUser] = useState(null);
    const currentUser = JwtService.getDecodedToken();

    const [error, setError] = useState(false);
    const [banned, setBanned] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [unbanPlayerModalShow, setUnbanPlayerModalShow] = useState(false);
    const [banPlayerModalShow, setBanPlayerModalShow] = useState(false);
    const [modifyInfoModalShow, setModifyInfoModalShow] = useState(false);
    const [modifyPasswordModalShow, setModifyPasswordModalShow] = useState(false);
    const [deleteInfoModalShow, setDeleteInfoModalShow] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [adminModalShow, setAdminModalShow] = useState(false);

    const theme = useTheme();

    const classes = useTabStyles();

    const handleChangeTab = (event, newValue) => {
        setTabIndex(newValue);
    }

    const banPlayerModal = (ban) => {
        if(ban) {
            setBanPlayerModalShow(true);
        }
        else {
            setUnbanPlayerModalShow(true);
        }
    }

    const modifyInfoModal = () => {
        setModifyInfoModalShow(true);
    };

    const modifyPasswordModal = () => {
        setModifyPasswordModalShow(true);
    };

    const deleteInfoModal = () => {
        setDeleteInfoModalShow(true);
    };

    const { id } = useParams();

    const history = useHistory();

    useEffect(() => {
        UserService.getUser(id).then((res) => {
            setIsLoading(false);
            if(!res.error) {
                setUser(res.user);
            }
            else {
                setError(true);
            }
        })
        .catch((err) => {
            setIsLoading(false);
            setError(true);
        });
    }, [id]);

    const banPlayer = () => {
        setBanPlayerModalShow(false);
        setLoadingModal(true);
        UserService.banPlayer(user.id).then((data) => {
            setBanned(true);
            setLoadingModal(false);
        })
    }

    const unbanPlayer = () => {
        setUnbanPlayerModalShow(false);
        setLoadingModal(true);
        UserService.unbanPlayer(user.id).then((data) => {
            setBanned(false);
            setLoadingModal(false);
        })
    }

    const deleteAllInfo = () => {
        setLoadingModal(true);
        AdminService.deleteUser(user.id).then((data) => {
            setLoadingModal(false);
            history.replace("/user")
        })
    }

    const transformAdmin = () => {
        setLoadingModal(true);
        AdminService.transformAdmin(user.id, !user.admin).then((data) => {
            setLoadingModal(false);
            setUser({
                ...user,
                ...data.data.user
            })
        })
    }

    if(isLoading) {
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

    return (
        <div>
            <Navbar></Navbar>
            <div>
                <ErrorModal
                    showError={error}
                    setShowError={setError}
                    onClose={() => history.push("/")}
                    description="Errore nel recuperare le informazioni per questo utente."
                    />

                <LoadingModal
                    showModal={loadingModal}
                    setShowModal={setLoadingModal}
                    />

                {
                    user !== null ? (
                        <>
                            <ModifyUserPasswordModal
                                userInfo={user}
                                showModal={modifyPasswordModalShow}
                                setShowModal={setModifyPasswordModalShow}
                                onClose={(data) => {
                                    if(data.error) {
                                        console.log("Errore");
                                    }
                                    else {
                                        setUser({
                                            ...user,
                                            ...data.user
                                        })
                                    }
                                }}
                            />

                            <ModifyUserInfoModal
                                userInfo={user}
                                showModal={modifyInfoModalShow}
                                setShowModal={setModifyInfoModalShow}
                                onClose={(data) => {
                                    if(data.error) {
                                        console.log("Errore");
                                    }
                                    else {
                                        setUser({
                                            ...user,
                                            ...data.user
                                        })
                                    }
                                }}
                            />

                            <ConfirmModal
                                showModal={banPlayerModalShow}
                                setShowModal={setBanPlayerModalShow}
                                title={`Sicuro di voler bannare ${user.nickname}?`}
                                onClose={(value) => {
                                    if(value) {
                                        banPlayer();
                                    }
                                }}
                            />

                            <ConfirmModal
                                showModal={deleteInfoModalShow}
                                setShowModal={setDeleteInfoModalShow}
                                title={`Sicuro di voler eliminare tutti i dati dell'utente ${user.nickname}?`}
                                onClose={(value) => {
                                    if(value) {
                                        deleteAllInfo();
                                    }
                                }}
                            />

                            <ConfirmModal
                                showModal={unbanPlayerModalShow}
                                setShowModal={setUnbanPlayerModalShow}
                                title={`Sicuro di voler sbannare ${user.nickname}?`}
                                onClose={(value) => {
                                    if(value) {
                                        unbanPlayer();
                                    }
                                }}
                            />

                            <ConfirmModal
                                showModal={adminModalShow}
                                setShowModal={setAdminModalShow}
                                title={user.admin ? `Sicuro di voler togliere i privilegi di amministratore a ${user.nickname}?` : `Sicuro di voler rendere ${user.nickname} amministratore?`}
                                description='Le modifiche avranno effetto al nuovo login.'
                                onClose={(value) => {
                                    if(value) {
                                        transformAdmin();
                                    }
                                }}
                            />
                            
                            <div className="user-info-container">
                                <div className="profile-container">
                                    <div className="top-header">

                                        <div className="top-header-thumb"></div>

                                        <div className="top-header-author">
                                            <div className="author-thumb">
                                                <img alt="profile_image" className="author-image" src="/img/user_profile_image.png"/>
                                            </div>

                                            <div className="author-content">
                                                <h1 className="author-name">{user.nickname}</h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info-page-container">
                                    <div className="tab-container">
                                        <AppBar position="static">
                                            <Tabs variant="scrollable" scrollButtons="auto" value={tabIndex} onChange={handleChangeTab} classes={{ root: classes.root, scroller: classes.scroller }}>
                                                <Tab label="Informazioni"/>
                                                <Tab label={`Partite (${user.games.length})`}/>
                                                <Tab label={`Report effettuati (${user.myReportList.length})`}/>
                                                <Tab label={`Report ricevuti (${user.reportAgainstMeList.length})`}/>
                                            </Tabs>
                                        </AppBar>
                                        <SwipeableViews
                                            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                            index={tabIndex}
                                            onChangeIndex={handleChangeTab}>
                                            <TabPanel value={tabIndex} index={0}>
                                                <div className="info-player-container">
                                                    <div className="single-info-container">
                                                        <b>Email: </b> {user.email}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Nickname: </b> {user.nickname}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Admin: </b> {user.admin ? 'SI' : 'NO'}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Sesso: </b> {user.sex}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Età: </b> {user.age}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Titolo di studio conseguito: </b> {user.educationalQualification}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Partite giocate/in gioco: </b> {user.games.length}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Partite vinte: </b> {user.wins}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Partite perse: </b> {user.losses}
                                                    </div>
                                                    <div className="single-info-container">
                                                        <b>Partite pareggiate: </b> {user.draws}
                                                    </div>

                                                    <div className="single-info-container ban">
                                                        <Button variant="contained" color="primary" onClick={() => modifyInfoModal()}>Modifica informazioni {user.nickname}</Button>
                                                        <Button variant="contained" color="primary" onClick={() => modifyPasswordModal()}>Modifica password {user.nickname}</Button>
                                                        
                                                        {
                                                            currentUser.id !== user.id ? (
                                                                <>
                                                                    <Button variant="contained" color="primary" disabled={banned !== null ? banned : user.banned} onClick={() => banPlayerModal(true)}>Banna {user.nickname}</Button>
                                                                    <Button variant="contained" color="primary" disabled={banned !== null ? !banned : !user.banned} onClick={() => banPlayerModal(false)}>Sbanna {user.nickname}</Button>
                                                                    <Button variant="contained" style={{backgroundColor: '#ee6002', color: "white"}} onClick={() => setAdminModalShow(true)}>
                                                                        {user.admin ? 'Togli privilegi amministratore a' : 'Rendi amministratore'} {user.nickname}
                                                                    </Button>
                                                                    <Button variant="contained" style={{backgroundColor: 'red', color: "white"}} onClick={() => deleteInfoModal()}>Elimina informazioni {user.nickname}</Button>
                                                                </>
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>
                                            </TabPanel>
                                            <TabPanel value={tabIndex} index={1}>
                                                <div className="container-partite">
                                                    {
                                                        user.games && user.games.length > 0 ? user.games.map(game => {
                                                            return (
                                                                <div className={`single-game-container stato-${game.status === 'finished' ? (game.idWinner === 'draw' ? 'draw' : game.idWinner === id ? 'win' : 'lose' ) : game.status}`}>
                                                                    <div className="status-container">
                                                                        <b>Stato: </b> {GameService.getStatusMessage(game.status, game, id)}
                                                                    </div>
                                                                    <div className="punteggio-container">
                                                                        <div className="first-player">
                                                                            {game.punteggio.player1}
                                                                        </div>
                                                                        <div className="mid-container">
                                                                            -
                                                                        </div>
                                                                        <div className="second-player">
                                                                            {game.punteggio.player2}
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

                                                                    <div className="pulsante-info-game">
                                                                        <Button href={`/game/${game.id}`} variant="contained" color="primary">
                                                                            Visualizza informazioni del game
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }) : "Questo giocatore non ha ancora effettuato alcun gioco."
                                                    }
                                                </div>
                                            </TabPanel>
                                            <TabPanel value={tabIndex} index={2}>
                                                <div className="container-report-fatti">
                                                    {
                                                        user.myReportList && user.myReportList.length > 0 ? user.myReportList.map(report => {
                                                            return (
                                                                <SingleReport
                                                                    report={report}
                                                                />
                                                            )
                                                        }) : "Questo giocatore non ha ancora fatto alcun report."
                                                    }
                                                </div>
                                            </TabPanel>
                                            <TabPanel value={tabIndex} index={3}>
                                                <div className="container-report-ricevuti">
                                                    {
                                                        user.reportAgainstMeList && user.reportAgainstMeList.length > 0 ? user.reportAgainstMeList.map(report => {
                                                            return (
                                                                <SingleReport
                                                                    report={report}
                                                                />
                                                            )
                                                        }) : "Questo giocatore non ha ancora ricevuto alcun report."
                                                    }
                                                </div>
                                            </TabPanel>
                                        </SwipeableViews>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null
                }

            </div>
        </div>);
}

function SingleReport({ report }) {
    return (
        <div className="single-report-container">
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

            <div className="pulsante-info-report">
                <Button href={`/report/${report.id}`} variant="contained" color="primary">
                    Visualizza informazioni del report
                </Button>
            </div>
        </div>
    )
}

export default UtentiInfo;