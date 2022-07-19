package com.dametto.poloni.liedetectorv2;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
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
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.GameRequest;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import io.socket.emitter.Emitter;

public class StartGameActivity extends AppCompatActivity {
    Button randomOpponent, selectPlayer;
    ListView gameRequests;
    GameRequestListAdapter gameRequestListAdapter;
    TextView richiesteGameTextView;
    SwipeRefreshLayout pullToRefresh;

    private final static int
            SELECT_PLAYER = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_start_game);

        richiesteGameTextView = findViewById(R.id.RichiesteGame);

        pullToRefresh = findViewById(R.id.pullToRefresh);
        this.gameRequests = findViewById(R.id.gameRequests);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        randomOpponent = findViewById(R.id.newMatchButton);
        selectPlayer = findViewById(R.id.selectPlayerMatch);


        randomOpponent.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                createNewMatch();
            }
        });

        selectPlayer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectPlayer();
            }
        });

        /*gameRequests.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                GameRequest gameRequest = (GameRequest)gameRequestListAdapter.getItem(position);

                String myId = Utils.getId(StartGameActivity.this);
                if(!gameRequest.byMe(myId)) {
                    joinGame(gameRequest);
                }
            }
        });*/

        pullToRefresh.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                getRequests(false);
            }
        });

        getRequests(true);

        socketEvents();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch(requestCode) {
            case SELECT_PLAYER:
                if(resultCode == Activity.RESULT_OK) {
                    createNewMatchToPlayer(data.getStringExtra("playerId"));
                }
                break;
        }
    }

    private void selectPlayer() {
        Intent startGameIntent = new Intent(StartGameActivity.this, SelectPlayerActivity.class);
        startActivityForResult(startGameIntent, SELECT_PLAYER);
    }

    private void renderRequests(JSONArray request) {
        List<GameRequest> requestList = new ArrayList<>();
        for(int i = 0; i < request.length(); i++) {
            try{
                JSONObject reqJSON = request.getJSONObject(i);
                GameRequest request1 = new GameRequest(reqJSON, this);
                requestList.add(request1);
            }catch (Exception e) {

            }
        }

        if(requestList.size() == 0) {
            richiesteGameTextView.setText(getString(R.string.nessuna_richiesta_ricevuta));
            this.gameRequestListAdapter = new GameRequestListAdapter(this, R.layout.game_request_item, new ArrayList<GameRequest>(), this);
            gameRequests.setAdapter(gameRequestListAdapter);
            Utils.justifyListViewHeightBasedOnChildren(gameRequests);
        }
        else {
            richiesteGameTextView.setText(getString(R.string.lista_richieste));
            Collections.sort(requestList);
            this.gameRequestListAdapter = new GameRequestListAdapter(this, R.layout.game_request_item, requestList, this);
            gameRequests.setAdapter(gameRequestListAdapter);
            Utils.justifyListViewHeightBasedOnChildren(gameRequests);
        }
    }

    public void getRequests(final boolean first) {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();
        if(first) {
            progressDialog.show();
        }
        pullToRefresh.setRefreshing(true);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "gameRequest";

        StringRequest getRequest = new StringRequest(Request.Method.GET, URL,
                new Response.Listener<String>()
                {
                    @Override
                    public void onResponse(String response) {
                        // response
                        Log.d("Response", response);

                        if (first && progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }
                        pullToRefresh.setRefreshing(false);

                        try {
                            // Converto json risposta
                            JSONObject result = new JSONObject(response);

                            renderRequests(result.getJSONArray("requests"));
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

                        if (first && progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        pullToRefresh.setRefreshing(false);

                        InfoDialog infoDialog = new InfoDialog(StartGameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(StartGameActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void createNewMatch() {
        // with random opponent
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_new_match))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game/start";

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

                            Log.d("[JSON]", result.toString());

                            Game newGame = new Game(result.getJSONObject("game"), StartGameActivity.this);

                            DataUtility.games.add(newGame);

                            finish();
                            //Toast.makeText(MainActivity.this, "Started a new game " + result.getString("game_id"), Toast.LENGTH_LONG).show();

                        } catch (Exception e) {
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

                        InfoDialog infoDialog = new InfoDialog(StartGameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(StartGameActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void createNewMatchToPlayer(String playerId) {
        // with a specific player
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_new_match))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "gameRequest/" + playerId;

        StringRequest getRequest = new StringRequest(Request.Method.POST, URL,
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

                            Log.d("[JSON]", result.toString());

                            getRequests(false);

                            finish();

                            //Toast.makeText(MainActivity.this, "Started a new game " + result.getString("game_id"), Toast.LENGTH_LONG).show();

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

                        InfoDialog infoDialog = new InfoDialog(StartGameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(StartGameActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    @Override
    protected void onPause() {
        super.onPause();

        SocketUtility.getSocket().off("update_requests");
        SocketUtility.getSocket().off("reload_requests");
    }

    @Override
    protected void onResume() {
        super.onResume();

        socketEvents();
    }

    private void socketEvents() {
        SocketUtility.getSocket().off("update_requests");
        SocketUtility.getSocket().off("reload_requests");

        SocketUtility.getSocket().on("update_requests", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        finish();
                    }
                });
            }
        });

        SocketUtility.getSocket().on("reload_requests", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        getRequests(false);
                    }
                });
            }
        });
    }
}