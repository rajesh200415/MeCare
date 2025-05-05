import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css'],
})
export class PrescriptionsComponent implements OnInit {
  userRole: string = localStorage.getItem('userRole') || '';
  userEmail: string = localStorage.getItem('userEmail') || '';
  prescriptions: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    console.log('PrescriptionsComponent ngOnInit - userEmail:', this.userEmail);
    console.log('PrescriptionsComponent ngOnInit - userRole:', this.userRole);

    if (!this.userEmail || !this.userRole) {
      console.error('No logged-in user found. Redirecting to login-signup.');
      this.router.navigate(['/login-signup']);
      return;
    }

    const roleLowerCase = this.userRole.toLowerCase();
    if (roleLowerCase === 'patient') {
      this.fetchPatientPrescriptions();
    } else if (roleLowerCase === 'doctor') {
      this.fetchDoctorPrescriptions();
    } else {
      console.error(
        'Invalid user role:',
        this.userRole,
        '. Redirecting to login-signup.'
      );
      this.router.navigate(['/login-signup']);
    }
  }

  fetchPatientPrescriptions() {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/prescriptions/patient/${this.userEmail}`
      )
      .subscribe(
        (data) => {
          console.log('Fetched patient prescriptions:', data);
          this.prescriptions = data;
        },
        (error) => {
          console.error('Error fetching patient prescriptions:', error);
          this.prescriptions = [];
        }
      );
  }

  fetchDoctorPrescriptions() {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/prescriptions/doctor/${this.userEmail}`
      )
      .subscribe(
        (data) => {
          console.log('Fetched doctor prescriptions:', data);
          this.prescriptions = data;
        },
        (error) => {
          console.error('Error fetching doctor prescriptions:', error);
          this.prescriptions = [];
        }
      );
  }

  goBack() {
    const roleLowerCase = this.userRole.toLowerCase();
    if (roleLowerCase === 'patient') {
      this.router.navigate(['/patient-dashboard']);
    } else if (roleLowerCase === 'doctor') {
      this.router.navigate(['/doctor/dashboard']);
    } else {
      this.router.navigate(['/homepage']);
    }
  }
}
