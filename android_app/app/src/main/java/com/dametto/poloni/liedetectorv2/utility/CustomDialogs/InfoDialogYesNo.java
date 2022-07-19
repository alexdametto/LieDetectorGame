package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.Dialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.content.res.ResourcesCompat;

import com.dametto.poloni.liedetectorv2.R;

public class InfoDialogYesNo extends Dialog{
    private Activity activity;
    private Dialog dialog;
    private Button yesButton, noButton;
    private Integer yesButtonColor = null, noButtonColor = null;
    private String yesButtonText = null, noButtonText = null;

    private String title, content;

    private View.OnClickListener yesOnClickListener, noOnClickListener;

    private boolean isError = false;

    public InfoDialogYesNo(Activity activity, String title, String content) {
        super(activity);
        this.activity = activity;
        this.title = title;
        this.content = content;
    }

    public void setYesOnClickListener(View.OnClickListener listener) {
        yesOnClickListener = listener;
    }

    public void setNoOnClickListener(View.OnClickListener listener) {
        noOnClickListener = listener;
    }

    public void setYesButtonColor(int color) {
        yesButtonColor = color;
    }

    public void setNoButtonColor(int color) {
        noButtonColor = color;
    }

    public void setYesButtonText(String text) {
        yesButtonText = text;
    }

    public void setNoButtonText(String text) {
        noButtonText = text;
    }

    public void setError(boolean error) {
        this.isError = error;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.info_dialog_yes_no);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);

        yesButton = findViewById(R.id.yesButton);
        noButton = findViewById(R.id.noButton);
        yesButton.setTypeface(ResourcesCompat.getFont(activity, R.font.aldrich));
        noButton.setTypeface(ResourcesCompat.getFont(activity, R.font.aldrich));

        if(yesButtonText != null) {
            yesButton.setText(yesButtonText);
        }
        if(noButtonText != null) {
            noButton.setText(noButtonText);
        }
        if(yesButtonColor != null) {
            yesButton.setBackgroundColor(yesButtonColor);
        }
        if(noButtonColor != null) {
            noButton.setBackgroundColor(noButtonColor);
        }

        yesButton.setOnClickListener(yesOnClickListener);
        noButton.setOnClickListener(noOnClickListener);

        TextView titleTextView = findViewById(R.id.title);
        TextView contentTextView = findViewById(R.id.content);

        if(isError) {
            titleTextView.setTextColor(getContext().getColor(R.color.red));
        }

        titleTextView.setText(title);
        contentTextView.setText(content);
    }

    @Override
    public void onBackPressed() {
        // nothing
    }
}