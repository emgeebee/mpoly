import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CONNECTED, LOAD_FOLDER } from './mpd/reducer';

declare function komponistInit(cb: Function);
declare function require(name:string);
require('../../ext/komponist.compiled');

@Injectable()
export class KomponistService {

    private komponist$: any;

    constructor(private store$: Store<any>) {
        komponistInit(this.start.bind(this));
        setInterval(() => this.getStatus(), 1000);
    }

    start(err, komponist) {
        console.log("started", komponist, err);
        this.store$.dispatch({ type: CONNECTED });
        this.komponist$ = komponist;
        komponist.lsinfo((err, list) => {
            this.store$.dispatch({ type: LOAD_FOLDER, payload: list });
        });
        this.playlistinfo();
    }

    add(folder) {
        console.log(folder);
        this.komponist$.add(folder, (err, list, other) => {
            console.log(list, other);
        });
        this.playlistinfo();
    }

    public rescan() {
        this.komponist$.update();
    }

    public play(id: string) {
        this.komponist$.play(id, (err, list) => {
            this.playlistinfo();
        })
    }

    public pause() {
        this.komponist$.toggle(1);
    }

    playFolder(folder) {
        this.komponist$.clear((err, list, other) => {})
        this.komponist$.add(folder, (err, list, other) => {
            console.log(list, other);
        });
        this.komponist$.play((err, list, other) => {
            this.playlistinfo();
        })
    }

    list(folder) {
        this.komponist$.lsinfo(folder, (err, list, other) => {
            this.store$.dispatch({ type: 'LOAD_FOLDER', payload: list });
        });
    }

    find(type: string, what: string) {
        console.log(type, what);
        if (type && what) {
            this.komponist$.lsinfo(what, (err, list, other) => {
                console.log(list);
            });
        }
    }

    playlistinfo() {
        this.komponist$.playlistinfo((err, files) => {
            this.store$.dispatch({ type: 'UPDATE_PLAYLIST', payload: files });
            this.getStatus();
        })
    }

    next() {
        this.komponist$.next((err, files) => {
            this.store$.dispatch({ type: 'GET_PLAYLIST' });
            this.getStatus();
        })
    }

    prev() {
        this.komponist$.previous((err, files) => {
            this.store$.dispatch({ type: 'GET_PLAYLIST' });
            this.getStatus();
        })
    }

    clear() {
        this.komponist$.clear(() => {
            this.playlistinfo();
        });
    }

    getStatus() {
        this.komponist$.status((err, status) => {
            this.store$.dispatch({ type: 'UPDATE_STATUS', payload: status })
        })
    }

}
