import AuthService from "./authService";

class UserService {
    static async banPlayer(id) {
        return fetch(process.env.REACT_APP_API_URL + "users/ban/" + id, {
            method: 'POST',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async unbanPlayer(id) {
        return fetch(process.env.REACT_APP_API_URL + "users/unban/" + id, {
            method: 'POST',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async getAllUsers() {
        return fetch(process.env.REACT_APP_API_URL + "users/allUsers", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async getUser(id) {
        return fetch(process.env.REACT_APP_API_URL + "users/" + id, {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }
}

export default UserService;