package com.dametto.poloni.liedetectorv2.utility;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListAdapter;
import android.widget.ListView;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import io.socket.client.Socket;

public class Utils {
    public static void justifyListViewHeightBasedOnChildren(ListView listView) {
        ListAdapter adapter = listView.getAdapter();

        if (adapter == null) {
            return;
        }
        ViewGroup vg = listView;
        int totalHeight = 0;
        for (int i = 0; i < adapter.getCount(); i++) {
            View listItem = adapter.getView(i, null, vg);
            listItem.measure(0, 0);
            totalHeight += listItem.getMeasuredHeight();
        }

        ViewGroup.LayoutParams par = listView.getLayoutParams();
        par.height = totalHeight + (listView.getDividerHeight() * (adapter.getCount() - 1));
        listView.setLayoutParams(par);
        listView.requestLayout();
    }


    public static boolean isValidEmail(CharSequence target) {
        return (!TextUtils.isEmpty(target) && Patterns.EMAIL_ADDRESS.matcher(target).matches());
    }

    public static boolean isValidPassword(String password) {
        return password.length() > 0 && password.length() <= 10;
        //String pattern = Constants.passwordPattern;
        //return password.matches(pattern);
    }

    public static boolean isCorrectPassword(String password1, String password2) {
        return password1.equals(password2);
    }

    public static boolean isValidNickname(String nickname) {
        String pattern = Constants.nicknamePattern;

        boolean match = nickname.matches(pattern);

        return match;
    }

    public static void setLogged(Context context, boolean logged) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("logged", logged);

        editor.apply();
    }

    public static void logout(Context ctx) {
        DataUtility.reset();
        setLogged(ctx, false);

        Socket socket = SocketUtility.getSocket();
        socket.emit("logout");
    }

    public static String getNickname(Context context) {
        JSONObject jwt = JWTUtils.getJWT(context);

        if(jwt.has("nickname")) {
            try {
                String nickname = jwt.getString("nickname");
                return !nickname.equals("") ? nickname : null;
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return null;
    }

    public static String getId(Context context) {
        JSONObject jwt = JWTUtils.getJWT(context);

        if(jwt.has("id")) {
            try {
                String id = jwt.getString("id");
                return id;
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return null;
    }

    public static boolean isLogged(Context context) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        return sharedPref.getBoolean("logged", false);
    }

    public static String getSHA512(String passwordToHash) throws NoSuchAlgorithmException, UnsupportedEncodingException {
        MessageDigest digest = MessageDigest.getInstance("SHA-512");
        digest.reset();
        digest.update(passwordToHash.getBytes("utf8"));
        return String.format("%0128x", new BigInteger(1, digest.digest()));
    }

    public static String btoa(String original) {
        Log.d("[BASE64]", Base64.encodeToString(original.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP));
        return Base64.encodeToString(original.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP);
    }

    public static double roundNumber2Decimals(double number) {
        return Math.round(number * 100.0) / 100.0;
    }



    public static void setSkipDescribeImage(Context context, boolean skip) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("skipDescribeImage", skip);

        editor.apply();
    }

    public static boolean getSkipDescribeImage(Context context) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        return sharedPref.getBoolean("skipDescribeImage", false);
    }

    public static void setSkipVideo(Context context, boolean skip) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("skipVideo", skip);

        editor.apply();
    }

    public static boolean getSkipVideo(Context context) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        return sharedPref.getBoolean("skipVideo", false);
    }

    public static void setPolicy(Context context, boolean accept) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("policy", accept);

        editor.apply();
    }

    public static boolean getPolicy(Context context) {
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.sharedPreferencesKey, Context.MODE_PRIVATE);

        return sharedPref.getBoolean("policy", false);
    }
}
