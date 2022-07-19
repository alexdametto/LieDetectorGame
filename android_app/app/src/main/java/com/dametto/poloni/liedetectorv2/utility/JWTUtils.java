package com.dametto.poloni.liedetectorv2.utility;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class JWTUtils {
    public static String getJWTSigned(Context context) {
        // Stabilisci connessione socket

        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        String jwt = sharedPref.getString("jwt", "");
        try {
            JSONObject jsonJWT = new JSONObject(getDecodedJwt(jwt));
            SocketUtility.auth(jsonJWT);
        } catch (JSONException e) {
            e.printStackTrace();
        }


        return jwt;
    }

    public static JSONObject getJWT(Context context) {
        String jwt = getDecodedJwt(getJWTSigned(context));

        try {
            return new JSONObject((jwt));
        } catch (JSONException e) {
            e.printStackTrace();

            return new JSONObject();
        }
    }

    public static void setJWT(Context context, String jwt) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("jwt", jwt);

        editor.apply();
    }

    public static boolean isJWTValid(Context ctx) {
        JSONObject jwt = getJWT(ctx);

        if(!jwt.has("exp"))
            return false;

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss");
        simpleDateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        SimpleDateFormat localDateFormat = new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss");
        try {
            Date current = localDateFormat.parse( simpleDateFormat.format(new Date()) );

            long seconds = current.getTime() / 1000;

            if(seconds < jwt.getLong("exp")) {
                return true;
            }

        } catch (ParseException | JSONException e) {
            e.printStackTrace();
        }

        return false;
    }


    private static String getDecodedJwt(String jwt)
    {
        String result = "";

        String[] parts = jwt.split("\\.");
        try
        {
            // get payload
            byte[] partAsBytes = parts[1].getBytes("UTF-8");
            String decodedPart = new String(java.util.Base64.getUrlDecoder().decode(partAsBytes), "UTF-8");

            return decodedPart;
        }
        catch(Exception e)
        {
            throw new RuntimeException("Couldnt decode jwt", e);
        }
    }
}
