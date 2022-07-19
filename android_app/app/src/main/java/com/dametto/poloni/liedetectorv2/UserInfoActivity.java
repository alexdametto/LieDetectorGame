package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;

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
import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import io.socket.client.Socket;

public class UserInfoActivity extends AppCompatActivity {
    TextInputLayout ageLayout, nicknameLayout;
    TextInputEditText age, nickname;
    Spinner sex, degree;
    Button confirm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_info);

        age = findViewById(R.id.ageTextField);
        ageLayout = findViewById(R.id.ageLayout);
        nicknameLayout = findViewById(R.id.nicknameLayout);

        sex = findViewById(R.id.spinnerSex);
        degree = findViewById(R.id.spinnerDegree);
        nickname = findViewById(R.id.nicknameEditText);

        String[] sexSpinnerItems = {
                getString(R.string.maschio),
                getString(R.string.femmina),
        };
        ArrayAdapter sexSpinnerAdapter = new ArrayAdapter(this,android.R.layout.simple_spinner_item, sexSpinnerItems);
        sexSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        sex.setAdapter(sexSpinnerAdapter);

        String[] degreeSpinnerItems = {
                getString(R.string.elementare),
                getString(R.string.media),
                getString(R.string.superiore),
                getString(R.string.triennale),
                getString(R.string.magistrale),
                getString(R.string.specMasterPhdOther),
        };
        ArrayAdapter degreeSpinnerAdapter = new ArrayAdapter(this,android.R.layout.simple_spinner_item, degreeSpinnerItems);
        degreeSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        degree.setAdapter(degreeSpinnerAdapter);

        Button infoButton = findViewById(R.id.infoButton);
        infoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openInfo();
            }
        });

        confirm = findViewById(R.id.nicknameButton);
        confirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setData();
            }
        });
    }

    private void openInfo() {
        InfoDialog infoDialog = new InfoDialog(this, getString(R.string.title_info_nickname), getString(R.string.content_info_nickname), getString(R.string.close_button));

        infoDialog.show();
    }

    private boolean checkSave() {
        String ageStr;
        String nicknameStr;

        // get fields
        ageStr = age.getText().toString();
        nicknameStr = nickname.getText().toString();

        // reset errors
        ageLayout.setError("");
        nicknameLayout.setError("");

        boolean toReturn = true;

        if(nicknameStr.equals("") || !Utils.isValidNickname(nicknameStr)) {
            nicknameLayout.setError(getString(R.string.error_username));
            toReturn = false;
        }

        if(ageStr.equals("")) {
            ageLayout.setError(getString(R.string.eta_obbligatoria));
            toReturn = false;
        }

        return toReturn;
    }

    private void setData() {
        if(!checkSave()) {
            return;
        }

        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        String sexString, degreeString, nicknameString;
        int ageValue = 0;

        // get values
        sexString = this.sex.getSelectedItem().toString();
        degreeString = this.degree.getSelectedItem().toString();
        nicknameString = this.nickname.getText().toString();

        if(this.age.getText().toString().length() > 0) {
            ageValue = Integer.parseInt(this.age.getText().toString());
        }

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("sex", sexString);
            to_send.put("age", ageValue);
            to_send.put("educationalQualification", degreeString);
            to_send.put("nickname", nicknameString);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "users/set_info";
        final String requestBody = to_send.toString();

        progressDialog.show();

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
                    JWTUtils.setJWT(UserInfoActivity.this, result.getString("new_token"));

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
                        InfoDialog infoDialog = new InfoDialog(UserInfoActivity.this, "Errore di validazione", "Questo nickname è già in uso. Sei pregato di sceglierne un altro.", getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                    else {
                        InfoDialog infoDialog = new InfoDialog(UserInfoActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(UserInfoActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(UserInfoActivity.this));

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