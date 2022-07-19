import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

function ErrorModal({showError, setShowError, title = "Error", description, okButtonText = "Ok", onClose = null}) {

    const handleClose = (value) => {
        setShowError(false);

        if(onClose) {
            onClose();
        }
    }

    return (
        <Dialog open={showError} onClose={handleClose} aria-labelledby="error-modal">
            <DialogTitle>
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    {description}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="primary" autoFocus>
                    {okButtonText}
                </Button>
            </DialogActions>

        </Dialog>
    )
}

export default ErrorModal;