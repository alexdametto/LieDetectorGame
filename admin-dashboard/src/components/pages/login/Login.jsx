import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import {
    Button,
    TextField,
    Grid,
    Paper,
    AppBar,
    Typography,
    Toolbar
} from "@material-ui/core";

import AuthService from "../../../services/authService";
import JwtService from "../../../services/jwtService";
import ErrorModal from "../../common/ErrorModal";
import LoadingModal from "../../common/LoadingModal";
import "./login.scss";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [wrongPassword, setWrongPassword] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);

    let history = useHistory();

    const handleSubmit = () => {
        setLoadingModal(true);
        AuthService.login(email.replace(/ /g,''), password).then(async response => {
            setLoadingModal(false);
            if(response.ok) {
                const body = await response.json();
                JwtService.setToken(body.token);
                history.push("/");
            }
            else {
                if(response.status === 404) {
                    // utente non trovato
                    setUserNotFound(true);
                }
                else if(response.status === 401) {
                    // password errata o utente non admin
                    setWrongPassword(true);
                }
            }
        }).catch((error) => {
            setLoadingModal(false);
            setError(true);
        });
    }

    return (
        <div className="login-page-container">

            <LoadingModal
                showModal={loadingModal}
                setShowModal={setLoadingModal}
                />
                
            <ErrorModal
                showError={userNotFound}
                setShowError={setUserNotFound}
                title="Errore"
                description="Utente non trovato oppure non admin."
                />

            <ErrorModal
                showError={wrongPassword}
                setShowError={setWrongPassword}
                title="Errore"
                description="Password errata."
                />

            <ErrorModal
                showError={error}
                setShowError={setError}
                title="Errore"
                description="Errore generico nella comunicazione con il server."
                />
                
            <AppBar position="static" alignitems="center" color="primary">
                <Toolbar>
                <Grid container justify="center" wrap="wrap">
                    <Grid item>
                        <Typography variant="h6">Lie Detection - Admin Dashboard</Typography>
                    </Grid>
                </Grid>
                </Toolbar>
            </AppBar>
            <Grid className="login-form-container" container spacing={0} justify="center" direction="row">
                <Grid item>
                    <Grid container direction="column" justify="center" className="login-form">
                        <Paper
                            variant="elevation"
                            elevation={2}
                            className="login-background">
                            <Grid item>
                                <Typography component="h1" variant="h5">
                                    Effettua l'accesso
                                </Typography>
                            </Grid>
                            <Grid item className="input-container">
                                <Grid container direction="column" spacing={2}>
                                    <Grid item>
                                        <TextField
                                            type="text"
                                            label="Email"
                                            placeholder="Email"
                                            fullWidth
                                            name="email"
                                            variant="outlined"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            required
                                            autoFocus
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            type="password"
                                            label="Password"
                                            placeholder="Password"
                                            fullWidth
                                            name="password"
                                            variant="outlined"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            required
                                        />
                                    </Grid>
                                    <Grid item className="submit-container">
                                        <Button
                                            disabled={error || password === "" || email === ""}
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSubmit()}
                                            className="button-block">
                                            LOGIN
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default Login;