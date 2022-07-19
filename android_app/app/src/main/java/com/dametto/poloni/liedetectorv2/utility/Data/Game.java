package com.dametto.poloni.liedetectorv2.utility.Data;

import android.content.Context;
import android.util.Pair;

import com.dametto.poloni.liedetectorv2.utility.Utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

public class Game implements Serializable, Comparable<Game> {
    private String id, idWinner;
    private Player player1, player2;
    private Boolean surrendered, finished, frozen;
    private List<Round> rounds;
    private Integer turnNumber;
    private Date createdAt;
    private Date updatedAt;

    private String myId;

    public Game(JSONObject obj, Context ctx) throws Exception {
        this.myId = Utils.getId(ctx);

        this.id = obj.getString("id");
        this.player1 = new Player(obj.getJSONObject("idPlayer1"));
        this.player2 = obj.isNull("idPlayer2") ? null : new Player(obj.getJSONObject("idPlayer2"));
        this.surrendered = obj.getBoolean("surrendered");
        this.idWinner = obj.getString("idWinner");
        this.turnNumber = obj.getInt("turnNumber");
        this.frozen = obj.getBoolean("frozen");
        SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        this.createdAt = inputFormat.parse(obj.getString("createdAt"));
        this.updatedAt = inputFormat.parse(obj.getString("createdAt"));

        this.rounds = new LinkedList<>();
        JSONArray roundsIds = obj.getJSONArray("rounds");
        for (int i = 0; i < roundsIds.length(); i++) {
            JSONObject round = roundsIds.getJSONObject(i);
            rounds.add(new Round(round));
        }

        this.finished = false;
        if(turnNumber == -1 || getSurrendered()) {
            this.finished = true;
        }
    }

    @Override
    public int compareTo(Game o) {
        if(o.getFinished() && this.getFinished()) {
            // entrambi finiti
            // più piccolo è quello con updateAt più grande
            if(updatedAt.after(o.updatedAt)) {
                return -1;
            }
            else return 1;
        }
        if(this.getFinished() && !o.getFinished()) {
            // this è finito mentre o no, vuol dire che this è più grande
            return 1;
        }
        if(!this.getFinished() && o.getFinished()) {
            // o è finito, mentre this no. Quindi o è più grande
            return -1;
        }

        if(this.isMyTurn(myId) && o.isMyTurn(myId)) {
            // è il mio turno su entrambi
            // più piccolo è quello con updateAt più grande
            if(updatedAt.after(o.updatedAt)) {
                return -1;
            }
            else return 1;
        }
        if(this.isMyTurn(myId) && !o.isMyTurn(myId)) {
            // su this è il mio turno
            // su o no
            // quindi è più grande o
            return -1;
        }

        if(!this.isMyTurn(myId) && o.isMyTurn(myId)) {
            // su o è il mio turno
            // su this no
            // quindi è più grande this
            return 1;
        }

        // caso in cui non è mio turno in entrambi
        // più piccolo è quello con updateAt più grande
        if(updatedAt.after(o.updatedAt)) {
            return -1;
        }
        else return 1;
    }

    public static ArrayList<Game> parseGames(JSONArray json_games, Context ctx) {
        ArrayList<Game> games = new ArrayList<>();

        for(int i = 0; i < json_games.length(); i++) {
            try {
                games.add(new Game(json_games.getJSONObject(i), ctx));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return games;
    }

    public String getId() {
        return id;
    }

    public String getIdWinner() {
        return idWinner;
    }

    public Player getPlayer1() {
        return player1;
    }

    public Player getPlayer2() {
        return player2;
    }

    public Boolean getSurrendered() {
        return surrendered;
    }

    public Boolean getFrozen() {
        return frozen;
    }

    public List<Round> getRounds() {
        return rounds;
    }

    public Round getRound(int n) {
        return rounds.get(n);
    }

    public Integer getTurnNumber() {
        return this.turnNumber;
    }

    public Player getOtherPlayer(String myId) {
        if(player2 == null) {
            return null;
        }
        else {
            return (player1.getId().equals(myId)) ? player2 : player1;
        }
    }

    public String getOtherPlayerNickname(String myId) {
        if(player2 == null) {
            return "...";
        }
        return (player1.getId().equals(myId)) ? player2.getNickname() : player1.getNickname();
    }

    public Pair<Integer, Integer> getPunteggio(String myId) {
        int punteggio_p1 = 0, punteggio_p2 = 0;

        // Qua skippo sempre ultimo round
        // Con partita finita, ultimo round viene controllato dopo
        for(int i = 0; i < getRounds().size() - 1; i++) {
            Round round = getRound(i);

            if(isMyVideo(myId, i)) {
                // Round MIO
                if(round.getTruth() == round.getAnswer()) {
                    // avversario ha indovinato
                    punteggio_p2++;
                }
                else {
                    // Avversario NON ha indovinato
                    punteggio_p1++;
                }
            }
            else {
                // Round SUO
                if(round.getTruth() == round.getAnswer()) {
                    // ho indovinato
                    punteggio_p1++;
                }
                else {
                    // NON ho indovinato
                    punteggio_p2++;
                }
            }
        }

        // Check for last round
        if(getRounds().size() == 6 && !getIdWinner().equals("null")) {
            // Abbiamo tutti i round e la partita è finita
            int i = getRounds().size() - 1;
            Round round = getRound(i);
            if(isMyVideo(myId, i)) {
                // Round MIO
                if(round.getTruth() == round.getAnswer()) {
                    // avversario ha indovinato
                    punteggio_p2++;
                }
                else {
                    // Avversario NON ha indovinato
                    punteggio_p1++;
                }
            }
            else {
                // Round SUO
                if(round.getTruth() == round.getAnswer()) {
                    // ho indovinato
                    punteggio_p1++;
                }
                else {
                    // NON ho indovinato
                    punteggio_p2++;
                }
            }
        }

        /*int j = (int)Math.ceil(getTurnNumber()/2.0);
        for(int i = 0; i < (int)Math.ceil(Double.valueOf(getRounds().size())/2.0) && i < 3; i++) {
            // l'indice i indica il ROUND
            j = 2*i;
            boolean completedRound = (j + 1 + 1) < getRounds().size() || (!getIdWinner().equals("null") && getRounds().size() == 6);

            if(completedRound) {
                // Il round è completo
                int subPunteggioP1 = 0, subPunteggioP2 = 0;

                Round subround1 = getRound(j);
                Round subround2 = getRound(j+1);

                if(isMyVideo(myId, j + 1)) {
                    // La prima domanda e' mia, la seconda sua

                    if(subround1.getAnswer() == subround1.getTruth()) {
                        // la predizione e' corretta. Punto a me
                        subPunteggioP1++;
                    }
                    else {
                        subPunteggioP2++;
                    }

                    if(subround2.getAnswer() == subround2.getTruth()) {
                        // la predizione e' corretta. Punto a me
                        subPunteggioP2++;
                    }
                    else {
                        subPunteggioP1++;
                    }
                }
                else {
                    // La prima domanda e' sua, la seconda mia

                    if(subround1.getAnswer() == subround1.getTruth()) {
                        // la predizione e' corretta. Punto a lui
                        subPunteggioP2++;
                    }
                    else {
                        subPunteggioP1++;
                    }

                    if(subround2.getAnswer() == subround2.getTruth()) {
                        // la predizione e' corretta. Punto a lui
                        subPunteggioP1++;
                    }
                    else {
                        subPunteggioP2++;
                    }
                }

                punteggio_p1 += subPunteggioP1;
                punteggio_p2 += subPunteggioP2;
            }
        }*/

        Pair<Integer, Integer> punteggio = new Pair<>(punteggio_p1, punteggio_p2);

        return punteggio;
    }

    public boolean isMyVideo(String id) {
        if(player2 == null && turnNumber == 0) {
            return true;
        }
        else if(player2 == null && turnNumber > 0) {
            return false;
        }
        return (id.equals(player1.getId()) && turnNumber % 2 == 0) || (id.equals(player2.getId()) && turnNumber % 2 == 1);
    }

    public boolean isMyVideo(String id, int questionIndex) {
        if(player2 == null && turnNumber == 0) {
            return true;
        }
        else if(player2 == null && turnNumber > 0) {
            return false;
        }
        return (id.equals(player1.getId()) && questionIndex % 2 == 0) || (id.equals(player2.getId()) && questionIndex % 2 == 1);
    }

    public Round getLastRound() {
        if(rounds.size() == 0) {
            return null;
        }
        return rounds.get(rounds.size()-1);
    }

    public boolean isMyTurn(String id) {
        Round lastRound = this.getLastRound();
        if(lastRound == null) {
            return id.equals(this.getPlayer1().getId());
        }
        if(isMyVideo(id)) {
            // mio video
            if(!lastRound.isVideoSent()) {
                // mio turno
                return true;
            }
            else {
                // turno dell'altro
                return false;
            }
        }
        else {
            // video avversario
            if(!lastRound.isVideoSent()) {
                // turno suo
                return false;
            }
            else if(!lastRound.isAnswerGiven()) {
                // mio turno
                return true;
            }
            else {
                // suo turno
                return false;
            }
        }
    }

    public Boolean getFinished() {
        return finished;
    }

    public boolean imPlayer1(String id) {
        return player1.getId().equals(id);
    }
}
