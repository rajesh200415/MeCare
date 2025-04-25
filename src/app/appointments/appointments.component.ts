import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  appointmentForm: FormGroup;
  doctors: any[] = [];
  timeSlots: string[] = [
    '09:00-09:30',
    '10:00-10:30',
    '11:00-11:30',
    '14:00-14:30',
    '15:00-15:30',
  ];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  displayedColumns: string[] = [
    'doctor',
    'specialty',
    'date',
    'time',
    'status',
  ];

  patientEmail: string = localStorage.getItem('userEmail') || '';
  patientName: string = localStorage.getItem('userName') || '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log('localStorage userEmail:', localStorage.getItem('userEmail'));
    console.log('localStorage userName:', localStorage.getItem('userName'));
    console.log('patientEmail:', this.patientEmail);
    console.log('patientName:', this.patientName);

    if (!this.patientEmail || !this.patientName) {
      console.error('No logged-in user found. Please log in first.');
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchDoctors();
    this.fetchAppointments();
  }

  fetchDoctors(): void {
    this.http.get<any[]>('http://localhost:3000/api/doctors').subscribe(
      (data) => {
        this.doctors = data;
        console.log('Doctors loaded:', this.doctors);
      },
      (error) => {
        console.error('Failed to load doctors:', error);
      }
    );
  }

  fetchAppointments(): void {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/appointments/patient/${this.patientEmail}`
      )
      .subscribe(
        (appointments) => {
          const currentDate = new Date();
          this.upcomingAppointments = appointments.filter(
            (a) =>
              new Date(a.date) >= currentDate &&
              a.status !== 'Canceled' &&
              a.status !== 'Rejected'
          );
          this.pastAppointments = appointments.filter(
            (a) =>
              new Date(a.date) < currentDate ||
              a.status === 'Canceled' ||
              a.status === 'Rejected'
          );
          console.log('Upcoming:', this.upcomingAppointments);
          console.log('Past:', this.pastAppointments);
        },
        (error) => {
          console.error('Failed to load appointments:', error);
        }
      );
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;
      const selectedDoctor = this.doctors.find(
        (d) => d._id === formData.doctor
      );

      if (selectedDoctor && this.patientEmail && this.patientName) {
        const newAppointment = {
          doctorId: selectedDoctor._id,
          patientEmail: this.patientEmail,
          patientName: this.patientName,
          date: formData.date,
          time: formData.time,
          status: 'Pending',
        };

        this.http
          .post('http://localhost:3000/api/appointments', newAppointment)
          .subscribe(
            (response) => {
              console.log('Appointment booked successfully:', response);
              this.appointmentForm.reset();
              this.fetchAppointments();
            },
            (error) => {
              console.error('Error booking appointment:', error);
            }
          );
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/patient-dashboard']);
  }
}
