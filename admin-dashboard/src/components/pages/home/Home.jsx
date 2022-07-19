import React, { useEffect, useState } from 'react';
import { Redirect } from "react-router-dom";
import Navbar from "./../../common/navbar/Navbar";
import JwtService from "../../../services/jwtService";
import AuthService from "../../../services/authService";
import AdminService from "../../../services/adminService";
import { Scrollbars } from 'react-custom-scrollbars';
import "./home.scss";
import { Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import ReportSerivce from '../../../services/reportService';
import Loader from "react-loader-spinner";

function Home() {
    let token = JwtService.getDecodedToken();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGames: 0,
        activeGames: 0
    });

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [loadingStatistiche, setLoadingStatistiche] = useState(true);
    const [loadingReport, setLoadingReport] = useState(true);

    useEffect(() => {
        if(token === null) {
            setError(true);
            setLoading(false);
        }
        else {
            // renew
            AuthService.renew().then(response => {
                if(!response.error) {
                    JwtService.setToken(response.token);
                    setError(false);
                }
                else {
                    setError(true);
                }
                setLoading(false);
            });
        }
    }, [token]);

    useEffect(() => {
        AdminService.getStats().then((res) => {
            setStats(res.data);
            setLoadingStatistiche(false);
        });
    }, [])

    useEffect(() => {
        ReportSerivce.getReports().then((res) => {
            setReports(res.reports.filter(a => !a.closed).slice(0, 10));
            setLoadingReport(false);
        });
    }, []);

    const columnWidthReport = 100/2 + "%";

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

    return !loading && !error ? (
        <div className="home-container">
            <Navbar></Navbar>

            <div className="card-container">
                <div className="first-row">
                    <Card className="comandi-admin">
                        <div className="card-content">
                            <div className="header-card">
                                <div className="card-title">
                                    Comandi Admin
                                </div>
                            </div>

                            <div className="card-content-section comandi-admin-section">
                                <Button href="foto" variant="contained" color="primary">
                                    Gestisci foto
                                </Button>

                                <Button href="user" variant="contained" color="primary">
                                    Gestisci utenti
                                </Button>

                                <Button href="game" variant="contained" color="primary">
                                    Gestisci partite
                                </Button>

                                <Button href="consent" variant="contained" color="primary">
                                    Modifica testo Termini e Condizioni e Privacy
                                </Button>
                            </div>
                        </div>

                    </Card>

                    <Card className="leaderboard">
                        <div className="card-content">
                            <div className="header-card">
                                <div className="card-title">
                                    Statistiche globali
                                </div>

                                <Button href="leaderboard" variant="contained" color="primary">
                                    Vedi la leaderboard
                                </Button>
                            </div>

                            {
                                loadingStatistiche ? (
                                    <div className="loader-container">
                                        <Loader
                                            type="TailSpin"
                                            color="#00BFFF"
                                            height={100}
                                            width={100}
                                        />
                                    </div>
                                ) : (
                                    <div className="card-content-section stats">
                                        <Card variant="outlined">
                                            <div className="stats-title">
                                                Player totali
                                            </div>
                                            <div className="stats-value">
                                                {stats.totalUsers}
                                            </div>
                                        </Card>

                                        <Card variant="outlined">
                                            <div className="stats-title">
                                                Game totali
                                            </div>
                                            <div className="stats-value">
                                                {stats.totalGames}
                                            </div>
                                        </Card>

                                        <Card variant="outlined">
                                            <div className="stats-title">
                                                Game attivi
                                            </div>
                                            <div className="stats-value">
                                                {stats.activeGames}
                                            </div>
                                        </Card>
                                    </div>
                                )
                            }

                            
                        </div>

                    </Card>

                </div>

                <div className="second-row">
                    <Card className="report">
                        <div className="card-content">
                            <div className="header-card">
                                <div className="card-title">
                                    Report
                                </div>

                                <Button href="report" variant="contained" color="primary">
                                    Vedi tutti i report
                                </Button>
                            </div>

                            <Scrollbars style={{ height: 300 }}>
                                <div className="card-content-section">
                                    {
                                        loadingReport ? (
                                            <div className="loader-container">
                                                <Loader
                                                    type="TailSpin"
                                                    color="#00BFFF"
                                                    height={100}
                                                    width={100}
                                                />
                                            </div>
                                        ) : (
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell style={{width: columnWidthReport}}>Player</TableCell>
                                                            <TableCell style={{width: columnWidthReport}}>Motivazione</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {
                                                            reports.map((report, index) => {
                                                                return (
                                                                    <TableRow key={index}>
                                                                        <TableCell style={{width: columnWidthReport}}>
                                                                            {report.reported.nickname}
                                                                        </TableCell>
                                                                        <TableCell style={{width: columnWidthReport}}>
                                                                            {report.reason}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            })
                                                        }

                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )
                                    }

                                    
                                </div>
                            </Scrollbars>
                        </div>

                    </Card>
                </div>

            </div>
        </div>
    ) : !error ? (
        <div>Loading ...</div>
    ) : <Redirect to="/login"></Redirect>
}

export default Home;