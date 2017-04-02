import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NowPlayingDetailComponent } from './now-playing-detail.component';

describe('NowPlayingDetailComponent', () => {
  let component: NowPlayingDetailComponent;
  let fixture: ComponentFixture<NowPlayingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NowPlayingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NowPlayingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
