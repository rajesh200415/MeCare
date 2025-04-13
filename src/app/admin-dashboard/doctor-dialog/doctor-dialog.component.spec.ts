import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDialogComponent } from './doctor-dialog.component';

describe('DoctorDialogComponent', () => {
  let component: DoctorDialogComponent;
  let fixture: ComponentFixture<DoctorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorDialogComponent]
    });
    fixture = TestBed.createComponent(DoctorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
