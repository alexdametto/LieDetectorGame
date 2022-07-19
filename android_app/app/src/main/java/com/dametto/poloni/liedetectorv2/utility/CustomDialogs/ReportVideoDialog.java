package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.core.content.res.ResourcesCompat;

import com.dametto.poloni.liedetectorv2.R;

public class ReportVideoDialog extends Dialog{
    private Activity activity;
    private Dialog dialog;
    private Button yesButton, noButton;
    private Spinner spinnerMotivazione;

    private View.OnClickListener yesOnClickListener, noOnClickListener;

    public ReportVideoDialog(Activity activity, String title, String content) {
        super(activity);
        this.activity = activity;
    }

    public void setConfirmOnClickListener(View.OnClickListener listener) {
        yesOnClickListener = listener;
    }

    public void setCancelOnClickListener(View.OnClickListener listener) {
        noOnClickListener = listener;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.report_video_dialog);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);

        yesButton = findViewById(R.id.yesButton);
        noButton = findViewById(R.id.noButton);
        yesButton.setTypeface(ResourcesCompat.getFont(activity, R.font.aldrich));
        noButton.setTypeface(ResourcesCompat.getFont(activity, R.font.aldrich));

        yesButton.setOnClickListener(yesOnClickListener);
        noButton.setOnClickListener(noOnClickListener);

        String[] spinnerItems = {
                activity.getString(R.string.video_nudo),
                activity.getString(R.string.video_linguaggio),
                activity.getString(R.string.video_cheating),
                activity.getString(R.string.other)
        };

        spinnerMotivazione = findViewById(R.id.spinnerMotivazione);
        ArrayAdapter spinnerAdapter = new ArrayAdapter(activity,android.R.layout.simple_spinner_item, spinnerItems);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerMotivazione.setAdapter(spinnerAdapter);
    }

    public String getReason() {
        return this.spinnerMotivazione.getSelectedItem().toString();
    }

    @Override
    public void onBackPressed() {
        // nothing
    }
}