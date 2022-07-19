package com.dametto.poloni.liedetectorv2;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.dametto.poloni.liedetectorv2.utility.CustomSlideFragment.LinkSliderFragment;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.github.appintro.AppIntro;
import com.github.appintro.AppIntroCustomLayoutFragment;
import com.github.appintro.AppIntroFragment;
import com.github.appintro.model.SliderPage;

public class ActivityIntro extends AppIntro {
    Boolean fromSettings = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.activity_intro);
        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setNavigationBarColor(getResources().getColor(R.color.colorPrimaryDark));
        }

        Intent fromIntent = getIntent();
        if(fromIntent.getExtras() != null)
            fromSettings = fromIntent.getExtras().getBoolean("fromSettings", false);

        setDoneTextTypeface(R.font.aldrich);
        setSkipTextTypeface(R.font.aldrich);

        if(!fromSettings)
            setSkipButtonEnabled(false);

        SliderPage firstPage = new SliderPage();
        firstPage.setBackgroundDrawable(R.drawable.background);
        firstPage.setTitle(getString(R.string.intro1_title));
        firstPage.setDescription("");
        firstPage.setImageDrawable(R.drawable.lie_detector_icon);
        firstPage.setTitleColor(getColor(R.color.white));
        firstPage.setDescriptionColor(getColor(R.color.white));
        firstPage.setTitleTypefaceFontRes(R.font.aldrich);
        firstPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage secondPage = new SliderPage();
        secondPage.setBackgroundDrawable(R.drawable.background);
        secondPage.setTitle(getString(R.string.intro2_title));
        secondPage.setDescription(getString(R.string.intro2_description));
        secondPage.setImageDrawable(R.drawable.ic_goal);
        secondPage.setTitleColor(getColor(R.color.white));
        secondPage.setDescriptionColor(getColor(R.color.white));
        secondPage.setTitleTypefaceFontRes(R.font.aldrich);
        secondPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage thirdPage = new SliderPage();
        thirdPage.setBackgroundDrawable(R.drawable.background);
        thirdPage.setTitle(getString(R.string.intro3_title));
        thirdPage.setDescription(getString(R.string.intro3_description));
        thirdPage.setImageDrawable(R.drawable.question);
        thirdPage.setTitleColor(getColor(R.color.white));
        thirdPage.setDescriptionColor(getColor(R.color.white));
        thirdPage.setTitleTypefaceFontRes(R.font.aldrich);
        thirdPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage fourthPage = new SliderPage();
        fourthPage.setBackgroundDrawable(R.drawable.background);
        fourthPage.setTitle(getString(R.string.intro4_title));
        fourthPage.setDescription(getString(R.string.intro4_description));
        fourthPage.setImageDrawable(R.drawable.answer);
        fourthPage.setTitleColor(getColor(R.color.white));
        fourthPage.setDescriptionColor(getColor(R.color.white));
        fourthPage.setTitleTypefaceFontRes(R.font.aldrich);
        fourthPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage fifthPage = new SliderPage();
        fifthPage.setBackgroundDrawable(R.drawable.background);
        fifthPage.setTitle(getString(R.string.intro5_title));
        fifthPage.setDescription(getString(R.string.intro5_description));
        fifthPage.setImageDrawable(R.drawable.ic_opinion);
        fifthPage.setTitleColor(getColor(R.color.white));
        fifthPage.setDescriptionColor(getColor(R.color.white));
        fifthPage.setTitleTypefaceFontRes(R.font.aldrich);
        fifthPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage roundPage = new SliderPage();
        roundPage.setBackgroundDrawable(R.drawable.background);
        roundPage.setTitle(getString(R.string.intro_round_title));
        roundPage.setDescription(getString(R.string.intro_round_content));
        roundPage.setImageDrawable(R.drawable.ic_question_asking);
        roundPage.setTitleColor(getColor(R.color.white));
        roundPage.setDescriptionColor(getColor(R.color.white));
        roundPage.setTitleTypefaceFontRes(R.font.aldrich);
        roundPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage permissionPage = new SliderPage();
        permissionPage.setBackgroundDrawable(R.drawable.background);
        permissionPage.setTitle(getString(R.string.title_permission));
        permissionPage.setDescription(getString(R.string.content_permission));
        permissionPage.setImageDrawable(R.drawable.ic_shield);
        permissionPage.setTitleColor(getColor(R.color.white));
        permissionPage.setDescriptionColor(getColor(R.color.white));
        permissionPage.setTitleTypefaceFontRes(R.font.aldrich);
        permissionPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        SliderPage lastPage = new SliderPage();
        lastPage.setBackgroundDrawable(R.drawable.background);
        lastPage.setTitle(getString(R.string.intro6_title));
        lastPage.setDescription(getString(R.string.intro6_description));
        lastPage.setImageDrawable(R.drawable.ic_fun);
        lastPage.setTitleColor(getColor(R.color.white));
        lastPage.setDescriptionColor(getColor(R.color.white));
        lastPage.setTitleTypefaceFontRes(R.font.aldrich);
        lastPage.setDescriptionTypefaceFontRes(R.font.aldrich);

        //Fragment consensoInformativo = LinkSliderFragment.newInstance();
        /*consensoInformativo.setBackgroundDrawable(R.drawable.background);
        consensoInformativo.setTitle("Consenso informativo");
        consensoInformativo.setDescription("Consenso informativo descrizione http://www.google.it");
        consensoInformativo.setImageDrawable(R.drawable.ic_fun);
        consensoInformativo.setTitleColor(getColor(R.color.white));
        consensoInformativo.setDescriptionColor(getColor(R.color.white));
        consensoInformativo.setTitleTypefaceFontRes(R.font.aldrich);
        consensoInformativo.setDescriptionTypefaceFontRes(R.font.aldrich);*/

        int permissionCamera = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA);
        int permissionAudio = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);

        addSlide(AppIntroFragment.newInstance(firstPage));
        addSlide(AppIntroFragment.newInstance(secondPage));
        //addSlide(AppIntroFragment.newInstance(thirdPage));
        addSlide(AppIntroFragment.newInstance(fourthPage));
        addSlide(AppIntroFragment.newInstance(fifthPage));
        addSlide(AppIntroFragment.newInstance(roundPage));

        if(permissionAudio != PackageManager.PERMISSION_GRANTED || permissionCamera != PackageManager.PERMISSION_GRANTED) {
            addSlide(AppIntroFragment.newInstance(permissionPage));
        }

        /*if(!Utils.getPolicy(this)) {
            addSlide(consensoInformativo);
        }*/
        addSlide(AppIntroFragment.newInstance(lastPage));

        if(permissionAudio != PackageManager.PERMISSION_GRANTED || permissionCamera != PackageManager.PERMISSION_GRANTED) {
            askForPermissions(new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO}, 6);
        }
    }

    @Override
    public void onSkipPressed(Fragment currentFragment) {
        super.onSkipPressed(currentFragment);
        // Do something when users tap on Skip button.
        finish();
    }

    @Override
    public void onBackPressed() {

    }

    @Override
    public void onDonePressed(Fragment currentFragment) {
        super.onDonePressed(currentFragment);
        finish();
        // chiudo l'activity
    }

    @Override
    public void onSlideChanged(@Nullable Fragment oldFragment, @Nullable Fragment newFragment) {
        super.onSlideChanged(oldFragment, newFragment);
    }
}