import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('300ms ease-in')),
    ]),
    trigger('slideIn', [
      state('void', style({ transform: 'translateY(20px)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => *', animate('400ms ease-out')),
    ]),
  ],
})
export class ProfileComponent implements OnInit {
  healthForm: FormGroup;
  userEmail: string;
  formState: string = '*';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userEmail = user.email || '';
    if (!this.userEmail) {
      this.errorMessage = 'No user logged in. Please log in as a patient.';
    }
    this.healthForm = this.fb.group({
      weight: ['', [Validators.required]],
      height: ['', [Validators.required]],
      bloodGroup: ['', [Validators.required]],
      allergies: [''],
      medicalHistory: [''],
      activityLevel: [0, [Validators.min(0), Validators.max(100)]],
      waterIntake: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit() {
    console.log('Profile component initialized, userEmail:', this.userEmail);
    if (this.userEmail) {
      this.fetchPatientData();
    } else {
      console.warn('No user email found, skipping fetchPatientData');
    }
  }

  fetchPatientData() {
    console.log('Fetching patient data for:', this.userEmail);
    this.http
      .get<any>(`http://localhost:3000/api/patient/${this.userEmail}`)
      .subscribe(
        (data) => {
          console.log('Fetched patient data:', data);
          this.healthForm.patchValue({
            weight: data.healthDetails?.weight || '',
            height: data.healthDetails?.height || '',
            bloodGroup: data.healthDetails?.bloodGroup || '',
            allergies: (data.healthDetails?.allergies || []).join(', ') || '',
            medicalHistory:
              (data.healthDetails?.medicalConditions || []).join(', ') || '',
            activityLevel: data.healthDetails?.activityLevel || 0,
            waterIntake: data.healthDetails?.waterIntake || 0,
          });
          this.errorMessage = '';
        },
        (error) => {
          console.error('Fetch patient data error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to fetch patient data';
        }
      );
  }

  onSubmit() {
    console.log(
      'onSubmit triggered. Form valid:',
      this.healthForm.valid,
      'Form value:',
      this.healthForm.value
    );
    if (this.healthForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }
    if (!this.userEmail) {
      this.errorMessage = 'No user logged in. Please log in as a patient.';
      return;
    }

    const updateData = {
      weight: this.healthForm.get('weight')?.value,
      height: this.healthForm.get('height')?.value,
      bloodGroup: this.healthForm.get('bloodGroup')?.value,
      allergies: this.healthForm
        .get('allergies')
        ?.value.split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a),
      medicalHistory: this.healthForm
        .get('medicalHistory')
        ?.value.split(',')
        .map((m: string) => m.trim())
        .filter((m: string) => m),
      activityLevel: this.healthForm.get('activityLevel')?.value,
      waterIntake: this.healthForm.get('waterIntake')?.value,
    };

    console.log('Updating health details for:', this.userEmail, updateData);
    this.http
      .put(
        `http://localhost:3000/api/patient/${this.userEmail}/health`,
        updateData
      )
      .subscribe(
        (response) => {
          console.log('Health details updated:', response);
          this.errorMessage = '';
          alert('Health details updated successfully!');
          this.fetchPatientData();
          // Update localStorage to reflect new health details
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem(
            'user',
            JSON.stringify({ ...user, healthDetails: updateData })
          );
        },
        (error) => {
          console.error('Update error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to update health details';
          alert('Failed to update health details: ' + this.errorMessage);
        }
      );
  }
}
