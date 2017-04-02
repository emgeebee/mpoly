import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import { UtilsService } from './utils.service';

@Pipe({
  name: 'trackName'
})
export class TrackNamePipe implements PipeTransform {
    constructor(private utils: UtilsService, private store$: Store<any>) {
    }

    transform(item: any = { file: "" }, args?: any): string {
        if (item.Title) {
            return `${item.Title} | <span class="meta"> ${item.Album} | ${item.Artist}</span>`;
        } else {
            if (item.file) {
                return `${item.file.split("/").slice(-1)[0]}`
            }
        }
        return "";
    }

}
