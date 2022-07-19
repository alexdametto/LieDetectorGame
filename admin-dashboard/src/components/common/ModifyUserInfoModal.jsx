import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import AdminService from '../../services/adminService';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';

function ModifyUserInfoModal({showModal, setShowModal, onClose = null, userInfo = {}}) {
    const [user, setUser] = useState({
        nickname: userInfo.nickname,
        sex: userInfo.sex,
        educationalQualification: userInfo.educationalQualification,
        age: userInfo.age
    });
    const [loadingModal, setLoadingModal] = useState(false);
    const [errorCampi, setErrorCampi] = useState(false);
    const [errorNickname, setErrorNickname] = useState(false);

    const handleClose = () => {
        setShowModal(false);
    }

    const handleConfirm = () => {
        if(user.nickname === "" || user.sex === "" || user.educationalQualification === "" || user.age === "") {
            // campi non popolati
            setErrorCampi(true);
            return;
        }

        setLoadingModal(true);
        AdminService.changeUserInfo(userInfo.id, user).then((data) => {
            setLoadingModal(false);
            setShowModal(false);

            if(onClose) {
                onClose(data.data);
            }
        }).catch(err => {
            setLoadingModal(false);
            setErrorNickname(true);
        });
    }

    return (
        <Dialog className="modify-user-info-modal" disableBackdropClick="true" open={showModal} onClose={handleClose} aria-labelledby="error-modal">
            <LoadingModal
                showModal={loadingModal}
                setShowModal={setLoadingModal}
                />

            <ErrorModal
                showError={errorCampi}
                setShowError={setErrorCampi}
                title="Errore"
                description="Tutti i campi sono obbligatori."
                />

            <ErrorModal
                showError={errorNickname}
                setShowError={setErrorNickname}
                title="Errore"
                description="Il nickname deve essere univoco."
                />

            <DialogTitle>
                Modifica dati
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    In questo modale puoi modificare i dati dell'utente. E' necessario effettuare logout e login nell'app per la visualizzazione delle modifiche.
                </DialogContentText>

                <div className='modify-form-info'>
                    <TextField
                        type="text"
                        label="Nickname"
                        placeholder="Nickname"
                        fullWidth
                        name="nickname"
                        variant="outlined"
                        value={user.nickname}
                        onChange={(event) =>{
                            const newUser = {
                                ...user,
                                nickname: event.target.value
                            }
                            setUser(newUser)
                        }}
                        required
                        autoFocus
                    />
                </div>

                <div className='modify-form-info'>
                    <InputLabel id="sex-label">Sesso</InputLabel>
                    <Select
                        labelId="sex-label"
                        label="Sesso"
                        fullWidth
                        displayEmpty
                        value={user.sex}
                        required
                        onChange={(event) => {
                            const newUser = {
                                ...user,
                                sex: event.target.value
                            }
                            setUser(newUser)
                        }}
                        
                    >
                        <MenuItem value="">Non assegnato</MenuItem>
                        <MenuItem value="Maschio">Maschio</MenuItem>
                        <MenuItem value="Femmina">Femmina</MenuItem>
                    </Select>
                </div>

                <div className='modify-form-info'>
                    <InputLabel id="educationalQualification-label">Titolo di studio conseguito</InputLabel>
                    <Select
                        labelId="educationalQualification-label"
                        label="Titolo di studio conseguito"
                        fullWidth
                        displayEmpty
                        required
                        value={user.educationalQualification}
                        onChange={(event) => {
                            const newUser = {
                                ...user,
                                educationalQualification: event.target.value
                            }
                            setUser(newUser)
                        }}
                        
                    >
                        <MenuItem value="">Non assegnato</MenuItem>
                        <MenuItem value="Scuola elementare">Scuola elementare</MenuItem>
                        <MenuItem value="Scuola media">Scuola media</MenuItem>
                        <MenuItem value="Scuola superiore">Scuola superiore</MenuItem>
                        <MenuItem value="Laurea Triennale">Laurea Triennale</MenuItem>
                        <MenuItem value="Laurea Magistrale">Laurea Magistrale</MenuItem>
                        <MenuItem value="Specializzazione/Master/Dottorato/altro">Specializzazione/Master/Dottorato/altro</MenuItem>
                    </Select>
                </div>

                <div className='modify-form-info'>
                    <TextField
                        type="number"
                        placeholder="Età"
                        fullWidth
                        name="age"
                        label="Età"
                        variant="outlined"
                        value={user.age}
                        onChange={(event) =>{
                            const newUser = {
                                ...user,
                                age: event.target.value
                            }
                            setUser(newUser)
                        }}
                        required
                        autoFocus
                    />
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => handleClose()} color="primary" autoFocus>
                    ANNULLA
                </Button>
                
                <Button onClick={() => handleConfirm()} color="primary" autoFocus>
                    CONFERMA
                </Button>
            </DialogActions>

        </Dialog>
    )
}

export default ModifyUserInfoModal;