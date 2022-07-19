import AuthService from "./authService";

class PublicService {
    static async getConsent() {
        return fetch(process.env.REACT_APP_API_URL + "public/consent", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => {
            return response.text();
        })
    }

    static async getPrivacy() {
        return fetch(process.env.REACT_APP_API_URL + "public/privacy", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => {
            return response.text();
        })
    }
}

export default PublicService;