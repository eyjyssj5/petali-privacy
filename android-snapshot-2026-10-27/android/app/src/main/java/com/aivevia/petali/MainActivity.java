package com.aivevia.petali;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(PetaliSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
