import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFinancesComponent } from './doctor-finances.component';

describe('DoctorFinancesComponent', () => {
  let component: DoctorFinancesComponent;
  let fixture: ComponentFixture<DoctorFinancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorFinancesComponent]
    });
    fixture = TestBed.createComponent(DoctorFinancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
