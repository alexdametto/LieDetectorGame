package com.dametto.poloni.liedetectorv2.utility.Data;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

public class Round implements Serializable {
    private String id, imageId, videoId;
    private Boolean truth, answer;

    public Round(JSONObject obj) throws JSONException {
        this.id = obj.getString("id");
        this.imageId = obj.isNull("imageId") ? null : obj.getString("imageId");
        this.videoId = obj.isNull("videoId") ? null : obj.getString("videoId");
        this.truth = obj.isNull("truth") ? null : obj.getBoolean("truth");
        this.answer = obj.isNull("answer") ? null : obj.getBoolean("answer");
    }

    public String getId() {
        return id;
    }

    public String getImageId() {
        return imageId;
    }

    public String getVideoId() {
        return videoId;
    }

    public Boolean getTruth() {
        return truth;
    }

    public Boolean isVideoSent() {
        return (truth != null && videoId != null) || skippedRound();
    }

    public Boolean skippedRound() {
        return (truth == null && videoId != null && videoId.equals("no-content"));
    }

    public Boolean isAnswerGiven() {
        return answer != null;
    }

    public Boolean getAnswer() {
        return answer;
    }

    public boolean correctPrediction() {
        if(videoId != null && videoId.equals("no-content")) {
            return true;
        }
        return this.truth != null && this.answer != null && this.truth == this.answer;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }
}
