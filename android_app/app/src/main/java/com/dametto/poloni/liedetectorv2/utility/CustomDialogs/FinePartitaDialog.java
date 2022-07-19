package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.util.Pair;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Utils;

public class FinePartitaDialog extends Dialog {
    private Activity activity;
    private Dialog dialog;
    private Button ok;

    private Game game;

    public FinePartitaDialog(Activity activity, Game game) {
        super(activity);
        this.activity = activity;

        this.game = game;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.fine_partita);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);

        ok = findViewById(R.id.buttonOk);

        ok.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });

        TextView nicknameP1 = findViewById(R.id.nicknamePlayer1_m);
        TextView nicknameP2 = findViewById(R.id.nicknamePlayer2_m);
        TextView punteggioPlayer1 = findViewById(R.id.punteggioPlayer1_m);
        TextView punteggioPlayer2 = findViewById(R.id.punteggioPlayer2_m);
        TextView title = findViewById(R.id.title_m);

        nicknameP1.setText(Utils.getNickname(getContext()));
        nicknameP2.setText(game.getOtherPlayerNickname(Utils.getId(getContext())));

        Pair<Integer, Integer> punteggio = game.getPunteggio(Utils.getId(getContext()));
        punteggioPlayer1.setText(String.valueOf(punteggio.first));
        punteggioPlayer2.setText(String.valueOf(punteggio.second));

        if(game.getSurrendered() && game.getIdWinner().equals(Utils.getId(getContext()))) {
            title.setText(activity.getString(R.string.title_arreso_vinto));
        }
        else if(game.getSurrendered() && !game.getIdWinner().equals(Utils.getId(getContext()))) {
            title.setText(activity.getString(R.string.title_arreso_perso));
        }
        else if(punteggio.first < punteggio.second) {
            title.setText(activity.getString(R.string.title_perso));
        }
        else if(punteggio.first > punteggio.second) {
            title.setText(activity.getString(R.string.title_vinto));
        }
        else {
            // Pareggio
            title.setText(activity.getString(R.string.title_pareggio));
        }
    }

    @Override
    public void onBackPressed() {
        // nothing
    }
}
