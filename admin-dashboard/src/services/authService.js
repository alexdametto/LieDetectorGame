import { sha512 } from "js-sha512";
import JwtService from "./jwtService";

class AuthService {
    static async login(email, password) {
        return fetch(process.env.REACT_APP_API_URL + "auth/admin_login", {
            method: 'GET',
            headers: {
              authorization: "Basic " + btoa(email + ":" + sha512(password)),
              "Content-type": "application/x-www-form-urlencoded",
              "cache-control": "no-cache"
            },
        });
    }

    static async renew() {
        return fetch(process.env.REACT_APP_API_URL + "auth/renew", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static getDefaultOptions() {
        return {
            authorization: "Bearer " + JwtService.getToken(),
            "Content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        }
    }

    static getDefaultOptionsJSON() {
        return {
            authorization: "Bearer " + JwtService.getToken(),
            "Content-type": "application/json",
            "cache-control": "no-cache"
        }
    }

    static getFileUploadDefaultOptions() {
        return {
            authorization: "Bearer " + JwtService.getToken(),
            "cache-control": "no-cache",
        }
    }
}

export default AuthService;