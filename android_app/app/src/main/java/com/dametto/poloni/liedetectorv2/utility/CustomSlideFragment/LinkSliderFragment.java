package com.dametto.poloni.liedetectorv2.utility.CustomSlideFragment;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Constants;
import com.dametto.poloni.liedetectorv2.utility.Utils;
import com.github.appintro.SlidePolicy;

public class LinkSliderFragment extends Fragment implements SlidePolicy {
    //private CheckBox checkBox;
    private String title;
    private String text;
    private boolean required = false;
    private TextView titoloPolicy, descriptionPolicy;
    private RadioGroup radioGroup;
    private RadioButton radioAccept, radioReject;
    private ScrollView scrollView;

    private LinkSliderFragment(String title, String text, boolean required) {
        this.title = title;
        this.text = text;
        this.required = required;

        if(required) {
            this.title += " *";
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);

        return inflater.inflate(R.layout.link_slider_page, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        titoloPolicy = view.findViewById(R.id.titlePolicy);
        descriptionPolicy = view.findViewById(R.id.descriptionPolicy);
        radioGroup = view.findViewById(R.id.radioGroup);

        radioAccept = view.findViewById(R.id.radioAccept);
        radioReject = view.findViewById(R.id.radioReject);

        scrollView = view.findViewById(R.id.scrollView);

        // setto i testi
        titoloPolicy.setText(this.title);
        descriptionPolicy.setText(this.text);
    }

    private void scrollDown() {
        scrollView.fullScroll(View.FOCUS_DOWN);
    }

    @Override
    public void onUserIllegallyRequestedNextPage() {
        int selectedId = radioGroup.getCheckedRadioButtonId();

        if(selectedId != radioAccept.getId() && selectedId != radioReject.getId()) {
            // not selected
            Toast.makeText(
                    requireContext(),
                    getString(R.string.devi_selezionare_voce),
                    Toast.LENGTH_LONG
            ).show();

            scrollDown();
        }
        else if(required) {
            if(selectedId != radioAccept.getId()) {
                // mandatory and not accept
                Toast.makeText(
                        requireContext(),
                        getString(R.string.voce_obbligatoria),
                        Toast.LENGTH_LONG
                ).show();

                scrollDown();
            }
        }
    }

    public boolean selection() {
        int selectedId = radioGroup.getCheckedRadioButtonId();

        if(selectedId != radioAccept.getId() && selectedId != radioReject.getId()) {
            // not selected
            return false;
        }

        if(selectedId == radioAccept.getId()) {
            return true;
        }
        return false;
    }

    @Override
    public boolean isPolicyRespected() {
        int selectedId = radioGroup.getCheckedRadioButtonId();

        if(selectedId != radioAccept.getId() && selectedId != radioReject.getId()) {
            // not selected
            return false;
        }
        else if(required) {
            if(selectedId == radioAccept.getId()) {
                // mandatory and accepted
                return true;
            }
            else {
                // mandatory and not accept
                return false;
            }
        }

        // not mandatory
        return true;
    }

    public static LinkSliderFragment newInstance(String title, String text, boolean required) {
        return new LinkSliderFragment(title, text, required);
    }


}
