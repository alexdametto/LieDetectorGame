package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Adapters.GameRequestListAdapter;
import com.dametto.poloni.liedetectorv2.utility.Adapters.PlayerListAdapter;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.GameRequest;
import com.dametto.poloni.liedetectorv2.utility.Data.Player;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class SelectPlayerActivity extends AppCompatActivity {
    ListView players;
    PlayerListAdapter playerListAdapter;
    TextInputEditText nicknameEditText;
    TextView noPlayersFound;
    ImageButton searchButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_player);

        nicknameEditText = findViewById(R.id.nicknameEditText);

        nicknameEditText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                boolean handled = false;
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    search();

                    closeKeyboard();

                    handled = true;
                }
                return handled;
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

        searchButton = findViewById(R.id.searchButton);

        noPlayersFound = findViewById(R.id.textViewEmptyPlayers);

        players = findViewById(R.id.players);
        LinearLayout emptyText = findViewById(android.R.id.empty);
        players.setEmptyView(emptyText);

        players.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                Player p = playerListAdapter.getItem(i);
                selectPlayer(p.getId());
            }
        });

        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                search();
                closeKeyboard();
            }
        });

        //getPlayers(null);
    }

    private void closeKeyboard()
    {
        // this will give us the view
        // which is currently focus
        // in this layout
        View view = this.getCurrentFocus();

        // if nothing is currently
        // focus then this will protect
        // the app from crash
        if (view != null) {

            // now assign the system
            // service to InputMethodManager
            InputMethodManager manager = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
            manager.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    private void search() {
        String nickname = nicknameEditText.getText().toString();

        getPlayers(nickname);
    }

    private void selectPlayer(String id) {
        setResult(Activity.RESULT_OK,
                new Intent().putExtra("playerId", id));
        finish();
    }

    private void renderPlayer(JSONArray players) {
        List<Player> playersList = new ArrayList<>();
        for(int i = 0; i < players.length(); i++) {
            try{
                JSONObject reqJSON = players.getJSONObject(i);
                Player p1 = new Player(reqJSON);
                playersList.add(p1);
            }catch (Exception e) {

            }
        }

        Collections.sort(playersList);

        this.playerListAdapter = new PlayerListAdapter(this, R.layout.player_item, playersList);
        this.players.setAdapter(playerListAdapter);
        //Utils.justifyListViewHeightBasedOnChildren(this.players);

        noPlayersFound.setText(getString(R.string.no_players_2));
    }

    private void getPlayers(String playerNickname) {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "gameRequest/players";

        if(playerNickname != null) {
            URL += "/" + playerNickname;
        }

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

                            renderPlayer(result.getJSONArray("players"));
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

                        InfoDialog infoDialog = new InfoDialog(SelectPlayerActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("cache-control", "no-cache");
                params.put("Content-Type", "application/x-www-form-urlencoded");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(SelectPlayerActivity.this));

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