package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;


import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.dametto.poloni.liedetectorv2.R;

public class InfoDialog  extends Dialog {
    private Activity activity;
    private Dialog dialog;
    private Button ok;

    private String title, content, okButton;

    private boolean isError = false;


    public InfoDialog(Activity activity, String title, String content, String okButton) {
        super(activity);
        this.activity = activity;
        this.title = title;
        this.content = content;
        this.okButton = okButton;
    }

    public void setError(boolean error) {
        this.isError = error;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.info_dialog);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);

        ok = findViewById(R.id.buttonOk);
        ok.setText(this.okButton);

        ok.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });

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
