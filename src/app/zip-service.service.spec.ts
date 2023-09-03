import { TestBed } from '@angular/core/testing';

import { ZipService } from './zip-service.service';

describe('ZipServiceService', () => {
  let service: ZipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
