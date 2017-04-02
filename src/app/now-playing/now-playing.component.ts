import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { state } from "../mpd/reducer";

@Component({
  selector: 'now-playing',
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss']
})
export class NowPlayingComponent {

    public mpdData: state;
    constructor(private _store: Store<any> ) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

}
