import jwtDecode from 'jwt-decode';

class JwtService {
    static setToken(token) {
        sessionStorage.setItem("lie_detection_token", token);
    }

    static getToken() {
        const token = sessionStorage.getItem("lie_detection_token");
        return token ? token : "";
    }

    static getDecodedToken() {
        const tk = sessionStorage.getItem('lie_detection_token');
        return tk ? jwtDecode(tk) : null;
    }

    static isLogged() {
        return this.getDecodedToken() !== null;
    }

    static logout() {
        sessionStorage.clear();
    }

}

export default JwtService;