import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  userEmail: string;
  userRole: string;
  doctorEmail: string; // For admin to specify which doctor's feedback to view

  constructor(private http: HttpClient, private router: Router) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userEmail = user.email || '';
    this.userRole = user.role || '';
    this.doctorEmail = this.userRole === 'Admin' ? '' : this.userEmail; // Default to logged-in doctor's email
  }

  ngOnInit() {
    if (!this.userEmail) {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchFeedback();
  }

  fetchFeedback() {
    const emailToFetch =
      this.userRole === 'Admin' && this.doctorEmail
        ? this.doctorEmail
        : this.userEmail;
    const endpoint =
      this.userRole === 'Admin' && this.doctorEmail
        ? `/api/admin/feedback/doctor/${emailToFetch}`
        : `/api/feedback/doctor/${emailToFetch}`;

    this.http.get<any[]>(`http://localhost:3000${endpoint}`).subscribe(
      (data) => {
        this.feedbacks = data;
      },
      (error) => {
        console.error('Error fetching feedback:', error);
        this.feedbacks = [];
      }
    );
  }

  // For admin to select a doctor
  setDoctorEmail(email: string) {
    this.doctorEmail = email;
    this.fetchFeedback();
  }

  goBack() {
    if (this.userRole === 'Doctor') {
      this.router.navigate(['/doctor/dashboard']);
    } else if (this.userRole === 'Admin') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
