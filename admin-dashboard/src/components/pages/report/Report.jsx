import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./report.scss";
import ReportService from "../../../services/reportService";
import Loader from "react-loader-spinner";

function Report() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ReportService.getReports().then((res) => {
            setReports(res.reports.sort((a, b) => {
                if(a.closed && b.closed) {
                    return 0;
                }
                else if(a.closed) {
                    return 1;
                }
                else if(b.closed) {
                    return 0;
                }
                else return 0;
            }));
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

    const columnWidth = 100/5 + "%";

    return (
        <div>
            <Navbar></Navbar>

            <div className="section-info-title">
                Numero totale di report: <b>{reports.length}</b>
            </div>

            <div>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{width: columnWidth}}>Player</TableCell>
                                <TableCell style={{width: columnWidth}}>Motivazione</TableCell>
                                <TableCell style={{width: columnWidth}}>Descrizione</TableCell>
                                <TableCell style={{width: columnWidth}}>Stato</TableCell>
                                <TableCell style={{width: columnWidth}}>Azioni</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {
                                reports.map((report, index) => {
                                    return (
                                        <TableRow key={index} >
                                            <TableCell style={{width: columnWidth}}>
                                                {report.reported.nickname}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {report.reason}
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                {report.description ? report.description : 'Nessuna descrizione'}
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                {report.closed ? 'Chiuso' : 'Aperto'}
                                            </TableCell>

                                            <TableCell style={{width: columnWidth}}>
                                                <Button href={`report/${report.id}`} variant="contained" color="primary">
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

export default Report;