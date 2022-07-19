"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadUtils = void 0;
var UploadUtils = /** @class */ (function () {
    function UploadUtils() {
    }
    UploadUtils.setGfs = function (gfs) {
        this.gfs = gfs;
    };
    UploadUtils.getGfs = function () {
        return this.gfs;
    };
    UploadUtils.setStorage = function (storage) {
        this.storage = storage;
    };
    UploadUtils.getStorage = function () {
        return this.storage;
    };
    UploadUtils.setUpload = function (upload) {
        this.upload = upload;
    };
    UploadUtils.getUpload = function () {
        return this.upload;
    };
    return UploadUtils;
}());
exports.UploadUtils = UploadUtils;
