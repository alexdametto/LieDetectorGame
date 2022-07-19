package com.dametto.poloni.liedetectorv2;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.Display;

import com.dametto.poloni.liedetectorv2.utility.CustomSlideFragment.LinkSliderFragment;
import com.github.appintro.AppIntro;

public class SliderConsent extends AppIntro {
    LinkSliderFragment slide1, slide2, slide3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.activity_slider_consent);

        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setNavigationBarColor(getResources().getColor(R.color.colorPrimaryDark));
        }

        setSkipText(getText(R.string.esci));

        setDoneTextTypeface(R.font.aldrich);
        setSkipTextTypeface(R.font.aldrich);

        super.setButtonsEnabled(false);

        String titleSlide1 = getString(R.string.titoloPolicy1);
        String textSlide1 = getString(R.string.testoPolicy1);
        String titleSlide2 = getString(R.string.titoloPolicy2);
        String textSlide2 = getString(R.string.testoPolicy2);
        String titleSlide3 = getString(R.string.titoloPolicy3);
        String textSlide3 = getString(R.string.testoPolicy3);

        slide1 = LinkSliderFragment.newInstance(titleSlide1, textSlide1, true);
        slide2 = LinkSliderFragment.newInstance(titleSlide2, textSlide2, false);
        slide3 = LinkSliderFragment.newInstance(titleSlide3, textSlide3, false);

        addSlide(slide1);
        addSlide(slide2);
        addSlide(slide3);
    }

    @Override
    protected void onNextSlide() {
        //super.onNextSlide();
    }

    @Override
    public void onSkipPressed(Fragment currentFragment) {
        super.onSkipPressed(currentFragment);
        // Do something when users tap on Skip button.

        // lo skip ti fa uscire ma non ti lascia registrare
        setResult(RESULT_CANCELED);

        finish();
    }

    @Override
    public void onDonePressed(Fragment currentFragment) {
        //super.onDonePressed(currentFragment);
        // chiudo l'activity

        boolean participate = slide1.selection();
        boolean dataProcessing = slide2.selection();
        boolean publishingImages = slide3.selection();

        Intent data = new Intent();
        data.putExtra("participate", participate);
        data.putExtra("dataProcessing", dataProcessing);
        data.putExtra("publishingImages", publishingImages);

        setResult(RESULT_OK, data);

        finish();
    }

    @Override
    public void onSlideChanged(@Nullable Fragment oldFragment, @Nullable Fragment newFragment) {
        super.onSlideChanged(oldFragment, newFragment);
    }

    @Override
    protected void onNextPressed(Fragment currentFragment) {
        //super.onNextPressed(currentFragment);
    }

    @Override
    public void onBackPressed() {
        //super.onBackPressed();
        setResult(RESULT_CANCELED);
        finish();
    }
}