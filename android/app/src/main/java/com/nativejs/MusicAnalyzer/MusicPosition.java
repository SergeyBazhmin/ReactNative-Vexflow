package com.nativejs.MusicAnalyzer;

import com.facebook.react.bridge.*;
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

import java.util.HashMap;

public class MusicPosition extends ReactContextBaseJavaModule {

    public MusicTransformation musicTransformation;
    private Notes[][] notes;
    private Notes previousNote;
    private int currentTact = 0;
    private int curentNoteInTact = -1;
    private ReactApplicationContext reactContext;
    private int update = 0;
    private HashMap<Notes, Integer> lastNotes;
    private int noteCount = 0;

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
        lastNotes = new HashMap<Notes, Integer>();
        initLastNotes();

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

    private void initLastNotes() {
        lastNotes.clear();
        lastNotes.put(Notes.A, 0);
        lastNotes.put(Notes.B, 0);
        lastNotes.put(Notes.C, 0);
        lastNotes.put(Notes.D, 0);
        lastNotes.put(Notes.E, 0);
        lastNotes.put(Notes.F, 0);
        lastNotes.put(Notes.G, 0);
    }

    @ReactMethod
    public void setCurrentTact(int currentTact) {
        this.currentTact = currentTact;
    }


    public void updatePosition(Notes[] currentNote) {

        if (currentNote.length != 1)
            return;

        lastNotes.put(currentNote[0], lastNotes.get(currentNote[0]) + 1);
        noteCount++;
        if (noteCount != 5) return;

        int max = 0;
        Notes note = Notes.A;
        for (HashMap.Entry<Notes, Integer> entry : lastNotes.entrySet()) {
            if (entry.getValue() > max) {
                max = entry.getValue();
                note = entry.getKey();
            }
        }

        if (max < 2) return;

        System.out.println("FOUND: " + note.name());
        initLastNotes();
        noteCount = 0;

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

        System.out.println("Next note: " + nextNote.name() + "; Next tact: " + nextTactIndex + "; Next note index: " + nextNoteIndex);
        for (int i = nextTactIndex; i < Math.min(notes.length, nextTactIndex + 1); i++) {
            for (int j = (i == nextTactIndex ? nextNoteIndex : 0); j < notes[i].length; j++) {
                if (notes[i][j] == currentNote[0]) {
                    previousNote = currentNote[0];
                    currentTact = i;
                    curentNoteInTact = j;
                    found = true;
                    break;
                }
                if (found) break;
            }
            if (found) break;
        }

        notesInTact = notes[currentTact].length;
        if (found)
        {
            if (curentNoteInTact == notesInTact - 1)
                onTactChanged(currentTact + 1);
            else
                onTactChanged(currentTact);
            System.out.println("Next tact: " + currentTact);
        }

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
            bytes[i] = (byte) data.getInt(i);
        }
        musicTransformation.onNewData(bytes);
    }
}
