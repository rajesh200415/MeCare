import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMessagesComponent } from './doctor-messages.component';

describe('DoctorMessagesComponent', () => {
  let component: DoctorMessagesComponent;
  let fixture: ComponentFixture<DoctorMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorMessagesComponent]
    });
    fixture = TestBed.createComponent(DoctorMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
