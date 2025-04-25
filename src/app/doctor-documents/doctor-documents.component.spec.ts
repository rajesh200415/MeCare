import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDocumentsComponent } from './doctor-documents.component';

describe('DoctorDocumentsComponent', () => {
  let component: DoctorDocumentsComponent;
  let fixture: ComponentFixture<DoctorDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorDocumentsComponent]
    });
    fixture = TestBed.createComponent(DoctorDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
