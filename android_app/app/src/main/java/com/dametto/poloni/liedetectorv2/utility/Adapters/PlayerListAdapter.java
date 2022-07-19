package com.dametto.poloni.liedetectorv2.utility.Adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.dametto.poloni.liedetectorv2.R;
import com.dametto.poloni.liedetectorv2.utility.Data.GameRequest;
import com.dametto.poloni.liedetectorv2.utility.Data.Player;
import com.dametto.poloni.liedetectorv2.utility.Utils;

import java.util.List;

public class PlayerListAdapter extends ArrayAdapter<Player> {
    Context context;

    public PlayerListAdapter(Context context, int textViewResourceId,
                             List<Player> objects) {
        super(context, textViewResourceId, objects);
        this.context = context;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        Player item = getItem(position);

        convertView = inflater.inflate(R.layout.player_item, null);

        LinearLayout container = convertView.findViewById(R.id.container);
        TextView name = convertView.findViewById(R.id.nameLabel);
        TextView status = convertView.findViewById(R.id.status);
        name.setText(item.getNickname());

        if(item.getOnline()) {
            container.setBackgroundColor(context.getColor(R.color.green));
            status.setText("ONLINE");
        }
        else {
            container.setBackgroundColor(context.getColor(R.color.disabledButton));
            status.setText("OFFLINE");
        }

        return convertView;
    }
}
