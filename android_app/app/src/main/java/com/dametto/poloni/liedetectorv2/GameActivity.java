package com.dametto.poloni.liedetectorv2;

import androidx.annotation.Nullable;
import android.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.FinePartitaDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialogYesNo;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.dametto.poloni.liedetectorv2.utility.SocketUtility;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;
import io.socket.emitter.Emitter;

public class GameActivity extends AppCompatActivity {
    Game game;

    TextView nicknamePlayer1, nicknamePlayer2, punteggioP1, punteggioP2;
    Button buttonGioca, disabledButtonGioca, surrenderButton, reportButton;
    SwipeRefreshLayout pullToRefresh;

    boolean video = false, answer = false;

    private final static int VIDEO_REQ_CODE = 1, ANSWER_REQ_CODE = 2, REPORT_ANSWER_REQ_CODE = 3, SHOW_RECAP_ROUND_CODE = 4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        this.game = (Game)getIntent().getSerializableExtra("game");

        nicknamePlayer1 = findViewById(R.id.nicknamePlayer1);
        nicknamePlayer2 = findViewById(R.id.nicknamePlayer2);
        punteggioP1 = findViewById(R.id.punteggioPlayer1);
        punteggioP2 = findViewById(R.id.punteggioPlayer2);
        buttonGioca = findViewById(R.id.buttonGioca);
        disabledButtonGioca = findViewById(R.id.disabledButtonGioca);
        Button btnIndietro = findViewById(R.id.back_button);
        surrenderButton = findViewById(R.id.surrenderButton);
        reportButton = findViewById(R.id.reportButton);
        pullToRefresh = findViewById(R.id.pullToRefresh);

        surrenderButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final InfoDialogYesNo infoDialogYesNo = new InfoDialogYesNo(GameActivity.this, getString(R.string.modale_arresa_title), getString(R.string.modale_arresa_content));
                infoDialogYesNo.setYesOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        infoDialogYesNo.dismiss();
                        surrender();
                    }
                });

                infoDialogYesNo.setNoOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        infoDialogYesNo.dismiss();
                    }
                });

                infoDialogYesNo.show();
            }
        });

        reportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                reportGame();
            }
        });

        pullToRefresh.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                refreshGame();
            }
        });

        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        buttonGioca.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                playButton();
            }
        });

        refreshLayout();

        socketEvents();
    }

    private void reportGame() {
        Intent reportActivityIntent = new Intent(GameActivity.this, ReportActivity.class);
        reportActivityIntent.putExtra("game", game);
        startActivityForResult(reportActivityIntent, REPORT_ANSWER_REQ_CODE);
    }

    private void surrender() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.wait))
                .build();

        progressDialog.show();


        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game/" + game.getId() + "/surrender";

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

                            game = new Game(result.getJSONObject("game"), GameActivity.this);

                            refreshLayout();

                            //FinePartitaDialog finePartitaDialog = new FinePartitaDialog(GameActivity.this, game);
                            //finePartitaDialog.show();

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        // TODO Auto-generated method stub
                        Log.d("ERROR","error => "+error.toString());

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        InfoDialog infoDialog = new InfoDialog(GameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(GameActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void refreshGame() {
        pullToRefresh.setRefreshing(true);

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game/" + this.game.getId();

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

                            game = new Game(result.getJSONObject("game"), GameActivity.this);

                            refreshLayout();

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

                        /*if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }*/
                        pullToRefresh.setRefreshing(false);

                        InfoDialog infoDialog = new InfoDialog(GameActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
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
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(GameActivity.this));

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
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);


        switch(requestCode) {
            case VIDEO_REQ_CODE:
                if(data!= null && data.getExtras() != null && data.getExtras().get("game") != null) {
                    this.game = (Game)data.getExtras().get("game");
                    refreshLayout();
                }
                break;
            case ANSWER_REQ_CODE:
                if(data!= null && data.getExtras() != null && data.getExtras().get("game") != null) {
                    this.game = (Game)data.getExtras().get("game");
                    Intent i = new Intent(this, RecapSingleRoundActivity.class);

                    if(this.game.getRounds().size() == 6 && !game.getIdWinner().equals("null")) {
                        // Game finito, mostro ultimo round
                        i.putExtra("roundIndex", this.game.getRounds().size() - 1);
                    }
                    else {
                        i.putExtra("roundIndex", this.game.getRounds().size() - 2);
                    }

                    i.putExtra("game", game);
                    startActivityForResult(i, SHOW_RECAP_ROUND_CODE);
                }
                break;
            case SHOW_RECAP_ROUND_CODE:
                refreshLayout();
                refreshGame();
                break;
            case REPORT_ANSWER_REQ_CODE:
                refreshGame();
                break;
        }
    }

    private void playButton() {
        if(game.getFrozen()) {
            return;
        }

        if(video) {
            Intent videoIntent = new Intent(GameActivity.this, ActivityVideo.class);
            videoIntent.putExtra("game", game);
            startActivityForResult(videoIntent, VIDEO_REQ_CODE);
        }
        else if(answer) {
            Intent answerIntent = new Intent(GameActivity.this, OpinionInfoActivity.class);
            answerIntent.putExtra("game", game);
            startActivityForResult(answerIntent, ANSWER_REQ_CODE);
        }
    }

    private void refreshLayout() {
        // abilito tutto
        enableButtonGioca();
        surrenderButton.setVisibility(View.VISIBLE);
        reportButton.setVisibility(View.VISIBLE);

        // setto i nickname
        nicknamePlayer1.setText(Utils.getNickname(GameActivity.this));
        if(game.getPlayer2() == null) {
            nicknamePlayer2.setText(getString(R.string.avversario_casuale));

        }
        else {
            nicknamePlayer2.setText(game.getOtherPlayerNickname(Utils.getId(GameActivity.this)));
        }

        // controllo se disabilitare qualche pulsante
        // Disabilito surrend e report se non c'è il player2
        if(game.getPlayer2() == null) {
            // disabilito pulsante surrend e report se non c'è il player 2
            surrenderButton.setVisibility(View.INVISIBLE);
            reportButton.setVisibility(View.INVISIBLE);
        }

        // disabilito surrend se il gioco è terminato
        if(game.getFinished()) {
            // disabilito pulsante surrend e report se non c'è il player 2
            surrenderButton.setVisibility(View.INVISIBLE);
        }


        int punteggio_p1 = 0, punteggio_p2 = 0;

        // reset layout
        for(int i = 0; i < 3; i++) {
            String p_bar = "p_bar_" + (i+1);
            int id_pbar = getResources().getIdentifier(p_bar, "id", getPackageName());
            ProgressBar progressBar = findViewById(id_pbar);
            progressBar.setProgressDrawable(getDrawable(R.drawable.h_prog_bar_default));

            String info = "text_r_" + (i+1);
            int id_info = getResources().getIdentifier(info, "id", getPackageName());
            TextView infoTV = findViewById(id_info);
            infoTV.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            infoTV.setText("...");

            String p1 = "r_" + (i+1) + "_punteggio_1";
            int id_p1 = getResources().getIdentifier(p1, "id", getPackageName());
            TextView p1TV = findViewById(id_p1);
            p1TV.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            p1TV.setText("");

            String p2 = "r_" + (i+1) + "_punteggio_2";
            int id_p2 = getResources().getIdentifier(p2, "id", getPackageName());
            TextView p2TV = findViewById(id_p2);
            p2TV.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            p2TV.setText("");
        }

        // disabilito pulsante
        disableButtonGioca();

        video = answer = false;

        int j = (int)Math.ceil(game.getTurnNumber()/2.0);
        for(int i = 0; i < (int)Math.ceil(Double.valueOf(game.getRounds().size())/2.0) && i < 3; i++) {
            // l'indice i indica il ROUND (non round DB)
            j = 2*i;
            boolean completedRound = (j + 1 + 1) < game.getRounds().size() || (!game.getIdWinner().equals("null") && game.getRounds().size() == 6);

            String p_bar = "p_bar_" + (i+1);

            int id_p1 = getResources().getIdentifier(p_bar, "id", getPackageName());

            ProgressBar progressBar = findViewById(id_p1);

            if(completedRound) {
                // Il round è completo
                int subPunteggioP1 = 0, subPunteggioP2 = 0;

                Round subround1 = game.getRound(j);
                Round subround2 = game.getRound(j+1);

                if(game.isMyVideo(Utils.getId(GameActivity.this), j + 1)) {
                    // La prima domanda e' mia, la seconda sua

                    if(subround1.correctPrediction()) {
                        // la predizione e' corretta. Punto a me
                        subPunteggioP1++;
                    }
                    else {
                        subPunteggioP2++;
                    }

                    if(subround2.correctPrediction()) {
                        // la predizione e' corretta. Punto a me
                        subPunteggioP2++;
                    }
                    else {
                        subPunteggioP1++;
                    }
                }
                else {
                    // La prima domanda e' sua, la seconda mia

                    if(subround1.correctPrediction()) {
                        // la predizione e' corretta. Punto a lui
                        subPunteggioP2++;
                    }
                    else {
                        subPunteggioP1++;
                    }

                    if(subround2.correctPrediction()) {
                        // la predizione e' corretta. Punto a lui
                        subPunteggioP1++;
                    }
                    else {
                        subPunteggioP2++;
                    }
                }

                String stringTextViewId = "text_r_" + (i+1);
                int idTextView = getResources().getIdentifier(stringTextViewId, "id", getPackageName());
                TextView textView = findViewById(idTextView);
                textView.setText("-");
                textView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
                textView.setTextSize(40);

                String stringTextViewIdP1 = "r_" + (i+1) + "_punteggio_1";
                int idTextViewP1 = getResources().getIdentifier(stringTextViewIdP1, "id", getPackageName());
                TextView textViewP1 = findViewById(idTextViewP1);

                textViewP1.setText(String.valueOf(subPunteggioP1));

                String stringTextViewIdP2 = "r_" + (i+1) + "_punteggio_2";
                int idTextViewP2 = getResources().getIdentifier(stringTextViewIdP2, "id", getPackageName());
                TextView textViewP2 = findViewById(idTextViewP2);

                textViewP2.setText(String.valueOf(subPunteggioP2));

                punteggio_p1 += subPunteggioP1;
                punteggio_p2 += subPunteggioP2;

                int progress = (int)Math.floor(new Double(subPunteggioP1)/(new Double(subPunteggioP1) + new Double(subPunteggioP2))*100.0);
                Drawable drawable = getDrawable(R.drawable.h_prog_bar_win);

                if(subPunteggioP1 == subPunteggioP2) {
                    drawable = getDrawable(R.drawable.h_prog_bar_draw);
                }
                else if(subPunteggioP1 < subPunteggioP2) {
                    drawable = getDrawable(R.drawable.h_prog_bar_lose);
                }

                final int finalJ = j;
                progressBar.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        launchInfoRound(finalJ, finalJ + 1);
                    }
                });

                progressBar.setProgressDrawable(drawable);
                progressBar.setProgress(progress);
            }
            else {
                // Il round non è completato!
                String stringTextViewId = "text_r_" + (i+1);
                int idTextView = getResources().getIdentifier(stringTextViewId, "id", getPackageName());
                TextView textView = findViewById(idTextView);

                String stringTextViewIdP1 = "r_" + (i+1) + "_punteggio_1";
                int idTextViewP1 = getResources().getIdentifier(stringTextViewIdP1, "id", getPackageName());
                TextView textViewP1 = findViewById(idTextViewP1);
                textViewP1.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
                textViewP1.setText("");

                String stringTextViewIdP2 = "r_" + (i+1) + "_punteggio_2";
                int idTextViewP2 = getResources().getIdentifier(stringTextViewIdP2, "id", getPackageName());
                TextView textViewP2 = findViewById(idTextViewP2);
                textViewP2.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
                textViewP2.setText("");

                boolean hasSecondSubRound = (j + 1) < game.getRounds().size();

                int index = j;

                if(hasSecondSubRound) {
                    index = j+1;

                    Round subround1 = game.getRound(j);

                    int subPunteggioP1 = 0, subPunteggioP2 = 0;

                    if(game.isMyVideo(Utils.getId(GameActivity.this), j + 1)) {
                        // La prima domanda e' mia, la seconda sua

                        if(subround1.correctPrediction()) {
                            // la predizione e' corretta. Punto a me
                            subPunteggioP1++;
                        }
                        else {
                            subPunteggioP2++;
                        }
                    }
                    else {
                        // La prima domanda e' sua, la seconda mia

                        if(subround1.correctPrediction()) {
                            // la predizione e' corretta. Punto a lui
                            subPunteggioP2++;
                        }
                        else {
                            subPunteggioP1++;
                        }
                    }

                    punteggio_p1 += subPunteggioP1;
                    punteggio_p2 += subPunteggioP2;
                }

                if(this.game.getSurrendered() || this.game.getTurnNumber() == -1) {
                    // Il game è terminato
                }
                else {
                    // Non è terminato
                    Round round = game.getRound(index);

                    if(game.isMyTurn(Utils.getId(GameActivity.this))) {
                        enableButtonGioca();
                        progressBar.setProgressDrawable(getDrawable(R.drawable.h_prog_bar_your_turn));
                    }
                    else {
                        progressBar.setProgressDrawable(getDrawable(R.drawable.h_prog_bar_waiting));
                    }

                    progressBar.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            playButton();
                        }
                    });

                    if(round.getVideoId() == null) {
                        if(game.isMyVideo(Utils.getId(GameActivity.this), index)) {
                            // Il video e' tuo, devo fare video
                            video = true;

                            enableButtonGioca();

                            textView.setText(getString(R.string.turno_video));
                        }
                        else {
                            // Domanda sua, attendo
                            textView.setText(getString(R.string.attendi_video));
                        }
                    }
                    else if(round.getAnswer() == null) {
                        if(game.isMyVideo(Utils.getId(GameActivity.this), index)) {
                            // Video mio, quindi devo attendere la risposta
                            textView.setText(getString(R.string.attendi_opinion));
                        }
                        else {
                            // Devo fare la risposta
                            answer = true;
                            enableButtonGioca();
                            textView.setText(getString(R.string.turno_opinion));
                        }
                    }
                }
            }
        }

        Pair<Integer, Integer> punteggioGame = game.getPunteggio(Utils.getId(GameActivity.this));

        punteggioP1.setText(String.valueOf(punteggioGame.first));
        punteggioP2.setText(String.valueOf(punteggioGame.second));

        if(this.game.getSurrendered() || this.game.getTurnNumber() == -1) {
            disableButtonGioca();

            surrenderButton.setVisibility(View.INVISIBLE);

            TextView titleActivity = findViewById(R.id.titleActivity);

            Pair<Integer, Integer> punteggio = game.getPunteggio(Utils.getId(this));

            if(game.getFrozen()) {
                titleActivity.setText(getString(R.string.in_revisione));
            }
            else if(game.getSurrendered() && game.getIdWinner().equals(Utils.getId(this))) {
                titleActivity.setText(getString(R.string.title_vinto));
            }
            else if(game.getSurrendered() && !game.getIdWinner().equals(Utils.getId(this))) {
                titleActivity.setText(getString(R.string.title_perso));
            }
            else if(punteggio.first < punteggio.second) {
                titleActivity.setText(getString(R.string.title_perso));
            }
            else if(punteggio.first > punteggio.second) {
                titleActivity.setText(getString(R.string.title_vinto));
            }
            else {
                // Pareggio
                titleActivity.setText(getString(R.string.title_pareggio));
            }
        }

        // controllo se il gioco è terminato o se qualcuno si è arreso
        if((this.game.getSurrendered() || this.game.getTurnNumber() == -1) && !this.game.getFrozen() && !DataUtility.gameVisti.contains(game.getId())) {
            FinePartitaDialog finePartitaDialog = new FinePartitaDialog(this, game);
            finePartitaDialog.show();

            removeButtonGioca();

            DataUtility.gameVisti.add(game.getId());
        }

        if((this.game.getSurrendered() || this.game.getTurnNumber() == -1)) {
            removeButtonGioca();
        }

        if(this.game.getFrozen()) {
            // gioco in attesa di revisione
            disableButtonGioca();

            surrenderButton.setVisibility(View.INVISIBLE);
        }
    }

    private void launchInfoRound(int j, int x) {
        if(game.getFrozen()) {
            return;
        }

        Intent i = new Intent(GameActivity.this, RecapRoundActivity.class);
        i.putExtra("round1", j);
        i.putExtra("round2", x);
        i.putExtra("game", game);
        startActivity(i);
    }

    private void enableButtonGioca() {
        disabledButtonGioca.setVisibility(View.GONE);
        buttonGioca.setVisibility(View.VISIBLE);
    }

    private void disableButtonGioca() {
        buttonGioca.setVisibility(View.GONE);
        disabledButtonGioca.setVisibility(View.VISIBLE);
    }

    private void removeButtonGioca() {
        buttonGioca.setVisibility(View.GONE);
        disabledButtonGioca.setVisibility(View.GONE);
    }

    @Override
    protected void onResume() {
        super.onResume();

        socketEvents();
    }

    @Override
    protected void onPause() {
        super.onPause();

        SocketUtility.getSocket().off("update_game_" + this.game.getId());
        SocketUtility.getSocket().off("deleted_game_" + this.game.getId());
    }

    private void socketEvents() {
        SocketUtility.getSocket().off("update_game_" + this.game.getId());
        SocketUtility.getSocket().off("deleted_game_" + this.game.getId());

        SocketUtility.getSocket().on("update_game_" + this.game.getId(), new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        refreshGame();
                    }
                });
            }
        });

        SocketUtility.getSocket().on("deleted_game_" + this.game.getId(), new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        InfoDialog infoDialog = new InfoDialog(GameActivity.this, getString(R.string.attenzione), getString(R.string.cancellazione_game), getString(R.string.ok));
                        infoDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
                            @Override
                            public void onDismiss(DialogInterface dialogInterface) {
                                finish();
                            }
                        });

                        infoDialog.show();
                    }
                });
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}