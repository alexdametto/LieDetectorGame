package com.dametto.poloni.liedetectorv2;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;

import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Utils;

public class OpinionInfoActivity extends AppCompatActivity {

    Game game;
    TextView nickname;
    Button buttonAnswer;
    CheckBox checkBox;

    private final static int OPINION_REQ_CODE = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_opinion_info);

        this.game = (Game)getIntent().getSerializableExtra("game");

        nickname = findViewById(R.id.playerNickname);
        buttonAnswer = findViewById(R.id.buttonAnswer);
        checkBox = findViewById(R.id.skipCheckbox);

        Button infoButton = findViewById(R.id.infoButton);
        infoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openInfo();
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

        // Update nickname
        nickname.setText(game.getOtherPlayerNickname(Utils.getId(this)));

        buttonAnswer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(checkBox.isChecked()) {
                    savePreference();
                }

                opinion();
            }
        });

        if(Utils.getSkipDescribeImage(this)) {
            opinion();
        }
    }

    private void opinion() {
        Intent answerIntent = new Intent(OpinionInfoActivity.this, OpinionActivity.class);
        answerIntent.putExtra("game", game);
        startActivityForResult(answerIntent, OPINION_REQ_CODE);
    }

    private void savePreference() {
        Utils.setSkipVideo(this, true);
    }

    private void openInfo() {
        InfoDialog infoDialog = new InfoDialog(this, getString(R.string.titoloInfoOpinion), getString(R.string.contentInfoOpinion), getString(R.string.close_button));

        infoDialog.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode) {
            case OPINION_REQ_CODE:
                if(data!= null && data.getExtras() != null && data.getExtras().get("game") != null) {
                    this.game = (Game)data.getExtras().get("game");

                    Intent dataToReturn = new Intent();
                    dataToReturn.putExtra("game", this.game);

                    setResult(RESULT_OK, dataToReturn);

                    finish();
                }
                break;
        }
    }
}