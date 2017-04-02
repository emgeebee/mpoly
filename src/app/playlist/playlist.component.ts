import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { mpd, state, SELECT_FOLDER, GET_PLAYLIST } from "../mpd/reducer";

@Component({
  selector: 'playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

    public mpdData: state;
    constructor(private _store: Store<any>) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    ngOnInit() {
    }

    public play(id: string): void {
        this._store.dispatch({ type: 'PLAY', payload: id})
    }

    public clear(): void {
        this._store.dispatch({ type: 'CLEAR', })
    }

}
