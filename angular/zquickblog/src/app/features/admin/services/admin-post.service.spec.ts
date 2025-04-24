import { TestBed } from '@angular/core/testing';

import { AdminPostService } from './admin-post.service';

describe('AdminPostService', () => {
  let service: AdminPostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
