package com.nativejs;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nonnull;

public class MicrophoneListener extends ReactContextBaseJavaModule {

    private final int SAMPLE_DELAY = 50;
    private final int SAMPLE_RATE = 44100;

    private int bufferCallbackLength;

    private int innerBufferSize;
    private AudioRecord audioRecorder;

    private ReactApplicationContext mainReactContext;

    private boolean stopThread;


    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }


    public MicrophoneListener(ReactApplicationContext reactContext) {
        super(reactContext);
        mainReactContext = reactContext;
        audioRecorder = findAudioRecord();
        stopThread = true;
    }

    @ReactMethod
    public void setBufferSize(int bufferSize){
        bufferCallbackLength = bufferSize;
    }

    @ReactMethod
    public void start() {
        if(!stopThread) return;

        stopThread = false;

        final boolean[] alreadyGetData = {false};

        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                int numBytesRead;
                int i = 0;
                int currentPosition = 0;

                byte[] tmpData = new byte[innerBufferSize];

                WritableNativeArray arrayData = new WritableNativeArray();

                audioRecorder.startRecording();
                WritableMap bufferData;
                while (!stopThread) {
                    try {
                        Thread.sleep(SAMPLE_DELAY);
                    } catch (InterruptedException ie) {
                        ie.printStackTrace();
                    }
                    i = 0;
                    numBytesRead = audioRecorder.read(tmpData, 0, innerBufferSize);

                    while(i < numBytesRead){
                        currentPosition++;
                        arrayData.pushInt(tmpData[i++]);

                        if (currentPosition == bufferCallbackLength) {
                            alreadyGetData[0] = true;

                            bufferData = Arguments.createMap();
                            bufferData.putArray("data", arrayData);

                            sendEvent(mainReactContext, "onNewSoundData", bufferData);

                            arrayData = new WritableNativeArray();

                            currentPosition = 0;
                        }
                    }
                }

                stopThread = true;
                audioRecorder.stop();
            }
        });

        thread.start();
    }

    @ReactMethod
    public void stop() {
        stopThread = true;
    }

    private AudioRecord findAudioRecord() {
        for (int rate : new int[]{44100}) {
            for (short audioFormat : new short[]{AudioFormat.ENCODING_PCM_16BIT}) {
                try {
                    innerBufferSize = AudioRecord.getMinBufferSize(rate, AudioFormat.CHANNEL_IN_MONO, audioFormat);

                    if (innerBufferSize != AudioRecord.ERROR_BAD_VALUE) {
                        // check if we can instantiate and have a success
                        AudioRecord recorder = new AudioRecord(MediaRecorder.AudioSource.DEFAULT, rate, AudioFormat.CHANNEL_IN_MONO, audioFormat, innerBufferSize);

                        if (recorder.getState() == AudioRecord.STATE_INITIALIZED)
                            return recorder;
                    }
                } catch (Exception e) {
                    int iii = 10;
                }

            }
        }
        return null;
    }

    @Nonnull
    @Override
    public String getName() {
        return "MicrophoneListener";
    }
}
