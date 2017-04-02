import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { state } from "../mpd/reducer";

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent {

    public mpdData: state;
    constructor(private _store: Store<any>) {
        this._store
        .select('mpd')
        .subscribe(state => {
            this.mpdData = state;
        });
    }

    public selectParent(): void {
        this._store.dispatch({ type: 'SELECT_FOLDER', payload: '..' })
    }


}
