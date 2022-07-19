package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.Html;
import android.text.method.LinkMovementMethod;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import io.socket.client.Socket;

public class SmallConsentActivity extends AppCompatActivity {
    TextView textViewInfo;
    Button btnConferma;
    ScrollView scrollView;
    String type = "CONSENT";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_small_consent);

        Bundle extras = getIntent().getExtras();
        if(extras != null) {
            this.type = extras.getString("type", "CONSENT");
        }

        textViewInfo = findViewById(R.id.textViewInfo);
        textViewInfo.setMovementMethod(LinkMovementMethod.getInstance());
        btnConferma = findViewById(R.id.consentAgree);
        scrollView = findViewById(R.id.contentScrollView);

        loadInfo();

        btnConferma.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(scrollView.canScrollVertically(1)) {
                    scrollView.fullScroll(View.FOCUS_DOWN);
                    return;
                }

                confirm();
            }
        });
    }

    private void loadInfo() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_login))
                .build();

        progressDialog.show();

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "public/" + (type.equals("CONSENT") ? "consent" : "privacy" );

        StringRequest getRequest = new StringRequest(Request.Method.GET, URL,
                new Response.Listener<String>()
                {
                    @Override
                    public void onResponse(String response) {
                        // response
                        Log.d("Response", response);

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        textViewInfo.setText(Html.fromHtml(response, Html.FROM_HTML_MODE_LEGACY));
                    }
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("ERROR","error => "+error.toString());

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        try {
                            // Converto json risposta
                            int statusCode = error.networkResponse.statusCode;

                            InfoDialog infoDialog = new InfoDialog(SmallConsentActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                            infoDialog.setError(true);
                            infoDialog.show();
                        } catch (Exception e) {
                            InfoDialog infoDialog = new InfoDialog(SmallConsentActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                            infoDialog.setError(true);
                            infoDialog.show();
                        }
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("cache-control", "no-cache");
                params.put("Content-Type", "application/x-www-form-urlencoded");

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void confirm() {
        Intent data = new Intent();
        data.putExtra("participate", true);
        data.putExtra("dataProcessing", true);
        data.putExtra("publishingImages", true);

        setResult(RESULT_OK, data);
        finish();
    }
}