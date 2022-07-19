package com.dametto.poloni.liedetectorv2.utility;

import android.graphics.Bitmap;

import com.dametto.poloni.liedetectorv2.utility.Data.Game;

import java.util.ArrayList;

public class DataUtility {
    public static ArrayList<Game> games = new ArrayList<>();
    public static ArrayList<String> gameVisti = new ArrayList<>();
    public static Bitmap imgCaricata;

    public static void reset() {
        games.clear();
        gameVisti.clear();
    }
}
