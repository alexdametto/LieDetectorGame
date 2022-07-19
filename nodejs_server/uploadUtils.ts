export class UploadUtils {

    static gfs : any;
    static storage : any;
    static upload : any;
    
    static setGfs(gfs: any) {
		this.gfs = gfs;
	}

	static getGfs() {
		return this.gfs;
	}

	static setStorage(storage: any) {
		this.storage = storage;
	}

	static getStorage() {
		return this.storage;
	}

	static setUpload(upload: any) {
		this.upload = upload;
	}

	static getUpload() {
		return this.upload;
	}
}