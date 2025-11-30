import { TestBed } from '@angular/core/testing';

import { SqliteServiceService } from './sqlite-service.service';

describe('SqliteServiceService', () => {
  let service: SqliteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
