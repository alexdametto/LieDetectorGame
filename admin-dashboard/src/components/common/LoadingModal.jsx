import { Dialog } from '@material-ui/core';
import React from 'react';
import Loader from "react-loader-spinner";

function LoadingModal({showModal, setShowModal}) {

    const handleClose = () => {
        setShowModal(false);
    }

    return (
        <Dialog disableBackdropClick="true" open={showModal} onClose={handleClose} aria-labelledby="loading-modal">
            <div className="loader-container-modal">
                <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={100}
                    width={100}
                />
            </div>
        </Dialog>
    )
}

export default LoadingModal;