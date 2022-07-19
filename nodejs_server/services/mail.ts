let mail: any;

class MailService {
    static setMailService(mail_: any) {
        mail = mail_;
    }

    static getMailService() {
        return mail;
    }

}

module.exports = MailService;