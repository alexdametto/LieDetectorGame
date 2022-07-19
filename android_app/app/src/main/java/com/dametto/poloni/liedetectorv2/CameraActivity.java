package com.dametto.poloni.liedetectorv2;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.WorkerThread;
import androidx.appcompat.app.AppCompatActivity;

import android.animation.ObjectAnimator;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.dametto.poloni.liedetectorv2.utility.ApiService;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.FinePartitaDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.InfoDialog;
import com.dametto.poloni.liedetectorv2.utility.CustomDialogs.VideoDialog;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.Round;
import com.dametto.poloni.liedetectorv2.utility.DataUtility;
import com.dametto.poloni.liedetectorv2.utility.JWTUtils;
import com.google.android.gms.common.util.IOUtils;
import com.gusakov.library.PulseCountDown;
import com.gusakov.library.java.interfaces.OnCountdownCompleted;
import com.otaliastudios.cameraview.CameraException;
import com.otaliastudios.cameraview.CameraListener;
import com.otaliastudios.cameraview.CameraOptions;
import com.otaliastudios.cameraview.CameraView;
import com.otaliastudios.cameraview.PictureResult;
import com.otaliastudios.cameraview.VideoResult;
import com.otaliastudios.cameraview.controls.Engine;
import com.otaliastudios.cameraview.controls.Facing;
import com.otaliastudios.cameraview.controls.Mode;
import com.otaliastudios.cameraview.controls.VideoCodec;
import com.otaliastudios.cameraview.frame.Frame;
import com.otaliastudios.cameraview.frame.FrameProcessor;
import com.skydoves.balloon.ArrowConstraints;
import com.skydoves.balloon.ArrowOrientation;
import com.skydoves.balloon.Balloon;
import com.skydoves.balloon.BalloonAnimation;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import dmax.dialog.SpotsDialog;
import okhttp3.ConnectionPool;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Retrofit;

public class CameraActivity extends AppCompatActivity {

    CameraView cameraView;
    ImageButton recordButton;
    ProgressBar progressBar;
    ImageView imageView;
    PulseCountDown pulseCountDown;
    Button btnRotateCamera;

    Boolean recording = false;

    int countRiregistrazioni = 4;

    File video;

    Game game;

    Bitmap image;

    ApiService apiService;

    private void initRetrofitClient() {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .connectionPool(new ConnectionPool(0, 5, TimeUnit.HOURS))
                .build();

        apiService = new Retrofit.Builder().baseUrl(Constants.API_URL).client(client).build().create(ApiService.class);
    }

    @Override
    protected void onResume() {
        super.onResume();
        cameraView.open();
    }

    @Override
    public void onBackPressed() {
        Intent returnIntent = new Intent();
        setResult(Activity.RESULT_CANCELED, returnIntent);

        finish();
    }

    @Override
    protected void onPause() {
        super.onPause();
        cameraView.close();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        cameraView.destroy();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);

        imageView = findViewById(R.id.imageView);
        pulseCountDown = findViewById(R.id.pulseCountDown);

        showImage();

        countRiregistrazioni = 4;

        this.game = (Game)getIntent().getSerializableExtra("game");

        recordButton = findViewById(R.id.buttonRecord);

        video = new File(getFilesDir(), "video.mp4");

        cameraView = findViewById(R.id.camera);
        final RelativeLayout parentView = findViewById(R.id.parentView);
        final LinearLayout buttonsContainer = findViewById(R.id.buttonsContainer);

        final float[] _xDelta = new float[1];
        final float[] _yDelta = new float[1];
        cameraView.setOnTouchListener(new View.OnTouchListener() {
            public boolean onTouch(View view, MotionEvent event) {
                switch (event.getAction() & MotionEvent.ACTION_MASK) {
                    case MotionEvent.ACTION_DOWN:
                        _xDelta[0] = view.getX() - event.getRawX();
                        _yDelta[0] = view.getY() - event.getRawY();
                        break;
                    case MotionEvent.ACTION_UP:
                        break;
                    case MotionEvent.ACTION_POINTER_DOWN:
                        break;
                    case MotionEvent.ACTION_POINTER_UP:
                        break;
                    case MotionEvent.ACTION_MOVE:
                        view.setY(Math.min(Math.max(event.getRawY() + _yDelta[0], 0), parentView.getHeight() - buttonsContainer.getHeight() - cameraView.getHeight()));
                        view.setX(Math.min(Math.max(event.getRawX() + _xDelta[0], 0), parentView.getWidth() - cameraView.getWidth()));
                        break;
                }
                cameraView.invalidate();
                return true;
            }
        });

        initRetrofitClient();

        final View recordLight = findViewById(R.id.recordLight);

        final Handler handler = new Handler();
        final int delayLed = 500;
        handler.postDelayed(new Runnable(){
            public void run(){
                if(recording) {
                    if(recordLight.getVisibility() == View.VISIBLE) {
                        recordLight.setVisibility(View.INVISIBLE);
                    }
                    else recordLight.setVisibility(View.VISIBLE);
                }
                else {
                    recordLight.setVisibility(View.INVISIBLE);
                }
                handler.postDelayed(this, delayLed);
            }
        }, delayLed);

        progressBar = findViewById(R.id.p_bar_camera);
        final int delayBar = 100;
        progressBar.setMax(15*1000);
        handler.postDelayed(new Runnable(){
            public void run(){
                if(recording) {
                    int progress = progressBar.getProgress();

                    // 15s : 100% = delayBar : x
                    int deltaProgress = delayBar;
                    if(progress + deltaProgress > 15*1000) {
                        progressBar.setProgress(15*1000);
                    }
                    else progressBar.setProgress(progress + deltaProgress);
                }
                handler.postDelayed(this, delayBar);
            }
        }, delayBar);

        Button btnIndietro = findViewById(R.id.back_button);
        // Onclick pulsante indietro
        btnIndietro.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent returnIntent = new Intent();
                setResult(Activity.RESULT_CANCELED, returnIntent);

                finish();
            }
        });

        recordButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                endRecording();
            }
        });

        cameraView.setLifecycleOwner(this);

        cameraView.setMode(Mode.VIDEO);

        cameraView.setFacing(Facing.FRONT);

        cameraView.setEngine(Engine.CAMERA1);

        cameraView.setVideoMaxDuration(1000*15);

        cameraView.setVideoCodec(VideoCodec.H_264);

        cameraView.setFrameProcessingFormat(ImageFormat.NV16);

        cameraView.setUseDeviceOrientation(false);

        cameraView.addCameraListener(new Listener());

        btnRotateCamera = findViewById(R.id.rotateCameraButton);
        final Drawable icon = getResources().getDrawable(R.drawable.rotate_camera);
        btnRotateCamera.setCompoundDrawablesRelativeWithIntrinsicBounds(icon, null, null, null);
        final ObjectAnimator animator = ObjectAnimator.ofInt(icon, "level", 0, 10000).setDuration(1000);

        final Drawable iconBack = getResources().getDrawable(R.drawable.rotate_camera_back);
        final ObjectAnimator animatorBack = ObjectAnimator.ofInt(iconBack, "level", 0, 10000).setDuration(1000);

        btnRotateCamera.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                float deg = 0F;
                if(cameraView.getFacing().equals(Facing.BACK)) {
                    cameraView.setFacing(Facing.FRONT);
                    deg = 0F;

                    btnRotateCamera.setCompoundDrawablesRelativeWithIntrinsicBounds(iconBack, null, null, null);
                    animatorBack.start();
                }
                else {
                    cameraView.setFacing(Facing.BACK);
                    deg = 180F;

                    btnRotateCamera.setCompoundDrawablesRelativeWithIntrinsicBounds(icon, null, null, null);
                    animator.start();
                }
            }
        });

        countDownStart();
    }

    private void showImage() {
        this.image = DataUtility.imgCaricata;
        imageView.setImageBitmap(image);
    }

    private void countDownStart() {
        final TextView textView = findViewById(R.id.info_countdown);
        textView.setText(getString(R.string.starting_countdown));

        pulseCountDown.start(new OnCountdownCompleted() {
            @Override
            public void completed() {
                textView.setText("");
                startRecording();
            }
        });
    }

    public void uploadVideo(File file, boolean truth) {
        try {
            byte[] data = IOUtils.toByteArray(new FileInputStream(file));

            FileOutputStream fos = new FileOutputStream(file);
            fos.write(data);
            fos.flush();
            fos.close();

            final AlertDialog progressDialog = new SpotsDialog.Builder()
                    .setContext(this)
                    .setTheme(R.style.ProgressDialogStyle)
                    .setMessage(getString(R.string.attendi_invio_video))
                    .build();

            progressDialog.show();

            RequestBody reqFile = RequestBody.create(MediaType.parse("video/mp4"), file);
            MultipartBody.Part body = MultipartBody.Part.createFormData("upload", game.getId() + "-" + (game.getRounds().size() - 1) + "-" + truth, reqFile);
            RequestBody name = RequestBody.create(MediaType.parse("text/plain"), "upload");

            Call<ResponseBody> req = apiService.postVideo("game/upload/" + game.getId() + "/" + game.getLastRound().getId() + "/" + game.getLastRound().getImageId() + "/" + truth,body, name, "Bearer " + JWTUtils.getJWTSigned(CameraActivity.this));
            req.enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, retrofit2.Response<ResponseBody> response) {
                    if (response.code() == 200) {
                    }

                    progressDialog.dismiss();

                    // aggiorno oggetto game
                    try {
                        String res = response.body().string();

                        JSONObject result = new JSONObject(res);

                        Game newGame = new Game(result.getJSONObject("game"), CameraActivity.this);

                        Intent data = new Intent();
                        data.putExtra("game", newGame);

                        setResult(RESULT_OK,data);

                        finish();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    t.printStackTrace();
                }
            });


        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static Bitmap getBitmapImageFromYUV(byte[] data, int width, int height) {
        YuvImage yuvimage = new YuvImage(data, ImageFormat.NV21, width, height, null);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        yuvimage.compressToJpeg(new Rect(0, 0, width, height), 80, baos);
        byte[] jdata = baos.toByteArray();
        BitmapFactory.Options bitmapFatoryOptions = new BitmapFactory.Options();
        bitmapFatoryOptions.inPreferredConfig = Bitmap.Config.RGB_565;
        Bitmap bmp = BitmapFactory.decodeByteArray(jdata, 0, jdata.length, bitmapFatoryOptions);
        return bmp;
    }

    private void startRecording() {
        //btnRotateCamera.setVisibility(View.INVISIBLE);
        cameraView.setVisibility(View.VISIBLE);
        recordButton.setVisibility(View.VISIBLE);
        recordButton.setBackground(getDrawable(R.drawable.stop_video));

        progressBar.setProgress(0);
        recording = true;

        cameraView.takeVideoSnapshot(video);
    }

    private void endRecording() {
        //btnRotateCamera.setVisibility(View.VISIBLE);
        cameraView.setVisibility(View.INVISIBLE);
        recordButton.setVisibility(View.INVISIBLE);
        recordButton.setBackground(getDrawable(R.drawable.ic_record));

        recording = false;
        progressBar.setProgress(0);

        cameraView.stopVideo();
    }


    private class Listener extends CameraListener {

        @Override
        public void onCameraOpened(@NonNull CameraOptions options) {
            //super.onCameraOpened(options);
        }

        @Override
        public void onCameraError(@NonNull CameraException exception) {
            super.onCameraError(exception);
        }

        @Override
        public void onPictureTaken(@NonNull PictureResult result) {
            super.onPictureTaken(result);
        }

        @Override
        public void onVideoTaken(@NonNull VideoResult result) {
            super.onVideoTaken(result);

            if(result.getTerminationReason() == VideoResult.REASON_MAX_DURATION_REACHED) {
                recordButton.setVisibility(View.INVISIBLE);
                recordButton.setBackground(getDrawable(R.drawable.ic_record));

                recording = false;
                progressBar.setProgress(0);
            }

            askRecordAgain(result.getFile());
        }

        @Override
        public void onVideoRecordingStart() {
            super.onVideoRecordingStart();
        }

        @Override
        public void onVideoRecordingEnd() {
            super.onVideoRecordingEnd();
        }

        @Override
        public void onExposureCorrectionChanged(float newValue, @NonNull float[] bounds, @Nullable PointF[] fingers) {
            super.onExposureCorrectionChanged(newValue, bounds, fingers);
        }

        @Override
        public void onZoomChanged(float newValue, @NonNull float[] bounds, @Nullable PointF[] fingers) {
            super.onZoomChanged(newValue, bounds, fingers);
        }
    }

    private void askRecordAgain(final File video) {
        cameraView.close();

        countRiregistrazioni--;

        final VideoDialog videoDialog = new VideoDialog(this, video, countRiregistrazioni);
        videoDialog.show();

        videoDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {
                if(videoDialog.getResultCode() == VideoDialog.VERITA_CODE) {
                    uploadVideo(video, true);
                }
                else if(videoDialog.getResultCode() == VideoDialog.BUGIA_CODE) {
                    uploadVideo(video, false);
                }
                else if(videoDialog.getResultCode() == VideoDialog.RIREGISTRA_CODE) {
                    // Riregistro
                    cameraView.open();

                    loadImage();
                }
                else {
                    // non invio video
                    resignRound();
                }
            }
        });
    }

    private void resignRound() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_invio_video))
                .build();

        progressDialog.show();

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "game/not_upload/" + game.getId() + "/" + game.getLastRound().getId();

        StringRequest getRequest = new StringRequest(Request.Method.POST, URL,
                new Response.Listener<String>()
                {
                    @Override
                    public void onResponse(String response) {
                        // response
                        Log.d("Response", response);

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        // aggiorno oggetto game
                        try {
                            JSONObject result = new JSONObject(response);

                            game = new Game(result.getJSONObject("game"), CameraActivity.this);

                            Intent data = new Intent();
                            data.putExtra("game", game);

                            setResult(RESULT_OK,data);

                            finish();
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

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        InfoDialog infoDialog = new InfoDialog(CameraActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(CameraActivity.this));

                return params;
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }

    private void loadImage() {
        final AlertDialog progressDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setTheme(R.style.ProgressDialogStyle)
                .setMessage(getString(R.string.attendi_immagine))
                .build();

        progressDialog.show();

        String avoid = "";
        int avoidNumber = 0;
        for(int roundIndex = 0; roundIndex < game.getRounds().size() - 1; roundIndex++) {
            Round round = game.getRounds().get(roundIndex);
            if(avoidNumber > 0) {
                avoid += ",";
            }

            if(!round.getImageId().equals("null")) {
                avoid += round.getImageId();

                avoidNumber++;
            }
        }

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String URL = Constants.API_URL + "image/random?avoid=" + avoid;

        ImageRequest getRequest = new ImageRequest(URL,
                new Response.Listener<Bitmap>()
                {
                    @Override
                    public void onResponse(Bitmap response) {
                        // response
                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        DataUtility.imgCaricata = response;
                        showImage();
                        countDownStart();
                    }
                }, 1024, 1024, null,
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("ERROR","error => "+error.toString());

                        if (progressDialog.isShowing()) {
                            progressDialog.dismiss();
                        }

                        InfoDialog infoDialog = new InfoDialog(CameraActivity.this, getString(R.string.title_error), getString(R.string.content_error), getString(R.string.close_button));
                        infoDialog.setError(true);
                        infoDialog.show();
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {


                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json");
                params.put("authorization", "Bearer " + JWTUtils.getJWTSigned(CameraActivity.this));

                return params;
            }

            @Override
            protected Response<Bitmap> parseNetworkResponse(NetworkResponse response)
            {
                Map<String, String> responseHeaders = response.headers;

                String imageId = responseHeaders.get("image-id");

                game.getLastRound().setImageId(imageId);

                return super.parseNetworkResponse(response);
            }
        };

        getRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(getRequest);
    }
}