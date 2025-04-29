import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualAppointmentComponent } from './virtual-appointment.component';

describe('VirtualAppointmentComponent', () => {
  let component: VirtualAppointmentComponent;
  let fixture: ComponentFixture<VirtualAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualAppointmentComponent]
    });
    fixture = TestBed.createComponent(VirtualAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
