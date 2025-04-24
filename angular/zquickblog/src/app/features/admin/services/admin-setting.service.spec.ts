import { TestBed } from '@angular/core/testing';

import { AdminSettingService } from './admin-setting.service';

describe('AdminSettingService', () => {
  let service: AdminSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
