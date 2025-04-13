import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('500ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class AppointmentsComponent implements OnInit {
  selectedDoctor: any = null;
  appointmentDate: string = '';
  appointmentTime: string = '';
  errorMessage: string = '';
  calendarDays: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  availableDoctors: any[] = [];
  existingAppointments: any[] = [];
  pastAppointments: any[] = [];
  patientEmail: string = 'patient@example.com'; // Replace with logged-in user email

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    console.log('Component initialized');
    this.loadDoctors();
    this.loadAppointments();
  }

  loadDoctors() {
    this.http.get<any[]>('http://localhost:3000/api/doctors').subscribe(
      (doctors) => {
        this.availableDoctors = doctors;
        console.log('Doctors loaded:', doctors);
      },
      (error) => console.error('Failed to load doctors:', error)
    );
  }

  loadAppointments() {
    this.http
      .get<any[]>(
        'http://localhost:3000/api/appointments/patient/' + this.patientEmail
      )
      .subscribe(
        (appointments) => {
          this.existingAppointments = appointments.filter((a) =>
            ['Pending', 'Confirmed'].includes(a.status)
          );
          this.pastAppointments = appointments.filter(
            (a) => a.status === 'Completed'
          );
          console.log('Appointments loaded:', appointments);
        },
        (error) => console.error('Failed to load appointments:', error)
      );
  }

  onDoctorChange() {
    console.log('Doctor changed to:', this.selectedDoctor);
    this.appointmentDate = '';
    this.appointmentTime = '';
  }

  isFormValid(): boolean {
    return (
      !!this.selectedDoctor && !!this.appointmentDate && !!this.appointmentTime
    );
  }

  bookAppointment() {
    console.log('Booking attempt - Data:', {
      doctorId: this.selectedDoctor?._id,
      patientEmail: this.patientEmail,
      date: this.appointmentDate,
      time: this.appointmentTime,
      status: 'Pending',
    });
    if (this.isFormValid()) {
      const appointmentData = {
        doctorId: this.selectedDoctor._id,
        patientEmail: this.patientEmail,
        date: this.appointmentDate,
        time: this.appointmentTime,
        status: 'Pending',
      };
      this.http
        .post('http://localhost:3000/api/appointments', appointmentData)
        .subscribe(
          (response: any) => {
            console.log('Appointment booked successfully:', response);
            this.errorMessage = '';
            this.selectedDoctor = null;
            this.appointmentDate = '';
            this.appointmentTime = '';
            this.loadAppointments(); // Refresh appointments
          },
          (error) => {
            console.error('Booking error:', error);
            this.errorMessage =
              error.error?.message || 'Failed to book appointment';
            if (error.status === 404) this.errorMessage = 'Doctor not found';
            else if (error.status === 500)
              this.errorMessage = 'Server error, please try again';
          }
        );
    } else {
      this.errorMessage = 'Please fill all fields';
      console.log('Booking failed - Form invalid');
    }
  }

  cancelAppointment(id: string) {
    console.log('Canceling appointment with id:', id);
    this.http.delete(`http://localhost:3000/api/appointments/${id}`).subscribe(
      (response) => {
        console.log('Appointment canceled:', response);
        this.loadAppointments();
      },
      (error) => console.error('Cancel error:', error)
    );
  }

  rescheduleAppointment(id: string) {
    console.log('Rescheduling appointment with id:', id);
    alert('Reschedule functionality to be implemented');
  }

  goBack() {
    console.log('Navigating back to dashboard');
    this.router.navigate(['/patient-dashboard']);
  }
}
