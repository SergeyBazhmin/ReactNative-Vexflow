package com.nativejs.MusicAnalyzer;

public class Complex {
    private double real;
    private double imaginary;

    public Complex(double real, double imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    public double getReal() {
        return real;
    }

    public void setReal(double real) {
        this.real = real;
    }

    public double getImaginary() {
        return imaginary;
    }

    public void setImaginary(double imaginary) {
        this.imaginary = imaginary;
    }

    public double getMagnitude() {
        return Math.sqrt(real * real + imaginary * imaginary);
    }

    public double getPhase() {
        return Math.atan2(real, imaginary);
    }

    public Complex Negative(){
        return new Complex(-real, -imaginary);
    }

    public Complex Sum(Complex b) {
        return new Complex(real + b.real, imaginary + b.imaginary);
    }

    public Complex Subtract(Complex b) {
        return new Complex(real - b.real, imaginary - b.imaginary);
    }

    public Complex Multiply(Complex b) {
        return new Complex(real * b.real - imaginary * b.imaginary, imaginary * b.real + real * b.imaginary);
    }

    public Complex Division(Complex b) {
        double real1 = real;
        double imaginary1 = imaginary;
        double real2 = b.real;
        double imaginary2 = b.imaginary;
        if (Math.abs(imaginary2) < Math.abs(real2))
        {
            double num = imaginary2 / real2;
            return new Complex((real1 + imaginary1 * num) / (real2 + imaginary2 * num), (imaginary1 - real1 * num) / (real2 + imaginary2 * num));
        }
        double num1 = real2 / imaginary2;
        return new Complex((imaginary1 + real1 * num1) / (imaginary2 + real2 * num1), (-real1 + imaginary1 * num1) / (imaginary2 + real2 * num1));

    }

    public static Complex Negative(Complex a){
        return new Complex(-a.real, -a.imaginary);
    }

    public static Complex Sum(Complex a, Complex b) {
        return new Complex(a.real + b.real, a.imaginary + b.imaginary);
    }

    public static Complex Subtract(Complex a, Complex b) {
        return new Complex(a.real - b.real, a.imaginary - b.imaginary);
    }

    public static Complex Multiply(Complex a, Complex b) {
        return new Complex(a.real * b.real - a.imaginary * b.imaginary, a.imaginary * b.real + a.real * b.imaginary);
    }

    public static Complex Division(Complex a, Complex b) {
        double real1 = a.real;
        double imaginary1 = a.imaginary;
        double real2 = b.real;
        double imaginary2 = b.imaginary;
        if (Math.abs(imaginary2) < Math.abs(real2))
        {
            double num = imaginary2 / real2;
            return new Complex((real1 + imaginary1 * num) / (real2 + imaginary2 * num), (imaginary1 - real1 * num) / (real2 + imaginary2 * num));
        }
        double num1 = real2 / imaginary2;
        return new Complex((imaginary1 + real1 * num1) / (imaginary2 + real2 * num1), (-real1 + imaginary1 * num1) / (imaginary2 + real2 * num1));

    }
}
