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
    this.http
      .get<any[]>('http://localhost:3000/api/appointments', {
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          console.log(
            '[' + new Date().toISOString() + '] Full API response:',
            response
          );
          this.appointments = response.body || [];
          console.log(
            '[' + new Date().toISOString() + '] Fetched appointments:',
            this.appointments
          );
          if (this.appointments.length === 0) {
            this.errorMessage = 'No appointments found.';
          } else {
            this.errorMessage = '';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Error fetching appointments: ' + err.message;
          console.error('[' + new Date().toISOString() + '] Fetch error:', err);
          this.appointments = [];
          this.cdr.detectChanges();
        },
      });
  }

  updateStatus(appointment: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.trim().toLowerCase();

    if (!appointment._id) {
      this.errorMessage = 'Appointment ID missing';
      console.error(
        '[' + new Date().toISOString() + '] No appointment ID:',
        appointment
      );
      return;
    }

    if (inputValue === 'present') {
      const url = `http://localhost:3000/api/appointments/update-status/${appointment._id}`;
      console.log(
        '[' + new Date().toISOString() + '] Sending PUT request to: ' + url
      );
      this.http.put(url, { status: 'Present' }).subscribe({
        next: (response) => {
          console.log(
            '[' + new Date().toISOString() + '] Update status response:',
            response
          );
          this.successMessage = 'Appointment status updated to Present';
          this.errorMessage = '';
          this.fetchAppointments();
        },
        error: (err) => {
          this.errorMessage = `Failed to update appointment status: ${err.status} - ${err.statusText} - ${err.message}`;
          this.successMessage = '';
          console.error(
            '[' + new Date().toISOString() + '] Update status error:',
            err
          );
          console.error('Error details:', JSON.stringify(err.error, null, 2));
        },
        complete: () => {
          console.log(
            '[' + new Date().toISOString() + '] Update status request completed'
          );
        },
      });
    }
  }

  logout(): void {
    console.log('[' + new Date().toISOString() + '] Logout button clicked');
    console.log(
      '[' + new Date().toISOString() + '] Current localStorage user:',
      localStorage.getItem('user')
    );
    localStorage.removeItem('user');
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

  goBack(): void {
    this.router.navigateByUrl('/homepage').then(
      () => {
        console.log(
          '[' + new Date().toISOString() + '] Navigated to /homepage'
        );
      },
      (err) => {
        this.errorMessage = 'Navigation to homepage failed';
        console.error(
          '[' + new Date().toISOString() + '] Navigation error:',
          err
        );
      }
    );
  }

  trackById(index: number, appointment: any): string {
    return appointment._id || index.toString();
  }
}
