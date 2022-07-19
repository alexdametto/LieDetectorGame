import React, { useState, useEffect } from 'react';
import VideoService from '../../services/videoService';

function VideoPlayer({videoUrl}) {
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        VideoService.downloadVideo(videoUrl).then((video) => {
            setVideo(video);
        })
    }, [videoUrl])

    if(error) {
        return (<div>
            Qualcosa è andato storto nel recuperare il
        </div>)
    }

    return video !== null ?  (
        <div>
            <video controls onError={(e) => {
                setError(true);
            }}>
                <source  src={video} type='video/mp4;'/>
                The "video" tag is not supported by your browser.
            </video>
        </div>
      ) : (null)
}

export default VideoPlayer;