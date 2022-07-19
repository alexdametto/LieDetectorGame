package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.NetworkResponse;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.ImageDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.VideoDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.VideoDialogWithoutButtons;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import okhttp3.internal.Util;

public class RecapRoundActivity extends AppCompatActivity {

    Game game;
    Integer index1, index2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recap_round);

        this.game = (Game)getIntent().getSerializableExtra("game");
        this.index1 = (Integer)getIntent().getSerializableExtra("round1");
        this.index2 = (Integer)getIntent().getSerializableExtra("round2");

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        TextView title = findViewById(R.id.titleActivity);
        title.setText(getString(R.string.subround_title).replace("[[COUNT]]", String.valueOf((index1/2 + 1))));

        TextView playerNickname = findViewById(R.id.playerNickname);
        playerNickname.setText(game.getOtherPlayerNickname(Utils.getId(this)));

        // All findViewById's
        LinearLayout subRound1 = findViewById(R.id.subRound1);
        LinearLayout subRound2 = findViewById(R.id.subRound2);
        LinearLayout subRoundNoSend1 = findViewById(R.id.subRound1Alternative);
        LinearLayout subRoundNoSend2 = findViewById(R.id.subRound2Alternative);

        TextView nickImg1 = findViewById(R.id.nick_img_1);
        TextView nickImg2 = findViewById(R.id.nick_img_2);

        Button immagine1 = findViewById(R.id.immagine1);
        Button immagine2 = findViewById(R.id.immagine2);

        TextView nickVideo1 = findViewById(R.id.nick_video_1);
        TextView nickVideo2 = findViewById(R.id.nick_video_2);

        Button video1 = findViewById(R.id.video1);
        Button video2 = findViewById(R.id.video2);

        TextView nickAnswer1 = findViewById(R.id.nick_answer_1);
        TextView nickAnswer2 = findViewById(R.id.nick_answer_2);

        TextView answer1 = findViewById(R.id.answer_1);
        TextView answer2 = findViewById(R.id.answer_2);

        TextView nickOpinion1 = findViewById(R.id.nick_opinion_1);
        TextView nickOpinion2 = findViewById(R.id.nick_opinion_2);

        TextView opinion1 = findViewById(R.id.opinion_1);
        TextView opinion2 = findViewById(R.id.opinion_2);

        TextView nickPoint1 = findViewById(R.id.nick_point_1);
        TextView nickPoint2 = findViewById(R.id.nick_point_2);

        TextView nickNoSend1 = findViewById(R.id.nick_no_send_1);
        TextView nickNoSend2 = findViewById(R.id.nick_no_send_2);

        TextView nickNoSendPoint1 = findViewById(R.id.nick_no_send_point_1);
        TextView nickNoSendPoint2 = findViewById(R.id.nick_no_send_point_2);

        // Round 1
        final Round r1 = game.getRound(index1);

        // Round 2
        final Round r2 = game.getRound(index2);

        // video buttons
        video1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String playerId = game.isMyVideo(Utils.getId(RecapRoundActivity.this), index1) ? Utils.getId(RecapRoundActivity.this) : game.getOtherPlayer(Utils.getId(RecapRoundActivity.this)).getId();
                VideoDialogWithoutButtons videoDialog = new VideoDialogWithoutButtons(RecapRoundActivity.this, game.getId(), playerId, r1.getVideoId());
                videoDialog.show();
            }
        });

        video2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String playerId = game.isMyVideo(Utils.getId(RecapRoundActivity.this), index1) ? Utils.getId(RecapRoundActivity.this) : game.getOtherPlayer(Utils.getId(RecapRoundActivity.this)).getId();
                VideoDialogWithoutButtons videoDialog = new VideoDialogWithoutButtons(RecapRoundActivity.this, game.getId(), playerId, r2.getVideoId());
                videoDialog.show();
            }
        });

        // image buttons
        immagine1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                loadImage(r1.getImageId());
            }
        });

        immagine2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                loadImage(r2.getImageId());
            }
        });

        // set nicknames
        String myNickname = Utils.getNickname(this);
        String otherNickname = game.getOtherPlayerNickname(Utils.getId(this));
        if(game.isMyVideo(Utils.getId(this), index1)) {
            // Round 1 mio
            // Round 2 suo
            nickImg1.setText(myNickname);
            nickImg2.setText(otherNickname);
            nickVideo1.setText(myNickname);
            nickVideo2.setText(otherNickname);
            nickAnswer1.setText(myNickname);
            nickAnswer2.setText(otherNickname);
            nickOpinion1.setText(otherNickname);
            nickOpinion2.setText(myNickname);
            nickNoSend1.setText(myNickname);
            nickNoSend2.setText(otherNickname);
            nickNoSendPoint1.setText(otherNickname);
            nickNoSendPoint2.setText(myNickname);

            if(r1.correctPrediction()) {
                // l'altro giocatore ha indovinato
                nickPoint1.setText(otherNickname);
            }
            else {
                // l'altro giocatore NON ha indovinato
                nickPoint1.setText(myNickname);
            }

            if(r2.correctPrediction()) {
                // io ho indovinato
                nickPoint2.setText(myNickname);
            }
            else {
                // io NON indovinato
                nickPoint2.setText(otherNickname);
            }
        }
        else {
            // Round 1 suo
            // Round 2 mio
            nickImg1.setText(otherNickname);
            nickImg2.setText(myNickname);
            nickVideo1.setText(otherNickname);
            nickVideo2.setText(myNickname);
            nickAnswer1.setText(otherNickname);
            nickAnswer2.setText(myNickname);
            nickOpinion1.setText(myNickname);
            nickOpinion2.setText(otherNickname);
            nickNoSend1.setText(otherNickname);
            nickNoSend2.setText(myNickname);
            nickNoSendPoint1.setText(myNickname);
            nickNoSendPoint2.setText(otherNickname);

            if(r1.correctPrediction()) {
                // io ho indovinato
                nickPoint1.setText(myNickname);
            }
            else {
                // io NON ho indovinato
                nickPoint1.setText(otherNickname);
            }

            if(r2.correctPrediction()) {
                // l'altro giocatore ha indovinato
                nickPoint2.setText(otherNickname);
            }
            else {
                // l'altro giocatore NON ha indovinato
                nickPoint2.setText(myNickname);
            }
        }

        // check per casi in cui il video non è stato mandato
        if(r1.skippedRound()) {
            subRound1.setVisibility(View.GONE);
            subRoundNoSend1.setVisibility(View.VISIBLE);
        }

        if(r2.skippedRound()) {
            subRound2.setVisibility(View.GONE);
            subRoundNoSend2.setVisibility(View.VISIBLE);
        }

        // setto info generiche del round (non player-specific)
        if(!r1.skippedRound() && r1.getTruth()) {
            answer1.setText(R.string.indicato_verita);
        }
        else if(!r1.skippedRound()) {
            answer1.setText(R.string.indicato_verita);
        }

        if(!r2.skippedRound() && r2.getTruth()) {
            answer2.setText(R.string.indicato_verita);
        }
        else if(!r2.skippedRound()) {
            answer2.setText(R.string.indicato_verita);
        }

        if(r1.correctPrediction()) {
            opinion1.setText(R.string.indovinato);
        }
        else {
            opinion1.setText(R.string.non_indovinato);
        }

        if(r2.correctPrediction()) {
            opinion2.setText(R.string.indovinato);
        }
        else {
            opinion2.setText(R.string.non_indovinato);
        }
    }

    private void loadImage(String imageId) {
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

                        ImageDialog imageDialog = new ImageDialog(RecapRoundActivity.this, response);
                        imageDialog.show();
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

                        InfoDialog infoDialog = new InfoDialog(RecapRoundActivity.this, getString(R.string.img_non_disponibile), getString(R.string.img_non_disponibile_description), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(RecapRoundActivity.this));

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
}