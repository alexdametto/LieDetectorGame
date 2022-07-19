import AuthService from "./authService";
import { sha512 } from "js-sha512";
import axios from "axios";

class AdminService {
    static async getStats() {
        return fetch(process.env.REACT_APP_API_URL + "admin/stats", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async getLeaderboard() {
        return fetch(process.env.REACT_APP_API_URL + "admin/leaderboard", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async changePassword(userId, newPassword) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/changePassword", {
            userId: userId,
            newPassword: sha512(newPassword)
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }

    static async changeUserInfo(userId, userInfo) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/changeUserInfo", {
            ...userInfo,
            userId: userId
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }

    static async transformAdmin(id, isAdmin) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/transformAdmin", {
            userId: id,
            admin: isAdmin
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }

    static async updateConsent(consent) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/setConsent", {
            consent: consent
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }

    static async updatePrivacy(privacy) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/setPrivacy", {
            privacy: privacy
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }

    static async deleteUser(id) {
        return axios.post(process.env.REACT_APP_API_URL + "admin/deleteUser", {
            userId: id,
        }, {
            headers: AuthService.getDefaultOptionsJSON()
        });
    }
}

export default AdminService;