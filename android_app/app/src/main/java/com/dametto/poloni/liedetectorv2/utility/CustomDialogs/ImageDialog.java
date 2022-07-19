package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.MediaController;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.ActivityVideo;
import com.dametto.poloni.liedetectorv2.CameraActivity;
import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.util.Util;

import java.util.HashMap;
import java.util.Map;

import dmax.dialog.SpotsDialog;

public class ImageDialog extends Dialog {
    private Activity activity;
    private Bitmap image;
    private ImageView imageView;

    public ImageDialog(Activity activity, Bitmap image) {
        super(activity);
        this.activity = activity;
        this.image = image;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.image_dialog);

        setCanceledOnTouchOutside(false);

        imageView = findViewById(R.id.imageView);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);

        ImageButton closeButton = findViewById(R.id.chiudiButton);
        closeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });

        showImage(image);
    }

    @Override
    public void onBackPressed() {
        // nothing
    }

    private void showImage(Bitmap image) {
        imageView.setImageBitmap(image);
    }


}
