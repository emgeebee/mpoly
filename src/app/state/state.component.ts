import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { state } from "../mpd/reducer";

@Component({
  selector: 'state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css']
})
export class StateComponent {

    public mpdData: state;
    constructor(private _store: Store<any>) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    public rescan() {
        this._store.dispatch({ type: 'RESCAN' })
    }

}
