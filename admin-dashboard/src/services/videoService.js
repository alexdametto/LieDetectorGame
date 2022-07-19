import AuthService from "./authService";

class VideoService {
    static async downloadVideo(url) {
        return fetch(url, {
            method: 'GET',
            headers: AuthService.getDefaultOptions(),
        }).then( response => response.blob() )
        .then( blob => new Promise( callback =>{
            let reader = new FileReader() ;
            reader.onload = function(){ callback(this.result) } ;
            reader.readAsDataURL(blob) ;
        })) ;
    }

    static getVideoUrl(videoId) {
        return process.env.REACT_APP_API_URL + "game/play/" + videoId;
    }
}

export default VideoService;