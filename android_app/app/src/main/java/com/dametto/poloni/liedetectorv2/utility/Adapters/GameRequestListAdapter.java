package com.dametto.poloni.liedetectorv2.utility.Adapters;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.StartGameActivity;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.GameRequest;
import com.dametto.poloni.liedetectorv2.utility.Data.LeaderboardListItem;
import com.dametto.poloni.liedetectorv2.utility.Data.Player;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import okhttp3.internal.Util;

public class GameRequestListAdapter extends ArrayAdapter<GameRequest> {
    Context context;
    StartGameActivity activity;

    public GameRequestListAdapter(Context context, int textViewResourceId,
                                  List<GameRequest> objects, StartGameActivity activity) {
        super(context, textViewResourceId, objects);
        this.context = context;
        this.activity = activity;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        final GameRequest item = getItem(position);

        convertView = inflater.inflate(R.layout.game_request_item, null);

        LinearLayout linearLayout = convertView.findViewById(R.id.container);
        TextView name = convertView.findViewById(R.id.nameLabel);
        TextView status = convertView.findViewById(R.id.statusLabel);

        ImageButton confirmButton = convertView.findViewById(R.id.acceptButton);
        ImageButton denyButton = convertView.findViewById(R.id.denyButton);

        LinearLayout containerButton = convertView.findViewById(R.id.containerButtons);

        confirmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                onConfirm(item);
            }
        });
        denyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                onDeny(item);
            }
        });

        String myId = Utils.getId(context);
        if(item.byMe(myId)) {
            // richiesta fatta da me
            linearLayout.setBackgroundColor(context.getColor(R.color.gameWaiting));
            name.setText(item.getReceiver().getNickname());
            status.setText(context.getString(R.string.grInAttesa));
            status.setVisibility(View.VISIBLE);

            containerButton.setVisibility(View.GONE);
        }
        else {
            // richiesta ricevuta
            linearLayout.setBackgroundColor(context.getColor(R.color.colorPrimary));
            name.setText(item.getSender().getNickname());
            status.setText("");
            status.setVisibility(View.GONE);
        }

        return convertView;
    }

    private void onConfirm(GameRequest req) {
        // with game request
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(context)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(context.getString(R.string.wait))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(context);
        String URL = Constants.API_URL + "game/startGameWithPlayer/" + req.getSender().getId() + "/" + req.getId();

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

                            activity.finish();
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

                        InfoDialog infoDialog = new InfoDialog(activity, context.getString(R.string.title_error), context.getString(R.string.content_error), context.getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(context));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void onDeny(GameRequest req) {
        // with game request
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(context)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(context.getString(R.string.wait))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(context);
        String URL = Constants.API_URL + "gameRequest/" + req.getId();

        StringRequest getRequest = new StringRequest(Request.Method.DELETE, URL,
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

                            activity.getRequests(false);
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

                        InfoDialog infoDialog = new InfoDialog(activity, context.getString(R.string.title_error), context.getString(R.string.content_error), context.getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(context));

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
