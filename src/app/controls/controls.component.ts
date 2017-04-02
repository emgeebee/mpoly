import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { state } from "../mpd/reducer";

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent {

    public mpdData: state;
    constructor(private _store: Store<any>) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    public next() {
        this._store.dispatch({ type: 'SKIP' })
    }

    public prev() {
        this._store.dispatch({ type: 'SKIP', payload: -1 })
    }

    public play() {
        this._store.dispatch({ type: 'PLAY', payload: -1 })
    }

    public pause() {
        this._store.dispatch({ type: 'PAUSE', payload: -1 })
    }

}
