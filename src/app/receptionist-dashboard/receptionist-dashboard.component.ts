import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receptionist-dashboard',
  templateUrl: './receptionist-dashboard.component.html',
  styleUrls: ['./receptionist-dashboard.component.css'],
})
export class ReceptionistDashboardComponent implements OnInit {
  appointments: any[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.http.get<any[]>('http://localhost:3000/api/appointments').subscribe({
      next: (data) => {
        this.appointments = data;
        console.log(
          '[' + new Date().toISOString() + '] Fetched appointments:',
          data
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error fetching appointments: ' + err.message;
        console.error('[' + new Date().toISOString() + '] Fetch error:', err);
      },
    });
  }

  onAction(action: 'confirm' | 'cancel', appointment: any): void {
    console.log(
      '[' +
        new Date().toISOString() +
        '] ' +
        action +
        ' clicked for appointment ID: ' +
        appointment._id,
      appointment
    );
    if (!appointment._id) {
      this.errorMessage = 'Appointment ID missing';
      console.error(
        '[' + new Date().toISOString() + '] No appointment ID:',
        appointment
      );
      return;
    }

    const url = `http://localhost:3000/api/appointments/${action}/${appointment._id}`;
    console.log(
      '[' + new Date().toISOString() + '] Sending PUT request to: ' + url
    );
    this.http.put(url, {}).subscribe({
      next: (response) => {
        console.log(
          '[' + new Date().toISOString() + '] ' + action + ' response:',
          response
        );
        this.successMessage = `Appointment ${action}ed successfully`;
        this.errorMessage = '';
        this.fetchAppointments();
      },
      error: (err) => {
        this.errorMessage = `Failed to ${action} appointment: ${err.status} - ${err.statusText} - ${err.message}`;
        this.successMessage = '';
        console.error(
          '[' + new Date().toISOString() + '] ' + action + ' error:',
          err
        );
        console.error('Error details:', err.error);
      },
      complete: () => {
        console.log(
          '[' + new Date().toISOString() + '] ' + action + ' request completed'
        );
      },
    });
  }

  logout(): void {
    console.log('[' + new Date().toISOString() + '] Logout button clicked');
    console.log(
      '[' + new Date().toISOString() + '] Current localStorage user:',
      localStorage.getItem('user')
    );
    localStorage.removeItem('user'); // Clear user session
    console.log(
      '[' + new Date().toISOString() + '] After clearing, localStorage user:',
      localStorage.getItem('user')
    );
    this.router.navigate(['/home']).then(
      () => {
        console.log(
          '[' + new Date().toISOString() + '] Navigation to /home successful'
        );
      },
      (err) => {
        this.errorMessage = 'Logout navigation failed';
        console.error(
          '[' + new Date().toISOString() + '] Navigation error:',
          err
        );
      }
    );
  }

  trackById(index: number, appointment: any): string {
    return appointment._id; // Track appointments by their unique _id
  }
  goBack(): void {
    this.router.navigateByUrl('/homepage').then(
      () => {
        console.log(
          '[' + new Date().toISOString() + '] Navigated to /homepage'
        );
      },
      (err) => {
        this.errorMessage = 'Navigation to homepage failed';
        console.error('Navigation error:', err);
      }
    );
  }
}
