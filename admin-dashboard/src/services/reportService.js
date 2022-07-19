import AuthService from "./authService";

class ReportSerivce {
    static async getReports() {
        return fetch(process.env.REACT_APP_API_URL + "report/", {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async getReportInfo(reportId) {
        return fetch(process.env.REACT_APP_API_URL + "report/" + reportId, {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }

    static async closeReport(reportId) {
        return fetch(process.env.REACT_APP_API_URL + "report/close/" + reportId, {
            method: 'POST',
            headers: AuthService.getDefaultOptions(),
        }).then(response => response.json());
    }
}

export default ReportSerivce;