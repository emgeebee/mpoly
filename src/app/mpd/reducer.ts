// counter.ts
import { Action } from '@ngrx/store';
import * as path from 'path';

export const LOAD_FOLDER = 'LOAD_FOLDER';
export const CONNECTED = 'CONNECTED';
export const RESCAN = 'RESCAN';
export const SELECT_FOLDER = 'SELECT_FOLDER';
export const PLAY_FOLDER = 'PLAY_FOLDER';
export const PLAY = 'PLAY';
export const PAUSE = 'PAUSE';
export const ADD_FOLDER = 'ADD_FOLDER';
export const GET_PLAYLIST = 'GET_PLAYLIST';
export const UPDATE_PLAYLIST = 'UPDATE_PLAYLIST';
export const SKIP = 'SKIP';
export const CLEAR = 'CLEAR';
export const UPDATE_STATUS = 'UPDATE_STATUS';
export const FIND = 'FIND';

const defaultState = {
    connected: false,
    currentFolder: "/",
    folderList: [],
    nowPlaying: "",
    percentPlayed: 0,
    playlist: [],
    rescanInProgress: false,
    state: {}
}

export interface state {
    connected: boolean;
    currentFolder: string;
    folderList: string[];
    nowPlaying: string;
    percentPlayed: number;
    playlist: any[];
    rescanInProgress: boolean;
    state: any;
}

export function mpd(state: state = defaultState, action: any) {
	switch (action.type) {
		case LOAD_FOLDER:
			state.folderList = Array.isArray(action.payload) ? action.payload : [action.payload];
            return state;

		case CONNECTED:
			state.connected = true;
            return state;

		case RESCAN:
			state.rescanInProgress = true;
            return state;

		case SELECT_FOLDER:
			state.currentFolder = path.join(state.currentFolder, action.payload);
            return state;

        case UPDATE_PLAYLIST:
            state.playlist = action.payload;
            return state;

        case UPDATE_STATUS:
            state.state = action.payload;
            let nowPlaying = state.playlist[state.state.song];
            if (nowPlaying) {
                nowPlaying.nowPlaying = true;
                state.nowPlaying = nowPlaying;
            }
            state.percentPlayed = (state.state.elapsed / state.state.duration) * 100;

            return state;

		default:
			return state;
	}
}
