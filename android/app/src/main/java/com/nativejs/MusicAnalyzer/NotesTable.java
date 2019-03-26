package com.nativejs.MusicAnalyzer;

import java.util.ArrayList;
import java.util.HashMap;

public class NotesTable {
    public HashMap<Notes, ArrayList<Double>> NotesHashMap = new HashMap<>();

    public NotesTable() {

        double aBase = 27.5;
        double abBase = 29.1353;
        double bBase = 30.8677;
        double cBase = 32.7032;
        double cdBase = 34.6479;
        double dBase = 36.7081;
        double deBase = 38.8909;
        double eBase = 41.2035;
        double fbBase = 43.6536;
        double fgBase = 46.2493;
        double gbBase = 48.9995;
        double gaBase = 51.9130;

        NotesHashMap.put(Notes.A, new ArrayList<Double>());
        //NotesHashMap.put(Notes.A_B, new ArrayList<Double>());
        NotesHashMap.put(Notes.B, new ArrayList<Double>());
        NotesHashMap.put(Notes.C, new ArrayList<Double>());
        //NotesHashMap.put(Notes.C_D, new ArrayList<Double>());
        NotesHashMap.put(Notes.D, new ArrayList<Double>());
        //NotesHashMap.put(Notes.D_E, new ArrayList<Double>());
        NotesHashMap.put(Notes.E, new ArrayList<Double>());
        NotesHashMap.put(Notes.F, new ArrayList<Double>());
        //NotesHashMap.put(Notes.F_G, new ArrayList<Double>());
        NotesHashMap.put(Notes.G, new ArrayList<Double>());
        //NotesHashMap.put(Notes.G_A, new ArrayList<Double>());

        for (int i = 1; i < 7; i++) {
            NotesHashMap.get(Notes.A).add(aBase * Math.pow(2, i));
            //NotesHashMap.get(Notes.A_B).add(abBase * Math.pow(2, i));
            NotesHashMap.get(Notes.B).add(bBase * Math.pow(2, i));
            NotesHashMap.get(Notes.C).add(cBase * Math.pow(2, i));
            //NotesHashMap.get(Notes.C_D).add(cdBase * Math.pow(2, i));
            NotesHashMap.get(Notes.D).add(dBase * Math.pow(2, i));
            //NotesHashMap.get(Notes.D_E).add(deBase * Math.pow(2, i));
            NotesHashMap.get(Notes.E).add(eBase * Math.pow(2, i));
            NotesHashMap.get(Notes.F).add(fbBase * Math.pow(2, i));
            //NotesHashMap.get(Notes.F_G).add(fgBase * Math.pow(2, i));
            NotesHashMap.get(Notes.G).add(gbBase * Math.pow(2, i));
            //NotesHashMap.get(Notes.G_A).add(gaBase * Math.pow(2, i));
        }
    }
}
