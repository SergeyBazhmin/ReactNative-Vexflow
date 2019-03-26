package com.nativejs.MusicAnalyzer;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.lang.Class;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableArray;

public class MusicPosition extends ReactContextBaseJavaModule {

    private Notes[][] notes;
    private Notes previousNote;
    private int currentTact = 0;
    private int curentNoteInTact = 0;
    private ReactApplicationContext reactContext;
    private int update = 0;

    public MusicTransformation musicTransformation;

    public MusicPosition(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        musicTransformation = new MusicTransformation(this);
    }

    @Override
    public String getName() {
        return "MusicPosition";
    }

    @ReactMethod
    public void init(ReadableArray notesArray) {
        notes = new Notes[notesArray.size()][];

        for (int i = 0; i < notesArray.size(); i++) {
            ReadableArray iArr = notesArray.getArray(i);
            notes[i] = new Notes[iArr.size()];
            for (int j = 0; j < iArr.size(); j++) {
                ReadableArray accord = iArr.getArray(j);
                notes[i][j] = Notes.valueOf(accord.getString(0));
            }
        }
    }

    @ReactMethod
    public void setCurrentTact(int currentTact) {
        this.currentTact = currentTact;
    }


    public void updatePosition(Notes[] currentNote) {

        int notesInTact = notes[currentTact].length;

        Notes nextNote = null;
        int nextTactIndex = currentTact;
        int nextNoteIndex = curentNoteInTact;
        if (curentNoteInTact + 1 < notesInTact) {
            nextNote = notes[currentTact][curentNoteInTact + 1];
            nextNoteIndex = curentNoteInTact + 1;
        } else if (currentTact + 1 < notes.length) {
            nextNote = notes[currentTact + 1][0];
            nextTactIndex = currentTact + 1;
            nextNoteIndex = 0;
        }
        if (nextNote == null) return;

        boolean found = false;

        for (int i = nextTactIndex; i < Math.min(notes.length, nextTactIndex + 1); i++) {
            for (int j = (i == nextTactIndex ? nextNoteIndex : 0); j < notes[i].length; j++) {
                for (int k = 0; k < currentNote.length; k++) {
                    if (notes[i][j] == currentNote[k]) {
                        previousNote = currentNote[k];
                        currentTact = i;
                        curentNoteInTact = j;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) break;
        }

        //System.out.println("Next tact: " + nextTactIndex);
        if (found && nextTactIndex != currentTact)
            onTactChanged(currentTact);

        if (found && curentNoteInTact == notesInTact - 1)
            onTactChanged(currentTact + 1);
    }

    public void onTactChanged(int newTact) {
        try {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onTactChanged", newTact);
        } catch (Exception ex) {

        }
    }

    @ReactMethod
    public void onNewSoundData(ReadableMap newData) {
        ReadableArray data = newData.getArray("data");
        byte[] bytes = new byte[data.size()];
        for (int i = 0; i < data.size(); i++) {
            bytes[i] = (byte)data.getInt(i);
        }
        musicTransformation.onNewData(bytes);
    }
}
