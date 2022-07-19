package com.dametto.poloni.liedetectorv2;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class ActivityVideo extends AppCompatActivity {

    Game game;
    TextView nickname;
    Button buttonAnswer;
    CheckBox checkBox;

    private final static int REGISTRATION_REQ_CODE = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video);

        this.game = (Game)getIntent().getSerializableExtra("game");

        nickname = findViewById(R.id.playerNickname);
        buttonAnswer = findViewById(R.id.buttonAnswer);
        checkBox = findViewById(R.id.skipCheckbox);

        Button infoButton = findViewById(R.id.infoButton);
        infoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openInfo();
            }
        });

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // Update nickname
        nickname.setText(game.getOtherPlayerNickname(Utils.getId(this)));

        buttonAnswer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(checkBox.isChecked()) {
                    savePreference();
                }


                loadImage();
            }
        });

        if(Utils.getSkipDescribeImage(this)) {
            loadImage();
        }
    }

    private void savePreference() {
        Utils.setSkipDescribeImage(this, true);
    }

    private void loadImage() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_immagine))
                .build();

        progressDialog.show();

        String avoid = "";
        int avoidNumber = 0;
        for(int roundIndex = 0; roundIndex < game.getRounds().size() - 1; roundIndex++) {
            Round round = game.getRounds().get(roundIndex);
            if(avoidNumber > 0) {
                avoid += ",";
            }

            if(!round.getImageId().equals("null")) {
                avoid += round.getImageId();

                avoidNumber++;
            }
        }

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "image/random?avoid=" + avoid;

        ImageRequest getRequest = new ImageRequest(URL,
                new Response.Listener<Bitmap>()
                {
                    @Override
                    public void onResponse(Bitmap response) {
                        // response
                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        DataUtility.imgCaricata = response;
                        Intent answerIntent = new Intent(ActivityVideo.this, CameraActivity.class);
                        answerIntent.putExtra("game", game);
                        startActivityForResult(answerIntent, REGISTRATION_REQ_CODE);
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

                        InfoDialog infoDialog = new InfoDialog(ActivityVideo.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(ActivityVideo.this));

                return params;
            }

            @Override
            protected Response<Bitmap> parseNetworkResponse(NetworkResponse response)
            {
                Map<String, String> responseHeaders = response.headers;

                String imageId = responseHeaders.get("image-id");

                game.getLastRound().setImageId(imageId);

                return super.parseNetworkResponse(response);
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void openInfo() {
        InfoDialog infoDialog = new InfoDialog(this, getString(R.string.title_info_video), getString(R.string.content_info_video), getString(R.string.close_button));

        infoDialog.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode) {
            case REGISTRATION_REQ_CODE:
                if(data!= null && data.getExtras() != null && data.getExtras().get("game") != null) {
                    this.game = (Game)data.getExtras().get("game");

                    Intent dataToReturn = new Intent();
                    dataToReturn.putExtra("game", this.game);

                    setResult(RESULT_OK, dataToReturn);

                    finish();
                }
                break;
        }
    }
}