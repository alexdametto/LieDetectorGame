import { Button } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";
import AdminService from "../../../services/adminService";
import PublicService from "../../../services/publicService";
import ConfirmModal from "../../common/ConfirmModal";
import LoadingModal from "../../common/LoadingModal";
import Navbar from "../../common/navbar/Navbar";
import "./changeConsent.scss";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function ChangeConsent() {
    const [loading, setLoading] = useState(true);
    const [modalConfirm, setModalConfirm] = useState(false);
    const [modalConfirmPrivacy, setModalConfirmPrivacy] = useState(false);
    const [consent, setConsent] = useState("");
    const [privacy, setPrivacy] = useState("");

    useEffect(() => {
        PublicService.getConsent().then((data) => {
            setConsent(data);
            PublicService.getPrivacy().then((data) => {
                setPrivacy(data);
                setLoading(false);
            });
        });
    }, []);

    const updateConsent = () => {
        setLoading(true);
        AdminService.updateConsent(consent).then((response) => {
            setLoading(false);
        })
    }

    const updatePrivacy = () => {
        setLoading(true);
        AdminService.updatePrivacy(privacy).then((response) => {
            setLoading(false);
        })
    }

    return (
        <div>
            <Navbar/>

            <LoadingModal
                showModal={loading}
                setShowModal={setLoading}
                />

            <ConfirmModal
                showModal={modalConfirm}
                setShowModal={setModalConfirm}
                title={`Sicuro di voler aggiornare il testo sui termini e condizioni?`}
                onClose={(value) => {
                    if(value) {
                        updateConsent();
                    }
                }}
                />

                <ConfirmModal
                    showModal={modalConfirmPrivacy}
                    setShowModal={setModalConfirmPrivacy}
                    title={`Sicuro di voler aggiornare il testo sulla privacy?`}
                    onClose={(value) => {
                        if(value) {
                            updatePrivacy();
                        }
                    }}
                />

            <div className="consent-text-container">
                <div className="title-container">
                    Aggiorna il testo Termini e Condizioni
                </div>

                <div className="text-field-input-container">
                    <CKEditor
                        editor={ ClassicEditor }
                        data={consent}
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();
                            setConsent(data);
                        } }
                    />
                </div>

                <div className="action-button-container">
                    <Button variant="contained" color="primary" onClick={() => {
                        setModalConfirm(true);
                    }}>
                        Aggiorna testo Termini e Condizioni
                    </Button>
                </div>

                <div className="title-container">
                    Aggiorna il testo Privacy
                </div>

                <div className="text-field-input-container">
                    <CKEditor
                        editor={ ClassicEditor }
                        data={privacy}
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();
                            setPrivacy(data);
                        } }
                    />
                </div>

                <div className="action-button-container">
                    <Button variant="contained" color="primary" onClick={() => {
                        setModalConfirmPrivacy(true);
                    }}>
                        Aggiorna testo privacy
                    </Button>
                </div>
            </div>   
        </div>
    )
}


export default ChangeConsent;