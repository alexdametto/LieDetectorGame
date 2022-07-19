package com.dametto.poloni.liedetectorv2.utility.CustomDialogs;

import android.app.Activity;
import android.app.Dialog;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.dametto.poloni.liedetectorv2.ActivityVideo;
import com.dametto.poloni.liedetectorv2.R;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DataSpec;
import com.google.android.exoplayer2.upstream.FileDataSource;

import java.io.File;

public class VideoDialog extends Dialog {
    private Activity activity;
    private Dialog dialog;
    private LinearLayout verita, bugia;
    private Button riregistra;
    private PlayerView videoView;
    private File video;
    private int registrazioniRimanenti;
    private int resultCode = -1;
    private SimpleExoPlayer exoPlayer;

    public final static int VERITA_CODE = 1, BUGIA_CODE = 2, RIREGISTRA_CODE = 3, DONT_SEND = 4;

    public VideoDialog(Activity activity, File file, int registrazioniRimanenti) {
        super(activity);
        this.activity = activity;
        this.video = file;

        this.registrazioniRimanenti = registrazioniRimanenti;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.video_dialog);

        setCanceledOnTouchOutside(false);

        Window window = this.getWindow();
        window.setLayout(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);

        videoView = findViewById(R.id.videoViewDialog);

        exoPlayer = ExoPlayerFactory.newSimpleInstance(activity, new DefaultTrackSelector());

        DataSpec dataSpec = new DataSpec(Uri.fromFile(video));
        final FileDataSource fileDataSource = new FileDataSource();
        try {
            fileDataSource.open(dataSpec);
        } catch (FileDataSource.FileDataSourceException e) {
            e.printStackTrace();
        }

        DataSource.Factory factory = new DataSource.Factory() {
            @Override
            public DataSource createDataSource() {
                return fileDataSource;
            }
        };
        MediaSource audioSource = new ExtractorMediaSource(fileDataSource.getUri(),
                factory, new DefaultExtractorsFactory(), null, null);

        exoPlayer.prepare(audioSource);

        videoView.setPlayer(exoPlayer);

        verita = findViewById(R.id.veritaButton);
        bugia = findViewById(R.id.bugiaButton);
        riregistra = findViewById(R.id.riregistraButton);

        verita.setClickable(true);
        bugia.setClickable(true);

        verita.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                resultCode = VERITA_CODE;

                dismiss();
            }
        });

        bugia.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                resultCode = BUGIA_CODE;

                dismiss();
            }
        });

        riregistra.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(registrazioniRimanenti == 0) {
                    final InfoDialogYesNo infoDialogYesNo = new InfoDialogYesNo(activity, activity.getString(R.string.titolo_invia_video_tentativo), activity.getString(R.string.descrizione_invia_video_tentativo));
                    infoDialogYesNo.setYesOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            infoDialogYesNo.dismiss();
                        }
                    });

                    infoDialogYesNo.setNoOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            infoDialogYesNo.dismiss();

                            resultCode = DONT_SEND;

                            dismiss();
                        }
                    });

                    infoDialogYesNo.show();
                }
                else {
                    resultCode = RIREGISTRA_CODE;

                    dismiss();
                }
            }
        });

        TextView countTextView = findViewById(R.id.tentativiCounter);
        countTextView.setText(activity.getText(R.string.count_tentativi).toString().replace("[[COUNT]]", registrazioniRimanenti + ""));
    }

    @Override
    public void onBackPressed() {
        // nothing
    }

    public int getResultCode() {
        return resultCode;
    }

    @Override
    protected void onStop() {
        videoView.setPlayer(null);
        exoPlayer.release();
        exoPlayer=null;
        super.onStop();
    }
}
