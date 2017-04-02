import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import * as path from 'path';

import { KomponistService } from '../komponist.service';

@Injectable()
export class MpdEffects {
    constructor(
        private actions$: Actions,
        private store$: Store<any>,
        private komponist: KomponistService
    ) { }

    @Effect({ dispatch: false }) select$ = this.actions$
    .ofType('SELECT_FOLDER')
    .withLatestFrom(this.store$)
    .do(([action, storeState]) => {
        this.komponist.list(storeState.mpd.currentFolder.substr(1));
    });

    @Effect({ dispatch: false }) playFolder$ = this.actions$
    .ofType('PLAY_FOLDER')
    .do((action: any) => {
        this.komponist.playFolder(action.payload);
    });

    @Effect({ dispatch: false }) play$ = this.actions$
    .ofType('PLAY')
    .do((action: any) => {
        this.komponist.play(action.payload);
    });

    @Effect({ dispatch: false }) pause$ = this.actions$
    .ofType('PAUSE')
    .do((action: any) => {
        this.komponist.pause();
    });

    @Effect({ dispatch: false }) add$ = this.actions$
    .ofType('ADD_FOLDER')
    .do((action: any) => {
        this.komponist.add(action.payload);
    });

    @Effect({ dispatch: false }) clear$ = this.actions$
    .ofType('CLEAR')
    .do((action: any) => {
        this.komponist.clear();
    });

    @Effect({ dispatch: false }) getPlaylist$ = this.actions$
    .ofType('GET_PLAYLIST')
    .do((action: any) => {
        this.komponist.playlistinfo();
    });

    @Effect({ dispatch: false }) find$ = this.actions$
    .ofType('FIND')
    .do((action: any) => {
        this.komponist.find(action.payload.type, action.payload.what);
    });

    @Effect({ dispatch: false }) rescan= this.actions$
    .ofType('RESCAN')
    .do((action: any) => {
        this.komponist.rescan();
    });

    @Effect({ dispatch: false }) skip$ = this.actions$
    .ofType('SKIP')
    .do((action: any) => {
        switch(action.payload) {
            case -1:
                this.komponist.prev();
            default:
                this.komponist.next();
        }
    });

    // @Effect() load$ = this.actions$
    // .ofType('LOAD_FOLDER')
    // .map(action => path.join(state.currentFolder, action.payload))
    // .switchMap(payload => setTimeout(() => this._store.dispatch({type: 'LOAD_FOLDER', payload: payload})));
}
