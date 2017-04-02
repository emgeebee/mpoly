import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SELECT_FOLDER, PLAY_FOLDER, ADD_FOLDER } from "../mpd/reducer";

@Component({
  selector: 'folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent {

    @Input() item;
    constructor(private _store: Store<any>) {}

    selectDirectory(item) {
        this._store.dispatch({ type: SELECT_FOLDER, payload: item})
    }
    playDirectory(item) {
        this._store.dispatch({ type: PLAY_FOLDER, payload: item.directory })
    }
    addDirectory(item) {
        this._store.dispatch({ type: ADD_FOLDER, payload: item.directory })
    }

}
