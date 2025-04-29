import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    'queuePosition',
    'actions',
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
            (response: any) => {
              console.log('Appointment booked successfully:', response);
              if (response.queuePosition > 0) {
                alert(
                  `You are in the queue (Position: ${response.queuePosition}). You can opt for a virtual appointment instead.`
                );
              } else {
                alert('Appointment confirmed successfully!');
              }
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

  generateReceipt(appointment: any): void {
    const doc = new jsPDF();
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '12px';
    element.style.width = '500px';
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #1e3a8a; margin: 0;">MeCare</h1>
        <h2 style="font-size: 16px; color: #333; margin: 5px 0;">Appointment Receipt</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f1f5f9;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Details</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Patient Name</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            this.patientName
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Patient Email</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            this.patientEmail
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Doctor</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            appointment.doctorId.name
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Specialty</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            appointment.doctorId.specialty
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Date</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            appointment.date
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Time</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            appointment.time
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Status</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            appointment.status
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Receipt Date</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${new Date().toLocaleDateString()}</td>
        </tr>
      </table>
    `;

    document.body.appendChild(element);

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
      doc.save(`appointment_receipt_${appointment._id}.pdf`);
      document.body.removeChild(element);
    });
  }

  optForVirtualAppointment(appointment: any): void {
    this.http
      .put(
        `http://localhost:3000/api/appointments/${appointment._id}/virtual`,
        {}
      )
      .subscribe(
        (response: any) => {
          console.log('Appointment set to virtual:', response);
          this.router.navigate(['/virtual-appointment'], {
            state: { appointment: response.appointment },
          });
          this.fetchAppointments();
        },
        (error) => {
          console.error('Error setting virtual appointment:', error);
          alert('Failed to set virtual appointment. Please try again.');
        }
      );
  }
}
