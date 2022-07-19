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
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;

import androidx.annotation.Nullable;
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
import com.dametto.poloni.liedetectorv2.utility.CustomSlideFragment.LinkSliderFragment;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
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
import dmax.dialog.SpotsDialog;
import io.socket.client.Socket;

public class RegistrationActivity extends AppCompatActivity {

    Button createAccount;
    TextInputLayout emailLayout, passwordLayout, confirmPasswordLayout;
    TextInputEditText email, password, confirmPassword;

    private static final int CONSENT = 1;

    private boolean checkButtonCreate() {
        String email_str, password_str, confirmPassword_str;

        email_str = email.getText().toString();
        password_str = password.getText().toString();
        confirmPassword_str = confirmPassword.getText().toString();

        // Reset fields
        emailLayout.setError("");
        passwordLayout.setError("");
        confirmPasswordLayout.setError("");

        if(!Utils.isValidEmail(email_str) || !Utils.isValidPassword(password_str) || !Utils.isCorrectPassword(password_str, confirmPassword_str)) {
            // Check for error on fields
            if(!Utils.isValidEmail(email_str)) {
                emailLayout.setError(getString(R.string.error_email));
            }
            if(!Utils.isValidPassword(password_str)) {
                //passwordLayout.setError(getString(R.string.error_password));
                passwordLayout.setError(getString(R.string.password_validation_simple));
            }
            if(!Utils.isCorrectPassword(password_str, confirmPassword_str)) {
                confirmPasswordLayout.setError(getText(R.string.error_confirm_password));
            }

            return false;
        }

        return true;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        // Components init
        createAccount = findViewById(R.id.createAccount);
        email = findViewById(R.id.emailTextField);
        password = findViewById(R.id.passwordTextField);
        confirmPassword = findViewById(R.id.confirmPasswordTextField);

        emailLayout = findViewById(R.id.emailLayout);
        passwordLayout = findViewById(R.id.passwordLayout);
        confirmPasswordLayout = findViewById(R.id.confirmPasswordLayout);


        // Init for components

        //createAccount.setEnabled(false);

        createAccount.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mostraSlider();
            }
        });

        confirmPassword.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if ((event.getAction() == KeyEvent.ACTION_DOWN) &&
                        (keyCode == KeyEvent.KEYCODE_ENTER)) {



                    mostraSlider();

                    return true;
                }

                return false;
            }
        });

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


        confirmPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                confirmPasswordLayout.setError("");

                return;

                /*
                String confirmPassword = s.toString();

                if(confirmPassword.length() < 5) {
                    confirmPasswordLayout.setError("");
                    return;
                }

                String realPassword = password.getText().toString();

                if(!Utility.isCorrectPassword(realPassword, confirmPassword)) {
                    confirmPasswordLayout.setError(getText(R.string.error_confirm_password));
                }
                else confirmPasswordLayout.setError("");*/
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
    }

    private void checkEmail() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        String email_str;
        email_str = email.getText().toString();

        JSONObject to_send = new JSONObject();

        try {
            to_send.put("email", email_str);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        //new RegisterAsync().execute(to_send);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "public/emailAlreadyUsed";
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

                    boolean exists = result.getBoolean("exists");

                    if(!exists) {
                        // Vecchio slider di consent
                        //final Intent i = new Intent(RegistrationActivity.this, SliderConsent.class);

                        // Nuovo consent "breve"
                        final Intent i = new Intent(RegistrationActivity.this, SmallConsentActivity.class);
                        i.putExtra("type", "CONSENT");
                        startActivityForResult(i, CONSENT);
                    }
                    else {
                        InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.error), getString(R.string.errore_registrazione), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }

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

                    InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();
                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }

    private void mostraSlider() {
        if(!checkButtonCreate()) {
            return;
        }

        checkEmail();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode) {
            case CONSENT:
                if (resultCode == RESULT_OK) {
                    boolean participate = data.getExtras().getBoolean("participate", false);
                    boolean dataProcessing = data.getExtras().getBoolean("dataProcessing", false);
                    boolean publishingImages = data.getExtras().getBoolean("publishingImages", false);

                    if(participate) {
                        // Only one mandatory
                        createAcc(participate, dataProcessing, publishingImages);
                    }
                }
                else if(resultCode == RESULT_CANCELED) {
                    // Indico il motivo della NON-registrazione
                    InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.registrazione_annullata), getString(R.string.registrazione_annullata_info), getString(R.string.ok));
                    infoDialog.setError(true);
                    infoDialog.show();
                }
                break;
        }
    }

    private void createAcc(boolean participate, boolean dataProcessing, boolean publishingImages) {
        if(!checkButtonCreate()) {
            return;
        }

        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_registrazione))
                .build();

        progressDialog.show();

        String email_str, password_str;

        email_str = email.getText().toString();
        password_str = password.getText().toString();
        
        JSONObject to_send = new JSONObject();

        try {
            to_send.put("email", email_str);
            to_send.put("password", Utils.getSHA512(password_str));
            to_send.put("participate", participate);
            to_send.put("dataProcessing", dataProcessing);
            to_send.put("publishingImages", publishingImages);
        } catch (JSONException e) {
            e.printStackTrace();

            return;
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        //new RegisterAsync().execute(to_send);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "auth";
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

                    Context context = RegistrationActivity.this;

                    Utils.setLogged(context, true);
                    JWTUtils.setJWT(context, result.getString("token"));

                    Socket s = SocketUtility.getSocket();
                    s.emit("auth", JWTUtils.getJWT(context));

                    setResult(RESULT_OK);

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
                        InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.error), getString(R.string.errore_registrazione), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                    else {
                        InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }

                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(RegistrationActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }
}