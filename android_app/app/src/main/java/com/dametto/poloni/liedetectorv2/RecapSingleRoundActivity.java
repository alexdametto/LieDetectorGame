package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.MediaController;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.VideoView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.ImageDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialogYesNo;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.ReportVideoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
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
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class RecapSingleRoundActivity extends AppCompatActivity {
    Game game;
    Round round;
    Integer roundIndex;
    PlayerView videoView;
    ImageView imageView;
    Button btnYes, btnNo;

    SimpleExoPlayer exoPlayer;
    DefaultHttpDataSourceFactory defaultDataSourceFactory;
    ExtractorMediaSource extractorMediaSource;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recap_single_round);

        this.game = (Game)getIntent().getSerializableExtra("game");
        this.roundIndex = (Integer)getIntent().getSerializableExtra("roundIndex");
        this.round = game.getRound(roundIndex);
        this.videoView = findViewById(R.id.videoView);
        this.imageView = findViewById(R.id.imageView);
        this.btnYes = findViewById(R.id.yesButton);
        this.btnNo = findViewById(R.id.noButton);

        TextView title = findViewById(R.id.titleActivity);
        TextView infoVideo = findViewById(R.id.infoVideo);
        String infoVideoText = getString(R.string.info_video);

        if(round.getTruth() == round.getAnswer()) {
            title.setText(getString(R.string.hai_indovinato));
            //title.setTextColor(getColor(R.color.green));
            //title.setShadowLayer(8, 0, 0, getColor(R.color.green));
        }
        else {
            title.setText(getString(R.string.hai_sbagliato));
            //title.setTextColor(getColor(R.color.red));
            //title.setShadowLayer(8, 0, 0, getColor(R.color.red));
        }

        if(round.getTruth()) {
            infoVideoText = getString(R.string.info_video_verita);
        }
        else {
            infoVideoText = getString(R.string.info_video_bugia);
        }

        infoVideoText = infoVideoText.replace("{NICKNAME}", game.getOtherPlayerNickname(Utils.getId(this)));
        infoVideo.setText(Html.fromHtml(infoVideoText));

        exoPlayer = ExoPlayerFactory.newSimpleInstance(RecapSingleRoundActivity.this, new DefaultTrackSelector());

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // report button
        Button reportButton = findViewById(R.id.reportButton);
        reportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showReportInfoDialog();
            }
        });

        // Drag and Drop image
        final RelativeLayout parentView = findViewById(R.id.parentView);
        final float[] _xDelta = new float[1];
        final float[] _yDelta = new float[1];
        imageView.setOnTouchListener(new View.OnTouchListener() {
            public boolean onTouch(View view, MotionEvent event) {
                switch (event.getAction() & MotionEvent.ACTION_MASK) {
                    case MotionEvent.ACTION_DOWN:
                        _xDelta[0] = view.getX() - event.getRawX();
                        _yDelta[0] = view.getY() - event.getRawY();
                        break;
                    case MotionEvent.ACTION_UP:
                        break;
                    case MotionEvent.ACTION_POINTER_DOWN:
                        break;
                    case MotionEvent.ACTION_POINTER_UP:
                        break;
                    case MotionEvent.ACTION_MOVE:
                        view.setY(Math.min(Math.max(event.getRawY() + _yDelta[0], 0), parentView.getHeight() - imageView.getHeight()));
                        view.setX(Math.min(Math.max(event.getRawX() + _xDelta[0], 0), parentView.getWidth() - imageView.getWidth()));
                        break;
                }
                imageView.invalidate();
                return true;
            }
        });

        loadImage();

        btnNo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Invia report di cheating
                showReportInfoDialogDeceiving();
            }
        });

        btnYes.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                finish();
            }
        });
    }

    private void showReportInfoDialogDeceiving() {
        // report(getString(R.string.video_cheating));
        final InfoDialogYesNo infoDialogYesNo = new InfoDialogYesNo(this, "ATTENZIONE", "Sei sicuro di voler segnalare questo video? Facendo così il gioco verrà bloccato e verrà revisionato dagli amministratori.");
        infoDialogYesNo.setYesButtonColor(getColor(R.color.red));
        infoDialogYesNo.setYesButtonText("SEGNALA");
        infoDialogYesNo.setNoButtonColor(getColor(R.color.colorPrimary));
        infoDialogYesNo.setNoButtonText("ANNULLA");

        infoDialogYesNo.setYesOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                report(getString(R.string.video_cheating));
                infoDialogYesNo.dismiss();
            }
        });
        infoDialogYesNo.setNoOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                infoDialogYesNo.dismiss();
            }
        });

        infoDialogYesNo.show();
    }

    private void showReportInfoDialog() {
        final ReportVideoDialog reportDialog = new ReportVideoDialog(this, "ATTENZIONE", "Sei sicuro di voler segnalare questo video? Facendo così il gioco verrà bloccato e verrà revisionato dagli amministratori.");
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
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(this.getString(R.string.wait))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("reason", reason);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        }

        String gameId = game.getId();
        String playerId = game.getOtherPlayer(Utils.getId(this)).getId();
        String videoId = round.getVideoId();

        RequestQueue requestQueue = Volley.newRequestQueue(this);
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

                    finish();
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

                    InfoDialog infoDialog = new InfoDialog(RecapSingleRoundActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(RecapSingleRoundActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(RecapSingleRoundActivity.this));

                return params;
            }
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }

    private void loadImage() {
        String imageId = round.getImageId();
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_immagine))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "public/" + imageId;

        ImageRequest getRequest = new ImageRequest(URL,
                new Response.Listener<Bitmap>()
                {
                    @Override
                    public void onResponse(Bitmap response) {
                        // response
                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        imageView.setImageBitmap(response);
                        showVideo();
                    }
                }, 1024, 1024, null,
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("ERROR","error => "+error.toString());

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        InfoDialog infoDialog = new InfoDialog(RecapSingleRoundActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(RecapSingleRoundActivity.this));

                return params;
            }

            @Override
            protected Response<Bitmap> parseNetworkResponse(NetworkResponse response)
            {
                return super.parseNetworkResponse(response);
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void showVideo() {
        String videoId = round.getVideoId();

        MediaController mc = new MediaController(RecapSingleRoundActivity.this);

        Uri video = Uri.parse(Constants.API_URL + "game/play/" + videoId);
        mc.setAnchorView(videoView);
        //v1.setMediaController(mc);
        Log.d("[JWT]", "Bearer " + JWTUtils.getJWTSigned(RecapSingleRoundActivity.this));
        try {
            Map<String, String> params = new HashMap<String, String>(1);
            params.put("Authorization", "Bearer " + JWTUtils.getJWTSigned(RecapSingleRoundActivity.this));
            params.put("Content-Type", "video/mp4"); // change content type if necessary
            params.put("Cache-control", "no-cache");

            exoPlayer = ExoPlayerFactory.newSimpleInstance(RecapSingleRoundActivity.this, new DefaultTrackSelector());
            defaultDataSourceFactory = new DefaultHttpDataSourceFactory(Util.getUserAgent(RecapSingleRoundActivity.this,"LieDetector"));
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