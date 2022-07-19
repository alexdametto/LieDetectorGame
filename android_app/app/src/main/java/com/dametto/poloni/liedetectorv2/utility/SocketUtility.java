package com.dametto.poloni.liedetectorv2.utility;

import android.util.Log;

import com.dametto.poloni.liedetectorv2.ActivityVideo;

import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class SocketUtility {
    private static Socket mSocket;
    static {
        newConnection();
    }

    public static Socket getSocket() {
        return mSocket;
    }

    public static void newConnection() {
        try {
            mSocket = IO.socket(Constants.API_URL);
            mSocket = mSocket.connect();

            mSocket.on("error", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d("ERRORE", "ERROREEEEE");
                }
            });

        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public static void auth(JSONObject jwt) {
        //newConnection();
        if(!mSocket.connected()) {
            mSocket.connect();
        }
        mSocket.emit("auth", jwt);
    }

    public static void ping() {
        if(!mSocket.connected()) {
            mSocket.connect();
        }
        mSocket.emit("ping");
    }
}
