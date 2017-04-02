import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { PLAY_FOLDER, ADD_FOLDER } from "../mpd/reducer";

@Component({
    selector: 'file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss']
})
export class FileComponent {

    @Input() item;
    constructor(private _store: Store<any>) {}

    playDirectory(item) {
        this._store.dispatch({ type: PLAY_FOLDER, payload: item.file })
    }
    addDirectory(item) {
        this._store.dispatch({ type: ADD_FOLDER, payload: item.file })
    }

}
