package com.dametto.poloni.liedetectorv2.utility.Data;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

public class Player implements Serializable, Comparable<Player> {
    private String id, nickname;
    private Boolean online = false;

    public Player(String id, String nickname) {
        this.id = id;
        this.nickname = nickname;
        this.online = false;
    }

    public Player(JSONObject player) throws JSONException {
        this.id = player.getString("id");
        this.nickname = player.getString("nickname");
        this.online = player.getBoolean("online");
    }

    public String getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public Boolean getOnline() {
        return online;
    }

    @Override
    public int compareTo(Player player) {
        if(this.getOnline() && !player.getOnline()) {
            return -1;
        }
        else if(player.getOnline() && !this.getOnline()) {
            return 1;
        }
        else {
            return getNickname().compareTo(player.getNickname());
        }
    }
}
