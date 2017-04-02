import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { KomponistService } from './komponist.service';
import { UtilsService } from './utils.service';
import { mpd, state, SELECT_FOLDER, GET_PLAYLIST } from "./mpd/reducer";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public pageView = 0;
    public offset = 0;
    public mpdData: state;
    constructor(komponist: KomponistService, private utils: UtilsService, private _store: Store<any>) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    public moveTo(target: number): void {
        if (this.pageView === target) {
            return;
        }
        this.offset = 85 * target;
        this.pageView = target;
    }

}
