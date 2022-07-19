package com.dametto.poloni.liedetectorv2.utility.Adapters;

import android.content.Context;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import java.util.List;

import okhttp3.internal.Util;

public class GameListAdapter extends ArrayAdapter<Game> {

    public GameListAdapter(Context context, int textViewResourceId,
                           List<Game> objects) {
        super(context, textViewResourceId, objects);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        Game g = getItem(position);

        if(g.getFrozen() != null && g.getFrozen()) {
            String myNickname = Utils.getNickname(getContext());
            String myId = Utils.getId(getContext());

            convertView = inflater.inflate(R.layout.game_item, null);

            LinearLayout container = convertView.findViewById(R.id.container);
            LinearLayout container2 = convertView.findViewById(R.id.container2);

            TextView name = (TextView)convertView.findViewById(R.id.nameLabel);
            TextView status = (TextView)convertView.findViewById(R.id.statusLabel);
            TextView punteggioTextView = (TextView)convertView.findViewById(R.id.punteggio);

            if(myNickname.equals(g.getPlayer1().getNickname())) {
                if(g.getPlayer2() == null) {
                    name.setText(R.string.avversario_casuale);
                }
                else name.setText(g.getPlayer2().getNickname());
            }
            else name.setText(g.getPlayer1().getNickname());

            Pair<Integer, Integer> punteggio = g.getPunteggio(Utils.getId(this.getContext()));
            punteggioTextView.setText(punteggio.first + " - " + punteggio.second);

            status.setText(getContext().getString(R.string.attesa_revisione));
            container.setBackgroundColor(getContext().getColor(R.color.gameWaiting));
            container2.setBackgroundColor(getContext().getColor(R.color.gameWaiting));

            return convertView;
        }
        else if(g.getSurrendered() || g.getTurnNumber() == -1) {
            String myNickname = Utils.getNickname(getContext());
            String myId = Utils.getId(getContext());

            convertView = inflater.inflate(R.layout.finished_game_item, null);

            LinearLayout container = convertView.findViewById(R.id.container);

            TextView nicknameP1 = convertView.findViewById(R.id.nicknamePlayer1_g);
            TextView nicknameP2 = convertView.findViewById(R.id.nicknamePlayer2_g);
            TextView punteggioPlayer1 = convertView.findViewById(R.id.punteggioPlayer1_g);
            TextView punteggioPlayer2 = convertView.findViewById(R.id.punteggioPlayer2_g);
            TextView statoPartita = convertView.findViewById(R.id.statoPartita_g);

            nicknameP1.setText(myNickname);
            nicknameP2.setText(g.getOtherPlayerNickname(myId));

            Pair<Integer, Integer> punteggio = g.getPunteggio(Utils.getId(getContext()));
            punteggioPlayer1.setText(String.valueOf(punteggio.first));
            punteggioPlayer2.setText(String.valueOf(punteggio.second));

            if(g.getSurrendered() && g.getIdWinner().equals(Utils.getId(getContext()))) {
                statoPartita.setText(getContext().getString(R.string.title_vinto));
                container.setBackgroundColor(getContext().getColor(R.color.green));
            }
            else if(g.getSurrendered() && !g.getIdWinner().equals(Utils.getId(getContext()))) {
                statoPartita.setText(getContext().getString(R.string.title_perso));
                container.setBackgroundColor(getContext().getColor(R.color.red));
            }
            else if(punteggio.first < punteggio.second) {
                statoPartita.setText(getContext().getString(R.string.title_perso));
                container.setBackgroundColor(getContext().getColor(R.color.red));
            }
            else if(punteggio.first > punteggio.second) {
                statoPartita.setText(getContext().getString(R.string.title_vinto));
                container.setBackgroundColor(getContext().getColor(R.color.green));
            }
            else {
                // Pareggio
                statoPartita.setText(getContext().getString(R.string.title_pareggio));
                container.setBackgroundColor(getContext().getColor(R.color.colorPrimary));
            }

            return convertView;
        }
        else {
            String myNickname = Utils.getNickname(getContext());
            String myId = Utils.getId(getContext());

            convertView = inflater.inflate(R.layout.game_item, null);

            LinearLayout container = convertView.findViewById(R.id.container);
            LinearLayout container2 = convertView.findViewById(R.id.container2);

            TextView name = (TextView)convertView.findViewById(R.id.nameLabel);
            TextView status = (TextView)convertView.findViewById(R.id.statusLabel);
            TextView punteggioTextView = (TextView)convertView.findViewById(R.id.punteggio);

            Pair<Integer, Integer> punteggio = g.getPunteggio(Utils.getId(this.getContext()));
            punteggioTextView.setText(punteggio.first + " - " + punteggio.second);

            if(g.isMyTurn(myId)) {
                container.setBackgroundColor(getContext().getColor(R.color.gameTurn));
                container2.setBackgroundColor(getContext().getColor(R.color.gameTurn));
            }
            else {
                container.setBackgroundColor(getContext().getColor(R.color.gameWaiting));
                container2.setBackgroundColor(getContext().getColor(R.color.gameWaiting));
            }

            //container.getBackground().setAlpha(180);

            if(myNickname.equals(g.getPlayer1().getNickname())) {
                if(g.getPlayer2() == null) {
                    name.setText(R.string.avversario_casuale);
                }
                else name.setText(g.getPlayer2().getNickname());
            }
            else name.setText(g.getPlayer1().getNickname());

            boolean completed = g.getFinished();
            boolean your_turn = false;

            if(g.getLastRound() == null) {
                your_turn = true;
            }
            else {
                if(!completed) {
                    if(g.isMyVideo(Utils.getId(getContext()))) {
                        // E' la mia domanda

                        Round r = g.getLastRound();

                        if(!r.isVideoSent()) {
                            // Devo fare il video
                            your_turn = true;
                        }
                        else if(r.getAnswer() == null) {
                            // Attendo la sua risposta
                            your_turn = false;
                        }
                    }
                    else {
                        // E' la sua domanda
                        Round r = g.getLastRound();

                        if(!r.isVideoSent()) {
                            // Attendo, deve ancora fare la domanda
                            your_turn = false;
                        }
                        else if(r.getAnswer() == null) {
                            // Devo dare la risposta
                            your_turn = true;
                        }
                    }
                }
            }

            if(!completed) {
                if(your_turn) {
                    status.setText(R.string.turn_label);
                }
                else {
                    status.setText(R.string.waiting_label);
                }
            }

            return convertView;
        }


    }
}