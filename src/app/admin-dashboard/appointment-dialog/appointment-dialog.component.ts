import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.css'],
})
export class AppointmentDialogComponent {
  appointment = {
    patientEmail: '',
    date: '',
    time: '',
    status: 'Pending',
    _id: '',
  };
  data: any;
  dialogRef: any;
  refreshData: () => void;

  constructor(private http: HttpClient) {
    this.data = this.data || {};
    this.dialogRef = this.data.dialogRef;
    this.refreshData = this.data.refreshData || (() => {});
    if (this.data.appointment) {
      this.appointment = {
        ...this.data.appointment,
        _id: this.data.appointment._id || this.data.appointment.id || '',
      };
    }
  }

  onSave() {
    if (
      !this.appointment.patientEmail ||
      !this.appointment.date ||
      !this.appointment.time
    ) {
      alert(
        'Please fill all required fields (Patient Email, Date, and Time are mandatory)'
      );
      return;
    }
    const url = this.appointment._id
      ? `http://localhost:3000/api/appointments/${this.appointment._id}`
      : 'http://localhost:3000/api/appointments';
    const method = this.appointment._id ? this.http.put : this.http.post;
    const payload = {
      patientEmail: this.appointment.patientEmail,
      date: this.appointment.date,
      time: this.appointment.time,
    };
    method(url, payload).subscribe(
      () => {
        this.dialogRef.close(true);
        alert(
          this.appointment._id
            ? 'Appointment updated successfully'
            : 'Appointment added successfully'
        );
        if (typeof this.refreshData === 'function') {
          this.refreshData();
        }
      },
      (error) => {
        console.error('Error saving appointment:', error);
        alert('Error: Failed to save appointment. Check console for details.');
      }
    );
  }

  onCancel() {
    this.dialogRef.close();
  }
}
