import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

function ConfirmModal({showModal, setShowModal, title = "Error", description, onClose = null}) {

    const handleClose = (value) => {
        setShowModal(false);

        if(onClose) {
            onClose(value);
        }
    }

    return (
        <Dialog disableBackdropClick="true" open={showModal} onClose={handleClose} aria-labelledby="error-modal">
            <DialogTitle>
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    {description}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => handleClose(false)} color="primary" autoFocus>
                    ANNULLA
                </Button>
                
                <Button onClick={() => handleClose(true)} color="primary" autoFocus>
                    CONFERMA
                </Button>
            </DialogActions>

        </Dialog>
    )
}

export default ConfirmModal;