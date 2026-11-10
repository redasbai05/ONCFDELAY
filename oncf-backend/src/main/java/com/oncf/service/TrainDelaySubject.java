package com.oncf.service;

import com.oncf.model.Voyageur;

public interface TrainDelaySubject {
    void addObserver(Voyageur voyageur);
    void removeObserver(Voyageur voyageur);
    void notifyObservers(String message);
}
