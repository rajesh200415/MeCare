import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  displayedColumns: string[] = [
    'patientEmail',
    'patientName',
    'date',
    'time',
    'status',
    'healthDetails', // New column for health details
  ];

  doctorEmail: string = localStorage.getItem('userEmail') || '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (!this.doctorEmail) {
      console.error('No logged-in doctor found. Please log in first.');
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/appointments/doctor/${this.doctorEmail}`
      )
      .subscribe(
        (appointments) => {
          this.appointments = appointments;
          console.log('Appointments received:', appointments);
          console.log('Appointments array length:', appointments.length);
        },
        (error) => {
          console.error('Failed to load appointments:', error);
        }
      );
  }

  goBack(): void {
    this.router.navigate(['/doctor-dashboard']);
  }
}
