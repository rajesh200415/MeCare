import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPatientsComponent } from './doctor-patients.component';

describe('DoctorPatientsComponent', () => {
  let component: DoctorPatientsComponent;
  let fixture: ComponentFixture<DoctorPatientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorPatientsComponent]
    });
    fixture = TestBed.createComponent(DoctorPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
