import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
})
export class PatientDetailsComponent {
  patientEmail: string = '';

  constructor(private route: ActivatedRoute) {
    this.patientEmail = this.route.snapshot.paramMap.get('patientEmail') || '';
  }
}
