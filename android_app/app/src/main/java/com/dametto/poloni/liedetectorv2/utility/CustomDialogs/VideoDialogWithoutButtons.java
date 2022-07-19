package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.MediaController;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.GameActivity;
import com.dametto.poloni.liedetectorv2.OpinionActivity;
import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.ReportActivity;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DataSpec;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.upstream.FileDataSource;
import com.google.android.exoplayer2.util.Util;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class VideoDialogWithoutButtons extends Dialog {
    private Activity activity;
    private PlayerView videoView;
    private String videoId, gameId, playerId;
    private SimpleExoPlayer exoPlayer;
    DefaultHttpDataSourceFactory defaultDataSourceFactory;
    ExtractorMediaSource extractorMediaSource;

    public VideoDialogWithoutButtons(Activity activity, String gameId, String playerId, String videoId) {
        super(activity);
        this.activity = activity;
        this.videoId = videoId;
        this.gameId = gameId;
        this.playerId = playerId;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.video_dialog_without_buttons);

        setCanceledOnTouchOutside(false);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);

        videoView = findViewById(R.id.videoViewDialog);
        exoPlayer = ExoPlayerFactory.newSimpleInstance(activity, new DefaultTrackSelector());

        ImageButton closeButton = findViewById(R.id.chiudiButton);
        closeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });

        Button reportButton = findViewById(R.id.reportButton);
        reportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showReportInfoDialog();
            }
        });

        showVideo();

        if(this.playerId.equals(Utils.getId(activity))) {
            reportButton.setVisibility(View.INVISIBLE);
        }
    }

    @Override
    public void onBackPressed() {
        // nothing
    }

    private void showReportInfoDialog() {
        final ReportVideoDialog reportDialog = new ReportVideoDialog(this.activity, "ATTENZIONE", "Sei sicuro di voler segnalare questo video?");
        reportDialog.setConfirmOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                reportDialog.dismiss();
                report(reportDialog.getReason());
            }
        });

        reportDialog.setCancelOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                reportDialog.dismiss();
            }
        });

        reportDialog.show();
    }

    private void report(String reason) {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(activity)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(activity.getString(R.string.wait))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("reason", reason);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        }


        RequestQueue requestQueue = Volley.newRequestQueue(activity);
        String URL = Constants.API_URL + "report/video/" + gameId + "/" + playerId + "/" + videoId;
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

                    dismiss();
                } catch (JSONException e) {
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

                    InfoDialog infoDialog = new InfoDialog(activity, activity.getString(R.string.title_error) + " (" + statusCode + ")", activity.getString(R.string.content_error), activity.getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(activity, activity.getString(R.string.title_error), activity.getString(R.string.content_error), activity.getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(activity));

                return params;
            }
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }

    private void showVideo() {
        MediaController mc = new MediaController(this.activity);

        Uri video = Uri.parse(Constants.API_URL + "game/play/" + videoId);
        mc.setAnchorView(videoView);
        //v1.setMediaController(mc);
        Log.d("[JWT]", "Bearer " + JWTUtils.getJWTSigned(this.activity));
        try {
            Map<String, String> params = new HashMap<String, String>(1);
            params.put("Authorization", "Bearer " + JWTUtils.getJWTSigned(this.activity));
            params.put("Content-Type", "video/mp4"); // change content type if necessary
            params.put("Cache-control", "no-cache");

            exoPlayer = ExoPlayerFactory.newSimpleInstance(this.activity, new DefaultTrackSelector());
            defaultDataSourceFactory = new DefaultHttpDataSourceFactory(Util.getUserAgent(this.activity,"LieDetector"));
            defaultDataSourceFactory.getDefaultRequestProperties().set(params);
            exoPlayer.setPlayWhenReady(true);
            extractorMediaSource=new ExtractorMediaSource.Factory(defaultDataSourceFactory).createMediaSource(video);
            exoPlayer.prepare(extractorMediaSource);

            videoView.setPlayer(exoPlayer);
        } catch (Exception e) {
            Log.d("[ERROR]", "Errore!!");
            e.printStackTrace();
        }
    }

    @Override
    protected void onStop() {
        videoView.setPlayer(null);
        exoPlayer.release();
        exoPlayer=null;
        super.onStop();
    }
}
