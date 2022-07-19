package com.dametto.poloni.liedetectorv2;

        import androidx.annotation.Nullable;
        import androidx.appcompat.app.AppCompatActivity;
        import androidx.appcompat.app.AppCompatDelegate;
        import androidx.core.content.res.ResourcesCompat;
        import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

        import android.app.AlertDialog;
        import android.content.Context;
        import android.content.Intent;
        import android.content.SharedPreferences;
        import android.content.res.Configuration;
        import android.graphics.Color;
        import android.os.Bundle;
        import android.preference.PreferenceManager;
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
        import com.androidadvance.topsnackbar.TSnackbar;
        import com.dametto.poloni.liedetectorv2.utility.Adapters.GameListAdapter;
        import com.dametto.poloni.liedetectorv2.utility.Constants;
        import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
        import com.dametto.poloni.liedetectorv2.utility.Data.Game;
        import com.dametto.poloni.liedetectorv2.utility.DataUtility;
        import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
        import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
        import com.dametto.poloni.liedetectorv2.utility.Utils;
        import com.google.android.material.button.MaterialButton;

        import org.json.JSONException;
        import org.json.JSONObject;

        import java.util.Collections;
        import java.util.HashMap;
        import java.util.Locale;
        import java.util.Map;
        import java.util.Timer;
        import java.util.TimerTask;

        import dmax.dialog.SpotsDialog;
        import io.socket.client.Socket;
        import io.socket.emitter.Emitter;

public class MainActivity extends AppCompatActivity {

    private final static int
            SETTING_REQ_CODE = 1,
            LOGIN_REQ_CODE = 2,
            NICK_REQ_CODE = 3,
            SHOW_MATCH_REQ_CODE = 4,
            LEADERBOARD_REQ_CODE = 5,
            START_NEW_GAME = 6;

    MaterialButton btnSettings, btnLeaderboard;
    TextView nicknameTextView;
    ListView games;
    SwipeRefreshLayout pullToRefresh;
    Button btnNewMatch;

    GameListAdapter games_adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Force to use ALWAYS Italian (and disable translations)
        Configuration cfg = new Configuration();
        cfg.locale = Locale.ITALY;
        getResources().updateConfiguration(cfg, null);

        setContentView(R.layout.activity_main);

        DataUtility.reset();

        btnSettings = findViewById(R.id.settings_button);
        btnLeaderboard = findViewById(R.id.leaderborad_button);

        btnNewMatch = findViewById(R.id.newMatchButton);
        nicknameTextView = findViewById(R.id.nicknameTextView);
        games = findViewById(R.id.games);

        btnNewMatch.setTypeface(ResourcesCompat.getFont(MainActivity.this, R.font.aldrich));

        LinearLayout emptyText = findViewById(R.id.homeListViewLayout);
        games.setEmptyView(emptyText);

        Utils.justifyListViewHeightBasedOnChildren(games);

        this.games_adapter = new GameListAdapter(this, R.layout.game_item, DataUtility.games);
        games.setAdapter(games_adapter);

        games.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Game g = games_adapter.getItem(position);

            Intent matchIntent = new Intent(MainActivity.this, GameActivity.class);
            matchIntent.putExtra("game", g);
            startActivityForResult(matchIntent, SHOW_MATCH_REQ_CODE);
            }
        });

        checkLogin();

        btnSettings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            Intent settingsIntent = new Intent(MainActivity.this, SettingsActivity.class);
            startActivityForResult(settingsIntent, SETTING_REQ_CODE);
            }
        });

        btnLeaderboard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            Intent settingsIntent = new Intent(MainActivity.this, LeaderboardActivity.class);
            startActivityForResult(settingsIntent, LEADERBOARD_REQ_CODE);
            }
        });

        btnNewMatch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startNewMatch();
            }
        });

        pullToRefresh = findViewById(R.id.pullToRefresh);
        pullToRefresh.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                getGames();
            }
        });

        launchSlide();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode) {
            case SETTING_REQ_CODE:
                checkLogin();
                break;
            case LOGIN_REQ_CODE:
                checkNickname();
                getGames();
                break;
            case NICK_REQ_CODE:
                checkNickname();
                break;
            case SHOW_MATCH_REQ_CODE:
            case START_NEW_GAME:
                getGames();
                //renderGames();

                // TODO
                break;
        }
    }

    // lancio le slide su un thread differente solo se è la prima volta che apro l'app
    public void launchSlide() {
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                SharedPreferences getPrefs = PreferenceManager
                        .getDefaultSharedPreferences(getBaseContext());

                boolean isFirstStart = getPrefs.getBoolean("firstStart", true);

                if (isFirstStart) {
                    final Intent i = new Intent(MainActivity.this, ActivityIntro.class);
                    runOnUiThread(new Runnable() {
                        @Override public void run() {
                            startActivity(i);
                        }
                    });
                    SharedPreferences.Editor e = getPrefs.edit();
                    e.putBoolean("firstStart", false);
                    e.apply();
                }
            }
        });

        t.start();
    }

    private void checkLogin() {
        if (!Utils.isLogged(MainActivity.this) || !JWTUtils.isJWTValid(MainActivity.this)) {
            // Apriamo activity login
            Intent loginIntent = new Intent(MainActivity.this, LoginActivity.class);
            startActivityForResult(loginIntent, LOGIN_REQ_CODE);
        }
        else {
            renewJWT();
        }
    }

    private void checkNickname() {
        if (Utils.isLogged(MainActivity.this) && JWTUtils.isJWTValid(MainActivity.this) && Utils.getNickname(MainActivity.this) == null) {
            // Chiediamo nickname

            Intent nicknameIntent = new Intent(MainActivity.this, UserInfoActivity.class);
            startActivityForResult(nicknameIntent, NICK_REQ_CODE);
        }
        else if(Utils.isLogged(MainActivity.this) && JWTUtils.isJWTValid(MainActivity.this)){
            // Setto il nickname
            String nickname = Utils.getNickname(MainActivity.this);

            nicknameTextView.setText(nickname);
        }
    }

    private void renewJWT() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        //new RegisterAsync().execute(to_send);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "auth/renew";

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

                            Context context = MainActivity.this;

                            JWTUtils.setJWT(context, result.getString("token"));

                            Socket s = SocketUtility.getSocket();
                            s.emit("auth", JWTUtils.getJWT(context));

                            socketChecker();

                            checkNickname();

                            getGames();
                        } catch (Exception e) {
                            InfoDialog infoDialog = new InfoDialog(MainActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                            infoDialog.setError(true);
                            infoDialog.show();
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

                        Utils.setLogged(MainActivity.this, false);
                        checkLogin();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("cache-control", "no-cache");
                params.put("Content-Type", "application/x-www-form-urlencoded");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(MainActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void getGames() {
        /*final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage("Wait...")
                .build();

        progressDialog.show();*/
        pullToRefresh.setRefreshing(true);


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game";

        StringRequest getRequest = new StringRequest(Request.Method.GET, URL,
                new Response.Listener<String>()
                {
                    @Override
                    public void onResponse(String response) {
                        // response
                        Log.d("Response", response);

                        /*if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }*/
                        pullToRefresh.setRefreshing(false);

                        try {
                            // Converto json risposta
                            JSONObject result = new JSONObject(response);

                            renderGames(result);

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

                        /*if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }*/
                        pullToRefresh.setRefreshing(false);

                        InfoDialog infoDialog = new InfoDialog(MainActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(MainActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void renderGames(JSONObject gamesContainer) {
        DataUtility.games.clear();

        try {
            DataUtility.games.addAll(Game.parseGames(gamesContainer.getJSONArray("games"), MainActivity.this));
        } catch (JSONException e) {
            e.printStackTrace();
        }

        renderGames();
    }

    private void renderGames() {
        Collections.sort(DataUtility.games);

        games_adapter.notifyDataSetChanged();
        Utils.justifyListViewHeightBasedOnChildren(games);
    }

    private void startNewMatch () {
        Intent startGameIntent = new Intent(MainActivity.this, StartGameActivity.class);
        startActivityForResult(startGameIntent, START_NEW_GAME);
    }

    @Override
    protected void onPause() {
        super.onPause();

        SocketUtility.getSocket().off("update_game_all");
        SocketUtility.getSocket().off("refresh_games");
        SocketUtility.getSocket().off("new_game_request");
        SocketUtility.getSocket().off("new_game_from_request");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
    protected void onResume() {
        super.onResume();

        socketEvents();
    }

    @Override
    protected void onPostResume() {
        super.onPostResume();
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    private void socketChecker() {
        // ogni tot controlla che sia loggato e indica che sei online
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                //your method
                if(Utils.isLogged(MainActivity.this)) {
                    // autenticazione su socket
                    SocketUtility.auth(JWTUtils.getJWT(MainActivity.this));
                }
                else {
                    SocketUtility.ping();
                }
            }
        }, 0, 1000);

        socketEvents();
    }

    private void socketEvents() {SocketUtility.getSocket().off("update_game_all");
        SocketUtility.getSocket().off("refresh_games");
        SocketUtility.getSocket().off("new_game_request");
        SocketUtility.getSocket().off("new_game_from_request");

        SocketUtility.getSocket().on("update_game_all", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        getGames();
                    }
                });
            }
        });

        SocketUtility.getSocket().on("refresh_games", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        getGames();
                    }
                });
            }
        });

        SocketUtility.getSocket().on("new_game_request", new Emitter.Listener() {
            @Override
            public void call(final Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        TSnackbar snackbar = TSnackbar.make(findViewById(android.R.id.content), getString(R.string.new_game_request).replace("{NICKNAME}", (String)args[0]), TSnackbar.LENGTH_LONG);
                        snackbar.setActionTextColor(Color.WHITE);
                        View snackbarView = snackbar.getView();
                        snackbarView.setBackgroundColor(getColor(R.color.mainColor));
                        TextView textView = (TextView) snackbarView.findViewById(com.androidadvance.topsnackbar.R.id.snackbar_text);
                        textView.setTextColor(Color.WHITE);
                        textView.setTypeface(ResourcesCompat.getFont(MainActivity.this, R.font.aldrich));
                        snackbar.show();
                    }
                });
            }
        });

        SocketUtility.getSocket().on("new_game_from_request", new Emitter.Listener() {
            @Override
            public void call(final Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        TSnackbar snackbar = TSnackbar.make(findViewById(android.R.id.content), getString(R.string.accept_game_request).replace("{NICKNAME}", (String)args[0]), TSnackbar.LENGTH_LONG);
                        snackbar.setActionTextColor(Color.WHITE);
                        View snackbarView = snackbar.getView();
                        snackbarView.setBackgroundColor(getColor(R.color.mainColor));
                        TextView textView = (TextView) snackbarView.findViewById(com.androidadvance.topsnackbar.R.id.snackbar_text);
                        textView.setTextColor(Color.WHITE);
                        textView.setTypeface(ResourcesCompat.getFont(MainActivity.this, R.font.aldrich));
                        snackbar.show();
                    }
                });
            }
        });
    }
}