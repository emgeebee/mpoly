import { TestBed, inject } from '@angular/core/testing';

import { KomponistService } from './komponist.service';

describe('KomponistService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KomponistService]
    });
  });

  it('should be created', inject([KomponistService], (service: KomponistService) => {
    expect(service).toBeTruthy();
  }));
});
