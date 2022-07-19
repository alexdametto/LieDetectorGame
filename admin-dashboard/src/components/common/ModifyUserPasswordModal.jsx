import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import AdminService from '../../services/adminService';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';

function ModifyUserPasswordModal({showModal, setShowModal, onClose = null, userInfo = {}}) {
    const [user, setUser] = useState({
        newPassword: "",
        newPasswordConfirm: ""
    });
    const [loadingModal, setLoadingModal] = useState(false);
    const [campiNonPopolatiError, setCampiNonPopolatiError] = useState(false);
    const [campiDiversiError, setCampiDiversiError] = useState(false);

    const handleClose = () => {
        setShowModal(false);
    }

    const handleConfirm = () => {
        if(user.newPassword.length === 0 || user.newPasswordConfirm.length === 0) {
            // campi da popolare
            setCampiNonPopolatiError(true);
            return;
        }
        if(user.newPassword !== user.newPasswordConfirm) {
            // password diverse
            setCampiDiversiError(true);
            return;
        }

        setLoadingModal(true);
        AdminService.changePassword(userInfo.id, user.newPassword).then((data) => {
            setLoadingModal(false);
            setShowModal(false);

            if(onClose) {
                onClose(data.data);
            }
        });
    }

    return (
        <Dialog className="modify-user-info-modal" disableBackdropClick="true" open={showModal} onClose={handleClose} aria-labelledby="error-modal">
            <ErrorModal
                showError={campiNonPopolatiError}
                setShowError={setCampiNonPopolatiError}
                title="Errore"
                description="I campi obbligatori non sono stati popolati."
                />

            <ErrorModal
                showError={campiDiversiError}
                setShowError={setCampiDiversiError}
                title="Errore"
                description="Le password inserite non corrispondono."
                />
            
            <LoadingModal
                showModal={loadingModal}
                setShowModal={setLoadingModal}
                />

            <DialogTitle>
                Modifica password
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    In questo modale puoi modificare la password dell'utente.
                </DialogContentText>

                <div className='modify-form-info'>
                    <TextField
                        type="password"
                        label="Password"
                        placeholder="Password"
                        fullWidth
                        name="Password"
                        variant="outlined"
                        value={user.newPassword}
                        onChange={(event) =>{
                            const newUser = {
                                ...user,
                                newPassword: event.target.value
                            }
                            setUser(newUser)
                        }}
                        required
                        autoFocus
                    />
                </div>

                <div className='modify-form-info'>
                    <TextField
                        type="password"
                        label="Conferma password"
                        placeholder="Conferma password"
                        fullWidth
                        name="Password_confirm"
                        variant="outlined"
                        value={user.newPasswordConfirm}
                        onChange={(event) =>{
                            const newUser = {
                                ...user,
                                newPasswordConfirm: event.target.value
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

export default ModifyUserPasswordModal;