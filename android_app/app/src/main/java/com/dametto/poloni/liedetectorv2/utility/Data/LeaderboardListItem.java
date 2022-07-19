package com.dametto.poloni.liedetectorv2.utility.Data;

public class LeaderboardListItem {
    private String name;
    private String playerId;
    private Double value;
    private boolean percentage;

    public LeaderboardListItem(String playerId, String name, Double value, boolean percentage) {
        this.playerId = playerId;
        this.name = name;
        this.value = value;
        this.percentage = percentage;
    }

    public String getName() {
        return name;
    }

    public Double getValue() {
        return value;
    }

    public String getPlayerId() {
        return playerId;
    }

    public boolean isPercentage() {
        return percentage;
    }
}
