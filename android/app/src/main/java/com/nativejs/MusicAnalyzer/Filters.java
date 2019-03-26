package com.nativejs.MusicAnalyzer;

import java.util.HashMap;

public class Filters {
    public static double SinglePi = Math.PI;
    public static double DoublePi = 2*Math.PI;

    public static HashMap<Double, Double> GetJoinedSpectrum(Complex[] spectrum0, Complex[] spectrum1, double shiftsPerFrame, double sampleRate) {
        int frameSize = spectrum0.length;
        double frameTime = frameSize/sampleRate;
        double shiftTime = frameTime/shiftsPerFrame;
        double binToFrequency = sampleRate/frameSize;
        HashMap<Double, Double> dictionary = new HashMap<>();

        for (int bin = 0; bin < frameSize; bin++) {
            double omegaExpected = DoublePi * (bin * binToFrequency);
            double omegaActual = (spectrum1[bin].getPhase() - spectrum0[bin].getPhase()) / shiftTime;
            double omegaDelta = Align(omegaActual - omegaExpected, DoublePi);
            double binDelta = omegaDelta/(DoublePi * binToFrequency);
            double frequencyActual = (bin) * binToFrequency;
            double magnitude = spectrum1[bin].getMagnitude() + spectrum0[bin].getMagnitude();
            dictionary.put(frequencyActual, magnitude * (0.5 + Math.abs(binDelta)));
        }

        return dictionary;
    }

    public static HashMap<Double, Double> AntiAliasing(HashMap<Double, Double> spectrum) {
        HashMap<Double, Double> result = new HashMap<>();
        double[] keys = new double[spectrum.size()];
        double[] values = new double[spectrum.size()];
        int index = 0;
        for (HashMap.Entry<Double, Double> mapEntry : spectrum.entrySet()) {
            keys[index] = mapEntry.getKey();
            values[index] = mapEntry.getValue();
            index++;
        }

        for (int j = 0; j < spectrum.size() - 4; j++) {
            int i = j;
            double x0 = keys[i];
            double x1 = keys[i + 1];
            double y0 = values[i];
            double y1 = values[i + 1];

            double a = (y1 - y0) / (x1 - x0);
            double b = y0 - a * x0;

            i += 2;
            double u0 = keys[i];
            double u1 = keys[i + 1];
            double v0 = values[i];
            double v1 = values[i + 1];

            double c = (v1 - v0) / (u1 - u0);
            double d = v0 - c * u0;

            double x = (d - b) / (a - c);
            double y = (a * d - b * c) / (a - c);

            if (y > y0 && y > y1 && y > v0 && y > v1 &&
                x > x0 && x > x1 && x < u0 && x < u1) {
                result.put(x1, y1);
                result.put(x, y);
            } else {
                result.put(x1, y1);
            }
        }

        return result;
    }

    public static double Align(double angle, double period){
        int qpd = (int) (angle/period);
        if (qpd >= 0) qpd += qpd & 1;
        else qpd -= qpd & 1;
        angle -= period * qpd;
        return angle;
    }
}
