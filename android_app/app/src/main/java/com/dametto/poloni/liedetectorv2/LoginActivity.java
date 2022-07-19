package com.dametto.poloni.liedetectorv2;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

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
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import io.socket.client.Socket;

public class LoginActivity extends AppCompatActivity {

    Button registerButton;

    Button loginButton;
    TextInputLayout emailLayout, passwordLayout;
    TextInputEditText email, password;

    private static final int REGISTRATION_CODE = 1;

    private boolean checkButtonLogin() {
        String username_str, email_str, password_str;

        email_str = email.getText().toString();
        password_str = password.getText().toString();

        // Reset fields
        emailLayout.setError("");
        passwordLayout.setError("");

        if(!Utils.isValidEmail(email_str)) {
            // Check for error on fields
            if(!Utils.isValidEmail(email_str)) {
                emailLayout.setError(getString(R.string.error_email));
            }

            return false;
        }
        else return true;
    }

    @Override
    public void onBackPressed()
    {
        finishAffinity();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        TextView recoverPasswordButton = findViewById(R.id.recoverPassword);
        recoverPasswordButton.getPaint().setUnderlineText(true);
        recoverPasswordButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                recoverPassword();
            }
        });

        // Components init
        registerButton = findViewById(R.id.registerButton);

        loginButton = findViewById(R.id.loginButton);

        email = findViewById(R.id.emailTextField);
        password = findViewById(R.id.passwordTextField);

        emailLayout = findViewById(R.id.emailLayout);
        passwordLayout = findViewById(R.id.passwordLayout);

        email.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                emailLayout.setError("");

                return;
                /*if(s.toString().length() < 5) {
                    emailLayout.setError("");
                    return;
                }

                if(!Utility.isValidEmail(s)) {
                    emailLayout.setError(getString(R.string.error_email));
                }
                else {
                    emailLayout.setError("");
                }*/
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        password.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                passwordLayout.setError("");

                return;

                /*
                String password = s.toString();

                if(password.length() < 5) {
                    passwordLayout.setError("");
                    return;
                }

                if(!Utility.isValidPassword(password)) {
                    passwordLayout.setError(getString(R.string.error_password));
                }
                else passwordLayout.setError("");*/
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        password.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if ((event.getAction() == KeyEvent.ACTION_DOWN) &&
                        (keyCode == KeyEvent.KEYCODE_ENTER)) {

                    login();

                    return true;
                }

                return false;
            }
        });


        // Code for register button
        registerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent registerIntent = new Intent(LoginActivity.this, RegistrationActivity.class);
                startActivityForResult(registerIntent, REGISTRATION_CODE);
            }
        });

        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                login();
            }
        });
    }

    private void recoverPassword() {
        Intent registerIntent = new Intent(LoginActivity.this, RecoverPassword.class);
        startActivity(registerIntent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode) {
            case REGISTRATION_CODE:
                if(resultCode == RESULT_OK) {
                    finish();
                }
                break;
        }
    }

    private void login() {
        if(!checkButtonLogin()) {
            return;
        }

        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_login))
                .build();

        progressDialog.show();

        final String email_str, password_str;

        email_str = email.getText().toString();
        password_str = password.getText().toString();

        //new RegisterAsync().execute(to_send);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "auth";

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

                        try {
                            // Converto json risposta
                            JSONObject result = new JSONObject(response);

                            Context context = LoginActivity.this;

                            Utils.setLogged(context, true);
                            JWTUtils.setJWT(context, result.getString("token"));

                            Socket s = SocketUtility.getSocket();
                            s.emit("auth", JWTUtils.getJWT(context));

                            finish();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
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

                            if(statusCode == 401 || statusCode == 404) {
                                InfoDialog infoDialog = new InfoDialog(LoginActivity.this, getString(R.string.key_autenticazione_fallita), getString(R.string.key_auth_fallita_content), getString(R.string.close_button));
                                infoDialog.setError(true);
                                infoDialog.show();
                            }
                            else {
                                InfoDialog infoDialog = new InfoDialog(LoginActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                                infoDialog.setError(true);
                                infoDialog.show();
                            }
                        } catch (Exception e) {
                            if(error.networkResponse.statusCode == 401 || error.networkResponse.statusCode == 404) {
                                InfoDialog infoDialog = new InfoDialog(LoginActivity.this, getString(R.string.key_autenticazione_fallita), getString(R.string.key_auth_fallita_content), getString(R.string.close_button));
                                infoDialog.setError(true);
                                infoDialog.show();
                            }
                            else {
                                InfoDialog infoDialog = new InfoDialog(LoginActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                                infoDialog.setError(true);
                                infoDialog.show();
                            }
                        }
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("cache-control", "no-cache");
                params.put("Content-Type", "application/x-www-form-urlencoded");
                try {
                    params.put("authorization", "Basic " + Utils.btoa(email_str + ":" + Utils.getSHA512(password_str)));
                } catch (NoSuchAlgorithmException e) {
                    e.printStackTrace();
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }
}