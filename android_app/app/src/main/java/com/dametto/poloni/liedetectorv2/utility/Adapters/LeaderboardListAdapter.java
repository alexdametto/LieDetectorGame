package com.dametto.poloni.liedetectorv2.utility.Adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Data.Game;
import com.dametto.poloni.liedetectorv2.utility.Data.LeaderboardListItem;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import java.util.List;

public class LeaderboardListAdapter extends ArrayAdapter<LeaderboardListItem> {
    boolean round = false;

    public LeaderboardListAdapter(Context context, int textViewResourceId,
                           List<LeaderboardListItem> objects, boolean round) {
        super(context, textViewResourceId, objects);
        this.round = round;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        LeaderboardListItem item = getItem(position);

        convertView = inflater.inflate(R.layout.leaderboard_item, null);

        TextView name = convertView.findViewById(R.id.nameLabel);
        TextView value = convertView.findViewById(R.id.valueLabel);
        TextView number = convertView.findViewById(R.id.numberLabel);

        name.setText(item.getName());
        number.setText((position+1) + ".");

        if(position == 0) {
            number.setTextSize(35);
            name.setTextSize(35);
            value.setTextSize(35);
        }
        else if(position == 1) {
            number.setTextSize(30);
            name.setTextSize(30);
            value.setTextSize(30);
        }
        else if(position == 2) {
            number.setTextSize(25);
            name.setTextSize(25);
            value.setTextSize(25);
        }

        if(item.getPlayerId().equals(Utils.getId(convertView.getContext()))) {
            convertView.setBackgroundColor(convertView.getContext().getColor(R.color.colorPrimary));
        }

        if(this.round) {
            if(item.isPercentage()) {
                value.setText(item.getValue().intValue() + " %");
            }
            else {
                value.setText(String.valueOf(item.getValue().intValue()));
            }
        }
        else {
            if(item.isPercentage()) {
                value.setText(item.getValue().toString() + " %");
            }
            else {
                value.setText(item.getValue().toString());
            }
        }



        return convertView;
    }
}
