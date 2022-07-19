"use strict";
var mail;
var MailService = /** @class */ (function () {
    function MailService() {
    }
    MailService.setMailService = function (mail_) {
        mail = mail_;
    };
    MailService.getMailService = function () {
        return mail;
    };
    return MailService;
}());
module.exports = MailService;
