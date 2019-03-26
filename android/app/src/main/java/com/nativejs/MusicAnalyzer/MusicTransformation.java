package com.nativejs.MusicAnalyzer;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;

public class MusicTransformation {

    private final int SAMPLE_RATE = 44100;
    private final int BYTES_IN_SAMPLE = 2;

    private static NotesTable notesTable = new NotesTable();
    private MusicPosition position;

    public MusicTransformation(MusicPosition position) {
        this.position = position;
    }

    private static Notes[] getNotes(double[] frame, int sampleRate) {
        Double[] frequency = getFrequency(frame, sampleRate);

        for (double freq : frequency) {
            System.out.print(freq);
            System.out.print(";");
        }

        HashSet<Notes> notes = new HashSet<>();

        for (double freq : frequency) {
            double min = 1e9;
            Notes closest = null;
            for (HashMap.Entry<Notes, ArrayList<Double>> note : notesTable.NotesHashMap.entrySet()) {
                for (double noteFrequency : note.getValue()) {
                    if (Math.abs(noteFrequency - freq) < min) {
                        min = Math.abs(noteFrequency - freq);
                        closest = note.getKey();
                    }
                }
            }
            if (closest != null && min < 100)
                notes.add(closest);
        }

        Notes[] notesArray = new Notes[notes.size()];
        return notes.toArray(notesArray);
    }

    private static Double[] getFrequency(double[] frame, int sampleRate) {
        HashMap<Double, Double> spectrum = getSpectrum(frame, sampleRate);

        double sum = 0;

        for (double value : spectrum.values())
            sum += value;

        HashMap<Double, Double> bigFreg = new HashMap<>();
        for (HashMap.Entry<Double, Double> entry : spectrum.entrySet()) {
            entry.setValue(entry.getValue() / sum);
            if (entry.getValue() > 0.05)
                bigFreg.put(entry.getKey(), entry.getValue());
        }

        Double[] res = new Double[bigFreg.size()];
        return bigFreg.keySet().toArray(res);
    }

    private static HashMap<Double, Double> getSpectrum(double[] frame, int sampleRate) {
        int shift = 16;
        int frameSize = frame.length - shift;

        Complex[] frame0 = preprocessFrame(frame);
        Complex[] frame1 = Arrays.copyOfRange(frame0, 0, frame.length - shift);
        Complex[] frame2 = Arrays.copyOfRange(frame0, shift, frame.length);

        Complex[] spectrum1 = FFT.decimationInFrequency(frame1);
        Complex[] spectrum2 = FFT.decimationInFrequency(frame2);
        Complex complexSize = new Complex(frameSize, 0);

        for (int i = 0; i < frameSize; i++) {
            spectrum1[i].Division(complexSize);
            spectrum2[i].Division(complexSize);
        }

        //double k = sampleRate / spectrum1.length;

        //HashMap<Double, Double> spectrum = new HashMap<>();

        //for (int i = 0; i < spectrum1.length; i++) {
          //  Complex entry = spectrum1[i];
            //double abs = entry.getMagnitude();
            //spectrum.put(i * k, abs);
        //}


        HashMap<Double, Double> spectrum = Filters.GetJoinedSpectrum(spectrum1, spectrum2, shift, sampleRate);
        spectrum = Filters.AntiAliasing(spectrum);

        return spectrum;
    }

    private static Complex[] preprocessFrame(double[] frame) {
        for (int i = 1; i < frame.length - 1; i++)
            frame[i] = (frame[i] + frame[i - 1] + frame[i + 1])/3;

        for (int i = 0; i < frame.length; i++)
            frame[i] *= Window.Rectangle(frame[i], frame.length);

        Complex[] complexFrame = new Complex[frame.length];
        for (int i = 0; i < frame.length; i++)
            complexFrame[i] = new Complex(frame[i], 0);

        return complexFrame;
    }

    public void onNewData(byte[] data) {
        if (data.length == 0) return;
        double[] doubleNotes = new double[data.length / BYTES_IN_SAMPLE];
        for (int i = 0; i <= data.length - BYTES_IN_SAMPLE; i += BYTES_IN_SAMPLE) {
            byte[] bytes = Arrays.copyOfRange(data, i, i + BYTES_IN_SAMPLE);
            for (int j = 0; j < BYTES_IN_SAMPLE / 2; j++) {
                byte k = bytes[j];
                bytes[j] = bytes[BYTES_IN_SAMPLE - j - 1];
                bytes[BYTES_IN_SAMPLE - j - 1] = k;
            }
            BigInteger bi = new BigInteger(bytes);
            doubleNotes[i / BYTES_IN_SAMPLE] = bi.doubleValue();
        }

        Notes[] notes = getNotes(doubleNotes, SAMPLE_RATE);
        position.updatePosition(notes);
    }
}
