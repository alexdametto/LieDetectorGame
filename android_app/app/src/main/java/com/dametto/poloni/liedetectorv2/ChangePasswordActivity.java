package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Intent;
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
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import okhttp3.internal.Util;

public class ChangePasswordActivity extends AppCompatActivity {
    TextInputLayout oldPasswordLayout, newPasswordLayout, confirmPasswordLayout;
    TextInputEditText oldPassword, newPassword, confirmPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        Button btnChangePassword = findViewById(R.id.changePassword);
        btnChangePassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                changePassword();
            }
        });

        oldPasswordLayout = findViewById(R.id.oldPasswordLayout);
        oldPassword = findViewById(R.id.oldPasswordTextField);

        newPasswordLayout = findViewById(R.id.newPasswordLayout);
        newPassword = findViewById(R.id.newPasswordTextField);

        confirmPasswordLayout = findViewById(R.id.confirmPasswordLayout);
        confirmPassword = findViewById(R.id.confirmPasswordTextField);

        oldPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                oldPasswordLayout.setError("");
            }

            @Override
            public void afterTextChanged(Editable editable) {

            }
        });

        newPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                newPasswordLayout.setError("");
                confirmPasswordLayout.setError("");
            }

            @Override
            public void afterTextChanged(Editable editable) {

            }
        });

        confirmPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                confirmPasswordLayout.setError("");
            }

            @Override
            public void afterTextChanged(Editable editable) {

            }
        });
    }

    private boolean checkChangePassword() {
        String currentPassword = oldPassword.getText().toString();
        String newPassword = this.newPassword.getText().toString();
        String confirmPassword = this.confirmPassword.getText().toString();

        if(!Utils.isValidPassword(newPassword)) {
            //newPasswordLayout.setError(getString(R.string.error_password));
            newPasswordLayout.setError(getString(R.string.password_validation_simple));
            return false;
        }

        if(!newPassword.equals(confirmPassword)) {
            confirmPasswordLayout.setError(getText(R.string.error_confirm_password));
            return false;
        }

        return true;
    }

    private void changePassword() {
        if(checkChangePassword()) {
            // you can change password
            String currentPassword = oldPassword.getText().toString();
            String newPassword = this.newPassword.getText().toString();

            final AlertDialog progressDialog = new SpotsDialog.Builder()
                    .setContext(this)
                    .setTheme(R.style.ProgressDialogStyle)
                    .setMessage(getString(R.string.wait))
                    .build();

            progressDialog.show();

            JSONObject to_send = new JSONObject();

            try {
                to_send.put("oldPassword", Utils.getSHA512(currentPassword));
                to_send.put("newPassword", Utils.getSHA512(newPassword));
            } catch (Exception e) {
                e.printStackTrace();

                return;
            }

            RequestQueue requestQueue = Volley.newRequestQueue(this);
            String URL = Constants.API_URL + "auth/changePassword";
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

                        if(statusCode == 400) {
                            ChangePasswordActivity.this.oldPasswordLayout.setError(getString(R.string.password_non_corrisponde));
                        }
                        else {
                            InfoDialog infoDialog = new InfoDialog(ChangePasswordActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                            infoDialog.setError(true);
                            infoDialog.show();
                        }
                    } catch (Exception e) {
                        InfoDialog infoDialog = new InfoDialog(ChangePasswordActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                    params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(ChangePasswordActivity.this));

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