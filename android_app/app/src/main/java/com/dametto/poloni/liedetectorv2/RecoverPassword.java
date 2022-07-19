package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;

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

import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class RecoverPassword extends AppCompatActivity {
    TextInputLayout emailLayout;
    TextInputEditText email;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recover_password);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        emailLayout = findViewById(R.id.emailLayout);
        email = findViewById(R.id.emailTextField);

        email.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                emailLayout.setError("");
            }

            @Override
            public void afterTextChanged(Editable editable) {

            }
        });

        Button btnRecoverPassword = findViewById(R.id.recoverPassword);
        // Onclick pulsante indietro
        btnRecoverPassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                recoverPassword();
            }
        });
    }

    private boolean checkRecoverPassword() {
        String email = this.email.getText().toString();

        if(!Utils.isValidEmail(email)) {
            emailLayout.setError(getString(R.string.error_email));
            return false;
        }

        return true;
    }

    private void recoverPassword() {
        if(checkRecoverPassword()) {
            // you can change password
            String email = this.email.getText().toString();

            final AlertDialog progressDialog = new SpotsDialog.Builder()
                    .setContext(this)
                    .setTheme(R.style.ProgressDialogStyle)
                    .setMessage(getString(R.string.wait))
                    .build();

            progressDialog.show();

            JSONObject to_send = new JSONObject();

            try {
                to_send.put("email", email);
            } catch (Exception e) {
                e.printStackTrace();

                return;
            }

            RequestQueue requestQueue = Volley.newRequestQueue(this);
            String URL = Constants.API_URL + "auth/recoverPassword";
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

                        InfoDialog infoDialog = new InfoDialog(RecoverPassword.this, getString(R.string.email_inviata), getString(R.string.abbiamo_inviato_email), getString(R.string.close_button));
                        infoDialog.setError(false);
                        infoDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
                            @Override
                            public void onDismiss(DialogInterface dialogInterface) {
                                finish();
                            }
                        });
                        infoDialog.show();

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

                        if(statusCode == 404) {
                            RecoverPassword.this.emailLayout.setError(getString(R.string.email_not_found));
                        }
                        else {
                            InfoDialog infoDialog = new InfoDialog(RecoverPassword.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                            infoDialog.setError(true);
                            infoDialog.show();
                        }
                    } catch (Exception e) {
                        InfoDialog infoDialog = new InfoDialog(RecoverPassword.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                    //params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(ChangePasswordActivity.this));

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
}