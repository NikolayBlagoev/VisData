import { TestBed } from '@angular/core/testing';

import { EntryTreeService } from './entry-tree.service';

describe('EntryTreeService', () => {
  let service: EntryTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntryTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
