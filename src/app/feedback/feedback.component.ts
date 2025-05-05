import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface FeedbackForm {
  appointmentId: string;
  doctorId: string;
  patientEmail: string;
  communication: number;
  professionalism: number;
  knowledge: number;
  empathy: number;
  overallSatisfaction: number;
  comments: string;
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent implements OnInit {
  appointments: any[] = [];
  selectedAppointmentId: string = '';
  selectedDoctorId: string = '';
  feedback: FeedbackForm = {
    appointmentId: '',
    doctorId: '',
    patientEmail: '',
    communication: 0,
    professionalism: 0,
    knowledge: 0,
    empathy: 0,
    overallSatisfaction: 0,
    comments: '',
  };
  message: string = '';
  error: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'Patient') {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.feedback.patientEmail = user.email;
    this.loadAppointments(user.email);
  }

  loadAppointments(patientEmail: string): void {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/appointments/patient/${patientEmail}`
      )
      .subscribe({
        next: (appointments) => {
          // Only show appointments that are "Completed" or "Finished" and have not been reviewed yet
          this.http
            .get<any[]>(
              `http://localhost:3000/api/feedback/patient/${patientEmail}`
            )
            .subscribe({
              next: (feedbacks) => {
                const reviewedAppointmentIds = feedbacks.map((fb) =>
                  fb.appointmentId.toString()
                );
                this.appointments = appointments.filter(
                  (app) =>
                    (app.status === 'Completed' || app.status === 'Finished') &&
                    !reviewedAppointmentIds.includes(app._id.toString())
                );
              },
              error: (err) => {
                console.error('Error fetching existing feedbacks:', err);
                this.message = 'Failed to load existing feedbacks';
                this.error = true;
              },
            });
        },
        error: (err) => {
          console.error('Error fetching appointments:', err);
          this.message = 'Failed to load appointments';
          this.error = true;
        },
      });
  }

  onAppointmentChange(): void {
    const selectedAppointment = this.appointments.find(
      (app) => app._id === this.selectedAppointmentId
    );
    if (selectedAppointment) {
      this.feedback.appointmentId = this.selectedAppointmentId;
      this.feedback.doctorId = selectedAppointment.doctorId._id;
    }
  }

  submitFeedback(): void {
    // Validate that all ratings are provided (between 1 and 5)
    const ratings = [
      this.feedback.communication,
      this.feedback.professionalism,
      this.feedback.knowledge,
      this.feedback.empathy,
      this.feedback.overallSatisfaction,
    ];
    if (ratings.some((rating) => rating < 1 || rating > 5)) {
      this.message = 'Please provide all ratings (1-5) before submitting.';
      this.error = true;
      return;
    }

    // Calculate average rating for backend
    const averageRating =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    // Prepare feedback data with all fields
    const feedbackData = {
      appointmentId: this.feedback.appointmentId,
      doctorId: this.feedback.doctorId,
      patientEmail: this.feedback.patientEmail,
      communication: this.feedback.communication,
      professionalism: this.feedback.professionalism,
      knowledge: this.feedback.knowledge,
      empathy: this.feedback.empathy,
      overallSatisfaction: this.feedback.overallSatisfaction,
      comments: this.feedback.comments,
      rating: averageRating,
    };

    this.http
      .post<any>('http://localhost:3000/api/feedback', feedbackData)
      .subscribe({
        next: (response) => {
          this.message = 'Feedback submitted successfully';
          this.error = false;
          this.resetForm();
          this.loadAppointments(this.feedback.patientEmail); // Reload appointments to remove the reviewed one
        },
        error: (err) => {
          console.error('Error submitting feedback:', err);
          this.message = 'Failed to submit feedback';
          this.error = true;
        },
      });
  }

  resetForm(): void {
    this.selectedAppointmentId = '';
    this.selectedDoctorId = '';
    this.feedback = {
      appointmentId: '',
      doctorId: '',
      patientEmail: this.feedback.patientEmail,
      communication: 0,
      professionalism: 0,
      knowledge: 0,
      empathy: 0,
      overallSatisfaction: 0,
      comments: '',
    };
  }

  getMessageClasses(): { [key: string]: boolean } {
    return {
      'bg-green-100': !this.error,
      'text-green-700': !this.error,
      'bg-red-100': this.error,
      'text-red-700': this.error,
    };
  }
}
