package com.nativejs.MusicAnalyzer;

public class FFT {

    public static Complex[] decimationInFrequency(Complex[] frame) {
        if (frame.length == 1) return frame;

        int halfSampleSize = frame.length >> 1;
        int fullSampleSize = frame.length;

        double arg = -2 * Math.PI / fullSampleSize;
        Complex omegaPowBase = new Complex(Math.cos(arg), Math.sin(arg));
        Complex omega = new Complex(1, 0);
        Complex[] spectrum = new Complex[fullSampleSize];

        for (int j = 0; j< halfSampleSize; j++) {
            spectrum[j] = frame[j].Sum(frame[j+halfSampleSize]);
            spectrum[j + halfSampleSize] = omega.Multiply(frame[j].Subtract(frame[j + halfSampleSize]));
            omega = omega.Multiply(omegaPowBase);
        }

        Complex[] yTop = new Complex[halfSampleSize];
        Complex[] yBottom = new Complex[halfSampleSize];
        for (int i = 0; i < halfSampleSize; i++) {
            yTop[i] = spectrum[i];
            yBottom[i] = spectrum[i + halfSampleSize];
        }

        yTop = decimationInFrequency(yTop);
        yBottom = decimationInFrequency(yBottom);
        for (int i = 0; i <  halfSampleSize; i++) {
            int j = i << 1;
            spectrum[j] = yTop[i];
            spectrum[j + 1] = yBottom[i];
        }

        return spectrum;
    }

    public static double[] getAmplitudes(Complex[] frame) {
        double[] amplitudes = new double[frame.length];
        for (int i = 0; i < frame.length; i++) {
            amplitudes[i] = frame[i].getMagnitude();
        }
        return amplitudes;
    }


    public static double[] getPhase(Complex[] frame) {
        double[] amplitudes = new double[frame.length];
        for (int i = 0; i < frame.length; i++) {
            amplitudes[i] = frame[i].getPhase();
        }
        return amplitudes;
    }

}
