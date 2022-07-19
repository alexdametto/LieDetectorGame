package com.dametto.poloni.liedetectorv2.utility.Data;

import android.content.Context;

import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;

public class GameRequest implements Comparable<GameRequest> {
    private String id;
    private Player sender;
    private Player receiver;
    private Date createdAt;
    private Date updatedAt;
    private Context ctx;

    public GameRequest(JSONObject obj, Context ctx) {
        this.ctx = ctx;
        try {
            this.id = obj.getString("id");
            this.sender = new Player(obj.getJSONObject("sender"));
            this.receiver = new Player(obj.getJSONObject("receiver"));

            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

            this.createdAt = inputFormat.parse(obj.getString("createdAt"));
            this.updatedAt = inputFormat.parse(obj.getString("createdAt"));
        }
        catch(Exception e) {

        }
    }

    public Player getSender() {
        return this.sender;
    }

    public Player getReceiver() {
        return this.receiver;
    }

    public boolean byMe (String myId) {
        return this.sender.getId().equals(myId);
    }

    public String getId() {
        return this.id;
    }

    @Override
    public int compareTo(GameRequest gameRequest) {
        String myId = Utils.getId(ctx);

        if(this.byMe(myId) && gameRequest.byMe(myId)) {
            // entrambe fatte da me
            // più piccolo è quello con updateAt più grande
            if(updatedAt.after(gameRequest.updatedAt)) {
                return -1;
            }
            else return 1;
        }
        else if(this.byMe(myId)) {
            return 1;
        }
        else if(gameRequest.byMe(myId)) {
            return -1;
        }
        // entrambe ricevute
        // più piccolo è quello con updateAt più grande
        if(updatedAt.after(gameRequest.updatedAt)) {
            return -1;
        }
        else return 1;
    }
}
