import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { mpd, state } from "../mpd/reducer";

@Component({
  selector: 'now-playing-detail',
  templateUrl: './now-playing-detail.component.html',
  styleUrls: ['./now-playing-detail.component.scss']
})
export class NowPlayingDetailComponent implements OnInit {

    public mpdData: state;
    constructor(
        private _store: Store<any>,
    ) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    ngOnInit() {
    }

}
