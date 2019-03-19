package com.nativejs.MusicAnalyzer;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.lang.Class;
import com.facebook.react.bridge.Arguments;

public class MusicPosition extends ReactContextBaseJavaModule {

    private Notes[][] notes;
    //private int tactTime;
    private Notes previousNote;
    private int currentTact = 0;
    private int curentNoteInTact = 0;
    private ReactApplicationContext reactContext;

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

    public void init(Object notes/*, int tactTime*/) {
        System.out.println(notes.getClass());
        //this.notes = notes;
        //this.tactTime = tactTime;
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
        for (int i = nextTactIndex; i < Math.min(notes.length, nextTactIndex + 5); i++) {
            for (int j = (i == nextTactIndex ? nextNoteIndex : 0); j < notes[nextTactIndex].length; i++) {
                for (int k = 0; k < currentNote.length; k++)
                    if (notes[i][j] == currentNote[k]) {
                        previousNote = currentNote[k];
                        currentTact = i;
                        curentNoteInTact = j;
                        found = true;
                        break;
                    }
                if (found) break;
            }
            if (found) break;
        }

        if (nextTactIndex != currentTact)
            onTactChanged(currentTact);

        if (curentNoteInTact == notesInTact - 1)
            onTactChanged(currentTact + 1);
    }

    public void onTactChanged(int newTact) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onTactChanged", newTact);
    }

    public void onNewSoundData(byte[] notes) {
        musicTransformation.onNewData(notes);
    }
}
