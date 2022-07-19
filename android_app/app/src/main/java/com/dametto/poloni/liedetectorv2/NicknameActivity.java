package com.dametto.poloni.liedetectorv2;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

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
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class NicknameActivity extends AppCompatActivity {

    TextInputLayout nicknameLayout;
    TextInputEditText nicknameEditText;
    Button confirm;
    boolean fromSettings = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nickname);

        Intent fromIntent = getIntent();
        if(fromIntent.getExtras() != null)
            fromSettings = fromIntent.getExtras().getBoolean("fromSettings", false);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        if(fromSettings) {
            btnIndietro.setVisibility(View.VISIBLE);
        }

        nicknameLayout = findViewById(R.id.nicknameLayout);
        nicknameEditText = findViewById(R.id.nicknameEditText);

        nicknameEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                nicknameLayout.setError("");
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        confirm = findViewById(R.id.nicknameButton);

        confirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String nickname = nicknameEditText.getText().toString();

                if(!nickname.equals("") && Utils.isValidNickname(nickname)) {
                    updateNickname(nickname);
                }
                else {
                    nicknameLayout.setError(getString(R.string.error_username));
                }
            }
        });

        Button infoButton = findViewById(R.id.infoButton);
        infoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openInfo();
            }
        });
    }

    @Override
    public void onBackPressed() {
        if(fromSettings) {
            finish();
        }
    }

    private void openInfo() {
        InfoDialog infoDialog = new InfoDialog(this, getString(R.string.title_info_nickname), getString(R.string.content_info_nickname), getString(R.string.close_button));

        infoDialog.show();
    }

    private void updateNickname(String nickname) {
        if(!Utils.isValidNickname(nickname))
            return;

        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_nickname))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("nickname", nickname);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        }

        //new RegisterAsync().execute(to_send);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "users/nickname";
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

                    // token update
                    JWTUtils.setJWT(NicknameActivity.this, result.getString("new_token"));

                    finish();

                } catch (JSONException e) {
                    e.printStackTrace();
                }
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

                    if(statusCode == 409) {
                        InfoDialog infoDialog = new InfoDialog(NicknameActivity.this, "Errore di validazione", "Questo nickname è già in uso. Sei pregato di sceglierne un altro.", getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                    else {
                        InfoDialog infoDialog = new InfoDialog(NicknameActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(NicknameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();
                }
            }
        }) {

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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(NicknameActivity.this));

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