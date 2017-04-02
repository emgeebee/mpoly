import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

    constructor() { }

    public getTrackName(fullpath: string): string {
        return fullpath.split('/').slice(-1).pop().split('.').slice(0, -1).join('.').replace(/^[\d]{0,3}[-]?[\d]{0,3}/, '');
    }

}
