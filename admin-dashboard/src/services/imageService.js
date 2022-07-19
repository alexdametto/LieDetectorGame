import axios from "axios";
import AuthService from "./authService";

class ImageService {
    static async deleteAll() {
        return fetch(process.env.REACT_APP_API_URL + "image/all", {
            method: 'DELETE',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async uploadImage(imageFile) {
        var formData = new FormData();

        formData.append("upload", imageFile);

        return fetch(process.env.REACT_APP_API_URL + "image/uploadImage", {
            method: 'POST',
            headers: AuthService.getFileUploadDefaultOptions(),
            body: formData
        }).then(response => response.json());
    }

    static async uploadImageMultiple(images, imageComplexity, onUpload = null) {
        var formData = new FormData();

        images.forEach(image => {
            formData.append("upload", image);
        });

        return axios.post(process.env.REACT_APP_API_URL + "image/multiUploadImage/" + imageComplexity, formData, {
            headers: AuthService.getFileUploadDefaultOptions(),
            onUploadProgress: (p) => {
                if(onUpload) {
                    onUpload(p.loaded / p.total * 100);
                }
            }
        });
    }

    static async getImages() {
        return fetch(process.env.REACT_APP_API_URL + "image/images", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async deleteImage(imageId) {
        return fetch(process.env.REACT_APP_API_URL + "image/" + imageId, {
            method: 'DELETE',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static getImageUrl(imageId) {
        return process.env.REACT_APP_API_URL + "public/" + imageId;
    }
}

export default ImageService;