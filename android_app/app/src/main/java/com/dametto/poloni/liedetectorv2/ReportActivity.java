package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
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
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
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

public class ReportActivity extends AppCompatActivity {

    Game game;
    TextView titleActivity;
    Spinner spinnerMotivazione;
    Button reportButton;
    TextInputLayout reportContentLayout;
    TextInputEditText reportContentTextField;

    String[] spinnerItems;
    String[] reportTypes = {
            "VIDEO",
            "NICKNAME",
            "CHEAT",
            "ALTRO"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report);

        spinnerItems = new String[]{
                getString(R.string.content_inappropriato),
                getString(R.string.offensive_nickname),
                getString(R.string.cheat_bug),
                getString(R.string.other)
        };


        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        this.game = (Game)getIntent().getSerializableExtra("game");

        this.titleActivity = findViewById(R.id.titleActivity);
        this.spinnerMotivazione = findViewById(R.id.spinnerMotivazione);
        this.reportButton = findViewById(R.id.reportButton);
        this.reportContentLayout = findViewById(R.id.reportContentLayout);
        this.reportContentTextField = findViewById(R.id.reportContentTextField);

        ArrayAdapter spinnerAdapter = new ArrayAdapter(this,android.R.layout.simple_spinner_item, spinnerItems);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerMotivazione.setAdapter(spinnerAdapter);

        titleActivity.setText(getString(R.string.segnala) + " " + game.getOtherPlayerNickname(Utils.getId(this)));

        this.reportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                reportGame();
            }
        });
    }

    private void reportGame() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
            String content = reportContentTextField.getText().toString();
            to_send.put("description", content.length() == 0 ? null : content);
            to_send.put("reason", spinnerMotivazione.getSelectedItem().toString());
            to_send.put("type", reportTypes[spinnerMotivazione.getSelectedItemPosition()]);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        }


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "report/" + game.getId() + "/" + game.getOtherPlayer(Utils.getId(this)).getId();
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

                    InfoDialog infoDialog = new InfoDialog(ReportActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(ReportActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(ReportActivity.this));

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