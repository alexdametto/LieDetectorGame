package com.dametto.poloni.liedetectorv2;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Adapters.GameListAdapter;
import com.dametto.poloni.liedetectorv2.utility.Adapters.LeaderboardListAdapter;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.LeaderboardListItem;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.google.android.material.tabs.TabLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class LeaderboardActivity extends AppCompatActivity {

    TabLayout tabLayout;
    LeaderboardListAdapter leaderboardListAdapter;
    ListView listView;

    List<LeaderboardListItem> byWins = new ArrayList<>();
    List<LeaderboardListItem> byRateo = new ArrayList<>();
    List<LeaderboardListItem> byMatches = new ArrayList<>();
    List<LeaderboardListItem> byPoints = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_leaderboard);

        listView = findViewById(R.id.leaderboardList);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        tabLayout = findViewById(R.id.tabLayout);
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                changeTab(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {

            }
        });

        loadLeaderboard();
    }

    private void loadLeaderboard() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "admin/leaderboard";

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
                            JSONObject data = result.getJSONObject("data");

                            JSONArray jsonByWins = data.getJSONArray("byWins");
                            JSONArray jsonByRateo = data.getJSONArray("byRate");
                            JSONArray jsonByMatches = data.getJSONArray("byMatches");
                            JSONArray jsonByPoints = data.getJSONArray("byPoints");

                            for(int i = 0; i < jsonByWins.length(); i++) {
                                JSONObject obj = jsonByWins.getJSONObject(i);

                                String id = obj.getString("id");
                                String nickname = obj.getString("nickname");
                                Double wins = obj.getDouble("wins");
                                Double lose = obj.getDouble("losses");
                                Double draws = obj.getDouble("draws");

                                byWins.add(new LeaderboardListItem(id, nickname, wins, false));
                            }

                            for(int i = 0; i < jsonByRateo.length(); i++) {
                                JSONObject obj = jsonByRateo.getJSONObject(i);

                                String id = obj.getString("id");
                                String nickname = obj.getString("nickname");
                                Double wins = obj.getDouble("wins");
                                Double lose = obj.getDouble("losses");
                                Double draws = obj.getDouble("draws");

                                if(wins + lose + draws == 0) {
                                    byRateo.add(new LeaderboardListItem(id, nickname, 0.0, true));
                                }
                                else {
                                    byRateo.add(new LeaderboardListItem(id, nickname, Utils.roundNumber2Decimals(wins/(wins + lose + draws) * 100.0), true));
                                }
                            }

                            for(int i = 0; i < jsonByMatches.length(); i++) {
                                JSONObject obj = jsonByMatches.getJSONObject(i);

                                String id = obj.getString("id");
                                String nickname = obj.getString("nickname");
                                Double wins = obj.getDouble("wins");
                                Double lose = obj.getDouble("losses");
                                Double draws = obj.getDouble("draws");

                                byMatches.add(new LeaderboardListItem(id, nickname, wins + lose + draws, false));
                            }

                            for(int i = 0; i < jsonByPoints.length(); i++) {
                                JSONObject obj = jsonByPoints.getJSONObject(i);

                                String id = obj.getString("id");
                                String nickname = obj.getString("nickname");
                                Double points = obj.getDouble("points");

                                byPoints.add(new LeaderboardListItem(id, nickname, points, false));
                            }

                            showTabVittorie();
                        } catch (Exception e) {
                            InfoDialog infoDialog = new InfoDialog(LeaderboardActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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

                        InfoDialog infoDialog = new InfoDialog(LeaderboardActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(LeaderboardActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void changeTab(int position) {
        switch (position) {
            case 0: {
                showTabVittorie();
                break;
            }

            case 1: {
                showTabRateo();
                break;
            }

            case 2: {
                showTabPoints();
                break;
            }

            default:
                break;
        }
    }

    private void showTabVittorie() {
        leaderboardListAdapter = new LeaderboardListAdapter(this, R.layout.game_item, byWins, true);
        listView.setAdapter(leaderboardListAdapter);
        Utils.justifyListViewHeightBasedOnChildren(listView);
    }

    private void showTabRateo() {
        leaderboardListAdapter = new LeaderboardListAdapter(this, R.layout.game_item, byRateo, true);
        listView.setAdapter(leaderboardListAdapter);
        Utils.justifyListViewHeightBasedOnChildren(listView);
    }

    private void showTabPartite() {
        leaderboardListAdapter = new LeaderboardListAdapter(this, R.layout.game_item, byMatches, true);
        listView.setAdapter(leaderboardListAdapter);
        Utils.justifyListViewHeightBasedOnChildren(listView);
    }

    private void showTabPoints() {
        leaderboardListAdapter = new LeaderboardListAdapter(this, R.layout.game_item, byPoints, true);
        listView.setAdapter(leaderboardListAdapter);
        Utils.justifyListViewHeightBasedOnChildren(listView);
    }
}