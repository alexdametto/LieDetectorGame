import { Dialog, LinearProgress, Typography } from '@material-ui/core';
import React from 'react';

function LinearProgressWithLabel(props) {
    return (
        <div className='progress-container'>
            <span className='center-text'>
                CARICAMENTO IN CORSO
            </span>
            <span>
                <LinearProgress variant="determinate" {...props} />
            </span>
            <span className='center-text'>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                props.value,
                )}%`}</Typography>
            </span>
        </div>
    );
}

function ProgressBarModal({showModal, percent = 0}) {

    return (
        <Dialog disableBackdropClick="true" open={showModal} aria-labelledby="loading-modal">
            <div className="progress-container-modal">
                <LinearProgressWithLabel value={percent} />
            </div>
        </Dialog>
    )
}

export default ProgressBarModal;