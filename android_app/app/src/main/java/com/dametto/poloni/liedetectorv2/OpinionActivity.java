package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.MediaController;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.util.Util;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class OpinionActivity extends AppCompatActivity {

    Game game;

    SimpleExoPlayer exoPlayer;
    DefaultHttpDataSourceFactory defaultDataSourceFactory;
    ExtractorMediaSource extractorMediaSource;
    PlayerView v1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_opinion);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent returnIntent = new Intent();
                setResult(Activity.RESULT_CANCELED, returnIntent);

                finish();
            }
        });

        this.game = (Game)getIntent().getSerializableExtra("game");

        v1= findViewById(R.id.videoView1);
        MediaController mc = new MediaController(this);
        Button tButton = findViewById(R.id.truthButton);
        Button lButton = findViewById(R.id.lieButton);

        tButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendOpinion(true);
            }
        });

        lButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendOpinion(false);
            }
        });

        Uri video = Uri.parse(Constants.API_URL + "game/play/" + game.getLastRound().getVideoId());
        mc.setAnchorView(v1);
        //v1.setMediaController(mc);
        Log.d("[JWT]", "Bearer " + JWTUtils.getJWTSigned(OpinionActivity.this))
        ;
        try {
            //Method setVideoURIMethod = v1.getClass().getMethod("setVideoURI", Uri.class, Map.class);
            Map<String, String> params = new HashMap<String, String>(1);
            params.put("Authorization", "Bearer " + JWTUtils.getJWTSigned(OpinionActivity.this));
            params.put("Content-Type", "video/mp4"); // change content type if necessary
            params.put("Cache-control", "no-cache");
            //setVideoURIMethod.invoke(v1, video, params);

            exoPlayer = ExoPlayerFactory.newSimpleInstance(this, new DefaultTrackSelector());
            defaultDataSourceFactory = new DefaultHttpDataSourceFactory(Util.getUserAgent(this,"LieDetector"));
            defaultDataSourceFactory.getDefaultRequestProperties().set(params);
            exoPlayer.setPlayWhenReady(true);
            extractorMediaSource=new ExtractorMediaSource.Factory(defaultDataSourceFactory).createMediaSource(video);
            exoPlayer.prepare(extractorMediaSource);



            v1.setPlayer(exoPlayer);

            //v1.setVideoURI(video);
        } catch (Exception e) {
            Log.d("[ERROR]", "Errore!!");
            e.printStackTrace();
        }
    }

    @Override
    protected void onStop() {
        v1.setPlayer(null);
        exoPlayer.release();
        exoPlayer=null;
        super.onStop();
    }

    private void sendOpinion(boolean answer) {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_invio_opinion))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("answer", answer);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        }


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game/answer/" + game.getId() + "/" + game.getLastRound().getId();
        final String requestBody = to_send.toString();

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                // Convertire response in JSON e farne quello che vogliamo!!!

                // Tolgo progress bar
                if (progressDialog.isShowing()) {
                    progressDialog.dismiss();
                }

                try {
                    // Converto json risposta
                    JSONObject result = new JSONObject(response);

                    Game newGame = new Game(result.getJSONObject("game"), OpinionActivity.this);

                    Intent data = new Intent();
                    data.putExtra("game", newGame);

                    setResult(RESULT_OK,data);

                    finish();

                } catch (Exception e) {
                    e.printStackTrace();
                    // TODO: errore
                }

                // TODO: response!!!!
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                //Log.e("VOLLEY", error.toString());

                if (progressDialog.isShowing()) {
                    progressDialog.dismiss();
                }

                try {
                    // Converto json risposta
                    int statusCode = error.networkResponse.statusCode;

                    InfoDialog infoDialog = new InfoDialog(OpinionActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(OpinionActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();
                }
            }
        }) {
            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return requestBody == null ? null : requestBody.getBytes("utf-8");
                } catch (UnsupportedEncodingException uee) {
                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                    return null;
                }
            }

            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json; charset=utf-8");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(OpinionActivity.this));

                return params;
            }
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }
}