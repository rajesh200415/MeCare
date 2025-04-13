import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit {
  appointments: any[] = [];
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (!this.user.email || this.user.role !== 'Doctor') {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchAppointments();
  }

  fetchAppointments() {
    const token = localStorage.getItem('token');
    const requestOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
    this.http
      .get<any[]>(
        `http://localhost:3000/api/appointments/doctor/${this.user.email}`,
        requestOptions
      )
      .subscribe(
        (data) => (this.appointments = data),
        (error) => (this.errorMessage = 'Error fetching appointments')
      );
  }

  approveAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const requestOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
    this.http
      .put(
        `http://localhost:3000/api/appointments/${appointmentId}/approve`,
        {},
        requestOptions
      )
      .subscribe(
        () => {
          this.fetchAppointments();
          alert(`Appointment ${appointmentId} approved. Patient notified!`);
        },
        (error) => (this.errorMessage = 'Error approving appointment')
      );
  }

  rejectAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const requestOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
    this.http
      .put(
        `http://localhost:3000/api/appointments/${appointmentId}/reject`,
        {},
        requestOptions
      )
      .subscribe(
        () => {
          this.fetchAppointments();
          alert(`Appointment ${appointmentId} rejected. Patient notified!`);
        },
        (error) => (this.errorMessage = 'Error rejecting appointment')
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login-signup']);
  }
}
