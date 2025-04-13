import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('500ms ease-in', style({ opacity: 1 }))]),
    ]),
    trigger('slideInSidebar', [
      state('hidden', style({ transform: 'translateX(-100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('hidden => visible', [animate('700ms ease-out')]),
    ]),
    trigger('hover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
  ],
})
export class PatientDashboardComponent implements OnInit {
  sidebarState = 'hidden';
  buttonStates = new Map<string, string>();
  isLoggedIn = false;

  patientName = '';
  userEmail: string | null = null;
  currentVitals: any = {};
  vitals: any[] = [];
  appointments: any[] = [];

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit() {
    console.log('ngOnInit called');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user);
    this.userEmail = user.email || null;
    this.patientName = user.name || 'Unknown Patient';
    console.log('userEmail:', this.userEmail);
    console.log('patientName (from localStorage):', this.patientName);

    if (!this.userEmail) {
      this.isLoggedIn = false;
      console.log('isLoggedIn set to false');
    } else {
      this.isLoggedIn = true;
      console.log('isLoggedIn set to true');
      setTimeout(() => {
        this.sidebarState = 'visible';
        console.log('sidebarState changed to:', this.sidebarState);
      }, 100);
      this.fetchPatientData();
    }
  }

  fetchPatientData() {
    if (this.userEmail) {
      console.log('Fetching patient data for email:', this.userEmail);
      this.http
        .get(`http://localhost:3000/user/health-details/${this.userEmail}`)
        .subscribe(
          (response: any) => {
            console.log('Fetched patient data:', response);
            if (response.name) {
              this.patientName = response.name;
            }
            this.currentVitals = {
              name: this.patientName,
              weight: response.healthDetails?.weight || 'N/A',
              height: response.healthDetails?.height || 'N/A',
              bloodGroup: response.healthDetails?.bloodGroup || 'N/A',
            };
            console.log('patientName (after response):', this.patientName);
            console.log(
              'healthDetails (from response):',
              response.healthDetails
            );
            console.log('currentVitals:', this.currentVitals);
          },
          (error) => {
            console.error('Error fetching patient data:', error);
            this.currentVitals = {
              name: this.patientName,
              weight: 'N/A',
              height: 'N/A',
              bloodGroup: 'N/A',
            };
            console.log('patientName (error fallback):', this.patientName);
            console.log('currentVitals (error fallback):', this.currentVitals);
          }
        );
    } else {
      console.log('No userEmail, skipping fetchPatientData');
    }
  }

  updateButtonState(option: string, state: string) {
    this.buttonStates.set(option, state);
  }

  login() {
    this.router.navigate(['/login-signup']);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login-signup']);
    console.log('User logged out');
  }

  debugLog(message: string) {
    console.log(message);
    return '';
  }
}
