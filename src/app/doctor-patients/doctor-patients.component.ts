import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
  styleUrls: ['./doctor-patients.component.css'],
})
export class DoctorPatientsComponent implements OnInit {
  patients: any[] = [];
  appointments: any[] = [];
  userEmail: string;

  constructor(private http: HttpClient, private router: Router) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userEmail = user.email || '';
  }

  ngOnInit() {
    if (!this.userEmail) {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchPatients();
    this.fetchAppointments();
  }

  fetchPatients() {
    this.http
      .get<any[]>(`http://localhost:3000/api/patients/doctor/${this.userEmail}`)
      .subscribe(
        (data) => {
          this.patients = data;
        },
        (error) => {
          console.error('Error fetching patients:', error);
          this.patients = [];
        }
      );
  }

  fetchAppointments() {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/appointments/doctor/${this.userEmail}`
      )
      .subscribe(
        (data) => {
          this.appointments = data;
        },
        (error) => {
          console.error('Error fetching appointments:', error);
          this.appointments = [];
        }
      );
  }

  getPatientAppointment(patientEmail: string) {
    return this.appointments.find(
      (appointment) => appointment.patientEmail === patientEmail
    );
  }

  markAsFinished(appointmentId: string) {
    this.http
      .put(
        `http://localhost:3000/api/appointments/update-status/${appointmentId}`,
        { status: 'Finished' }
      )
      .subscribe(
        (response) => {
          console.log('Appointment marked as Finished:', response);
          this.fetchAppointments(); // Refresh the appointments list
        },
        (error) => {
          console.error('Error marking appointment as Finished:', error);
        }
      );
  }

  goBack() {
    this.router.navigate(['/doctor/dashboard']);
  }
}
