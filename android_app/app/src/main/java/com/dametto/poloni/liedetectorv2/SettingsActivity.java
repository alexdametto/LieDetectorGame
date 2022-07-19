package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;

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
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialogYesNo;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class SettingsActivity extends AppCompatActivity {

    Button logout, riattivaIstruzioni;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        logout = findViewById(R.id.logoutButton);
        riattivaIstruzioni = findViewById(R.id.riattivaIstruzioni);

        updateAttivaIstruzioniButton();

        logout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final InfoDialogYesNo confermaLogout = new InfoDialogYesNo(SettingsActivity.this, getString(R.string.titolo_conferma_logout), "");
                confermaLogout.setYesOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        confermaLogout.dismiss();
                        logout();
                    }
                });
                confermaLogout.setNoOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        confermaLogout.dismiss();
                    }
                });

                confermaLogout.show();
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

        Button btnChangePassword = findViewById(R.id.changePassword);
        btnChangePassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                changePassword();
            }
        });

        Button btnDeleteAccount = findViewById(R.id.deleteAccount);
        btnDeleteAccount.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                deleteAccount();
            }
        });

        Button btnInfo = findViewById(R.id.informazioniButton);
        btnInfo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadInfo();
            }
        });

        Button btnTutorial = findViewById(R.id.tutorialButton);
        btnTutorial.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                launchSlide();
            }
        });

        Button btnPrivacy = findViewById(R.id.openPrivacy);
        btnPrivacy.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openPrivacy();
            }
        });

        Button btnNickname = findViewById(R.id.nicknameButton);
        btnNickname.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent nicknameIntent = new Intent(SettingsActivity.this, NicknameActivity.class);
                nicknameIntent.putExtra("fromSettings", true);
                startActivity(nicknameIntent);
            }
        });

        riattivaIstruzioni.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attivaDisattivaIstruzioni();
            }
        });
    }

    private void logout() {
        Utils.logout(SettingsActivity.this);
        finish();
    }

    private void riattivaIstruzioni() {
        Utils.setSkipVideo(this, false);
        Utils.setSkipDescribeImage(this, false);
    }

    private void disattivaIstruzioni() {
        Utils.setSkipVideo(this, true);
        Utils.setSkipDescribeImage(this, true);
    }

    private void updateAttivaIstruzioniButton() {
        if(Utils.getSkipVideo(this) && Utils.getSkipDescribeImage(this)) {
            // mostro pulsante abilita
            riattivaIstruzioni.setText(getString(R.string.riattiva_istruzioni));
        }
        else {
            // entrambi true, mostro pulsante DISABILITA
            riattivaIstruzioni.setText(getString(R.string.disabilita_istruzioni));
        }
    }

    private void attivaDisattivaIstruzioni() {
        if(Utils.getSkipVideo(this) && Utils.getSkipDescribeImage(this)) {
            // abilito
            riattivaIstruzioni();
        }
        else {
            // disabilito
            disattivaIstruzioni();
        }
        updateAttivaIstruzioniButton();
    }

    private void openPrivacy() {
        final Intent i = new Intent(SettingsActivity.this, SmallConsentActivity.class);
        i.putExtra("type", "PRIVACY");
        startActivity(i);
    }

    private void loadInfo() {
        InfoDialog infoDialog = new InfoDialog(this, getString(R.string.info_title), getString(R.string.info_content), getString(R.string.close_button));

        infoDialog.show();
    }

    private void changePassword() {
        Intent nicknameIntent = new Intent(SettingsActivity.this, ChangePasswordActivity.class);
        startActivity(nicknameIntent);
    }

    private void deleteAccount() {
        final InfoDialogYesNo infoDialogYesNo = new InfoDialogYesNo(this, getString(R.string.attenzione), getString(R.string.messaggio_cancellazione));
        infoDialogYesNo.setNoOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                infoDialogYesNo.dismiss();
            }
        });

        infoDialogYesNo.setYesOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                infoDialogYesNo.dismiss();
                deleteAccountAfterConfirm();
            }
        });

        infoDialogYesNo.setError(true);
        infoDialogYesNo.show();
    }

    private void deleteAccountAfterConfirm() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        JSONObject to_send = new JSONObject();

        try {
        } catch (Exception e) {
            e.printStackTrace();

            return;
        }

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "users/deleteUser";
        final String requestBody = to_send.toString();

        StringRequest stringRequest = new StringRequest(Request.Method.DELETE, URL, new Response.Listener<String>() {
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

                    logout();

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

                    InfoDialog infoDialog = new InfoDialog(SettingsActivity.this, getString(R.string.title_error) + " (" + statusCode + ")", getString(R.string.content_error), getString(R.string.close_button));
                    infoDialog.setError(true);
                    infoDialog.show();
                } catch (Exception e) {
                    InfoDialog infoDialog = new InfoDialog(SettingsActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(SettingsActivity.this));

                return params;
            }
        };

        stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(stringRequest);
    }

    public void launchSlide() {
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                final Intent i = new Intent(SettingsActivity.this, ActivityIntro.class);
                i.putExtra("fromSettings", true);
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        startActivity(i);
                    }
                });
            }
        });

        t.start();
    }
}