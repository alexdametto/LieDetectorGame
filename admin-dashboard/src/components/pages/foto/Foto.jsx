import { AppBar, Button, Modal, Slider, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from "@material-ui/core";
import Navbar from "./../../common/navbar/Navbar";
import { useState, useEffect } from "react";
import "./foto.scss";
import ImageService from "../../../services/imageService";
import Loader from "react-loader-spinner";
import LoadingModal from "../../common/LoadingModal";
import ConfirmModal from "../../common/ConfirmModal";
import ProgressBarModal from "../../common/ProgressBarModal";

function Foto() {
    const [modalInsert, setModalInsert] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingModal, setLoadingModal] = useState(false);
    const [pictures, setPictures] = useState([]);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalDeleteAll, setModalDeleteAll] = useState(false);
    const [loadImage, setLoadImage] = useState(0);
    const [image, setImage] = useState(null);
    const [imageIndex, setImageIndex] = useState(-1);
    const [imageComplexity, setImageComplexity] = useState(1);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    const handleOpenModalInsert = () => {
        setPictures([]);
        setImageComplexity(1);
        setModalInsert(true);
    }

    const handleCloseModalInsert = () => {
        setModalInsert(false);
    }

    const setPictureState = (e) => {
        const newPictures = Array.from(e.target.files).map((file) => {
            return {
                picturePreview: URL.createObjectURL(file),
                pictureAsFile: file,
                name: file.name
            }
        });

        setPictures(newPictures);
    }

    const uploadPicture = () => {
        setProgress(0);
        setShowProgress(true);
        ImageService.uploadImageMultiple(pictures.map(p => p.pictureAsFile), imageComplexity, (progress) => {
            setProgress(progress);
        }).then((res) => {
            setModalInsert(false);
            setLoadImage(loadImage + 1);
            setShowProgress(false);
        });
    }

    const [images, setImages] = useState([]);

    useEffect(() => {
        ImageService.getImages().then((res) => {
            setImages(res.images);
            setLoading(false);
        });
    }, [loadImage]);

    const handleOpemModalDelete = (image, imageIndex) => {
        setModalDelete(true);
        setImage(image);
        setImageIndex(imageIndex);
    }

    const handleOpenModalDeleteAll = () => {
        setModalDeleteAll(true);
    }

    const handleDeleteAll = () => {
        setLoadingModal(true);
        ImageService.deleteAll().then((res) => {
            setLoadingModal(false);
            if(!res.error) {
                setImages([]);
            }
            else {
                console.log(res);
            }
        })
        .catch(err => {
            console.log("err", err);
        });
    }

    const deleteImage = () => {
        setLoadingModal(true);
        ImageService.deleteImage(image._id).then((res) => {
            setLoadingModal(false);
            if(!res.error) {
                setImages(images.filter((elem, idx) => idx !== imageIndex));
            }
            else {
                console.log(res);
            }
            
        });
    }

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

    const colWidth = 100/4 + "%";

    return (
        <div>
            <Navbar></Navbar>

            <LoadingModal
                showModal={loadingModal}
                setShowModal={setLoadingModal}
                />
            
            <ProgressBarModal
                showModal={showProgress}
                percent={progress}
                />

            <ConfirmModal
                showModal={modalDelete}
                setShowModal={setModalDelete}
                title={`Sicuro di voler cancellare l'immagine? Attenzione che i video non verranno cancellati, perciò perderanno riferimento all'immagine. E' consigliato effettuare un export del database prima di effettuare la cancellazione delle immagini`}
                onClose={(value) => {
                    if(value) {
                        deleteImage();
                    }
                }}
                />

            <ConfirmModal
                showModal={modalDeleteAll}
                setShowModal={setModalDeleteAll}
                title={`Sicuro di voler cancellare TUTTE le immagini? Attenzione che i video non verranno cancellati, perciò perderanno riferimento all'immagine. E' consigliato effettuare un export del database prima di effettuare la cancellazione delle immagini.`}
                onClose={(value) => {
                    if(value) {
                        handleDeleteAll();
                    }
                }}
                />

            <div>

                <AppBar position="static">
                    <Toolbar className="toolbar-buttons">

                        <Button variant="contained" onClick={() => handleOpenModalInsert()}>Inserisci immagini</Button>
                        {
                            images.length > 0 ? (
                                <Button variant="contained" style={{backgroundColor: 'red', color: "white"}} onClick={() => handleOpenModalDeleteAll()}>Elimina tutte le immagini</Button>
                            ) : null
                        }

                        
                        <div className="section-info-title">
                            Numero totale di immagini: <b>{images.length}</b>
                        </div>
                    </Toolbar>
                </AppBar>
                <div>
                    <TableContainer>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{width: colWidth}}>ID immagine</TableCell>
                                <TableCell style={{width: colWidth}}>Immagine</TableCell>
                                <TableCell style={{width: colWidth}}>Complessità</TableCell>
                                <TableCell style={{width: colWidth}}>Azioni</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {
                                images.map((image, index) => {
                                    return (
                                        <TableRow key={index} className="riga-img">
                                            <TableCell style={{width: colWidth}}>
                                                <b>{image._id}</b>
                                            </TableCell>
                                            <TableCell style={{width: colWidth}}>
                                                <img alt={image._id} src={process.env.REACT_APP_API_URL + "public/" + image._id}>
                                                </img>
                                            </TableCell>

                                            <TableCell style={{width: colWidth, textAlign: 'center'}}>
                                                <b>{image.metadata && image.metadata.complexity ? image.metadata.complexity : 'NON DEFINITA'}</b>
                                            </TableCell>

                                            <TableCell style={{width: colWidth}}>
                                                <Button variant="contained" style={{backgroundColor: 'red', color: "white"}} onClick={() => handleOpemModalDelete(image, index)}>
                                                    ELIMINA
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                        </TableBody>

                    </TableContainer>
                </div>

                

            </div>

            <Modal
                open={modalInsert}
                className="modal modal-insert-images"
                onClose={handleCloseModalInsert}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                >

                <div className="modal-content">
                    <div className="modal-title">Carica delle immagini</div>
                    <div className="modal-description">
                        Seleziona una o più immagini per poterle caricare. Queste immagini saranno utilizzare nell'app.
                    </div>

                    <div className="input-container">
                        <input type="file" multiple name="upload" onChange={setPictureState}></input>
                    </div>

                    {
                        pictures.length > 0 ? (
                            <>
                                <div className="modal-description">
                                    <b>File selezionati:</b> {pictures.map(p => p.name).join(', ')}
                                </div>
                            </>
                        ) : null
                    }
                    
                    {
                        pictures.length > 0 ? (
                            <>
                                <div className="modal-description">
                                    Indica il livello di <b>complessità</b> delle immagini. Valore attuale: <b>{imageComplexity}</b>
                                </div>

                                <div className="modal-description slider-container">
                                    <span className="minValue">
                                        <b>1</b>
                                    </span>
                                    <Slider marks min={1} max={10} value={imageComplexity} onChange={(e, newValue) => {
                                        setImageComplexity(newValue);
                                    }} aria-label="Image Complexity" valueLabelDisplay="auto" />
                                    <span className="maxValue">
                                        <b>10</b>
                                    </span>
                                </div>
                            </>
                        ) : null
                    }

                    <div className="action-button-container">
                        <Button variant="contained" color="primary" onClick={() => uploadPicture()}>Carica immagine</Button>
                        <Button variant="contained" color="primary" onClick={() => handleCloseModalInsert()}>Chiudi</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}


export default Foto;