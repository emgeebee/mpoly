import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { KomponistService } from './komponist.service';
import { UtilsService } from './utils.service';
import { AppComponent } from './app.component';
import { mpd } from './mpd/reducer';
import { MpdEffects } from './mpd/effects';
import { FolderComponent } from './folder/folder.component';
import { FileComponent } from './file/file.component';
import { NowPlayingComponent } from './now-playing/now-playing.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TrackNamePipe } from './track-name.pipe';
import { IconComponent } from './icon/icon.component';
import { ControlsComponent } from './controls/controls.component';
import { StateComponent } from './state/state.component';
import { NowPlayingDetailComponent } from './now-playing-detail/now-playing-detail.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';

@NgModule({
    declarations: [
        AppComponent,
        FolderComponent,
        FileComponent,
        NowPlayingComponent,
        PlaylistComponent,
        TrackNamePipe,
        IconComponent,
        ControlsComponent,
        StateComponent,
        NowPlayingDetailComponent,
        FileExplorerComponent
    ],
    imports: [
        BrowserModule,
        StoreModule.forRoot({ mpd: mpd }),
        EffectsModule.forRoot([ MpdEffects ]),
        StoreDevtoolsModule.instrument()
    ],
    providers: [
        KomponistService,
        UtilsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
