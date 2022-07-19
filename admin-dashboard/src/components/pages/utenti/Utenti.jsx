import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./utenti.scss";
import UserService from "../../../services/userService";
import ErrorModal from "../../common/ErrorModal";
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import { useHistory } from "react-router";
import Loader from "react-loader-spinner";

function Utenti() {
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        UserService.getAllUsers().then((res) => {
            setIsLoading(false);
            if(!res.error) {
                setUsers(res.data);
            }
            else {
                setError(true);
            }
        })
        .catch((err) => {
            setIsLoading(false);
            setError(true);
        });
    }, []);

    const columnWidth = 100/9 + "%";

    const history = useHistory();

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
        <div className="list-users-container">
            <Navbar></Navbar>

            <div className="section-info-title">
                Numero totale di utenti: <b>{users.length}</b>
            </div>

            <div>
                <ErrorModal
                    showError={error}
                    setShowError={setError}
                    onClose={() => history.push("/")}
                    description="Errore nel recuperare la lista degli utenti."
                    />

                <div className="search-bar-container">
                    <TextField
                        type="text"
                        label="Cerca"
                        placeholder="Email/Nickname"
                        fullWidth
                        name="user_info"
                        variant="outlined"
                        value={searchText}
                        onChange={(event) =>{
                            setSearchText(event.target.value)
                        }}
                        required
                        autoFocus
                    />
                </div>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{width: columnWidth}}>Email</TableCell>
                                <TableCell style={{width: columnWidth}}>Nickname</TableCell>
                                <TableCell style={{width: columnWidth}}>Vittorie</TableCell>
                                <TableCell style={{width: columnWidth}}>Pareggi</TableCell>
                                <TableCell style={{width: columnWidth}}>Sconfitte</TableCell>
                                <TableCell style={{width: columnWidth}}>Punti totali</TableCell>
                                <TableCell style={{width: columnWidth}}>Stato</TableCell>
                                <TableCell style={{width: columnWidth}}>Admin</TableCell>
                                <TableCell style={{width: columnWidth}}>Azioni</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {
                                users.filter((user) => {
                                    return user.email.includes(searchText) || user.nickname.includes(searchText);
                                }).map((user, index) => {
                                    return (
                                        <TableRow key={index} >
                                            <TableCell style={{width: columnWidth}}>
                                                {user.email}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.nickname}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.wins}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.draws}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.losses}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.points}
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                <div className="cella-stato" >
                                                    {
                                                        !user.banned ? (
                                                            <>
                                                                <CheckIcon /> Attivo
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CloseIcon /> Bannato
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell style={{width: columnWidth}}>
                                                {user.admin ? 'SI' : 'NO'}
                                            </TableCell>  
                                            <TableCell style={{width: columnWidth}}>
                                                <Button href={`user/${user.id}`} variant="contained" color="primary">
                                                    Visualizza e/o modifica informazioni
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

export default Utenti;