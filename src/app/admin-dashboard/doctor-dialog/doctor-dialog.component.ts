import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-dialog',
  templateUrl: './doctor-dialog.component.html',
  styleUrls: ['./doctor-dialog.component.css'],
})
export class DoctorDialogComponent {
  doctor = { name: '', specialty: '', availability: '', _id: '' };
  data: any;
  dialogRef: any;
  refreshData: () => void;

  constructor(private http: HttpClient) {
    this.data = this.data || {};
    this.dialogRef = this.data.dialogRef;
    this.refreshData = this.data.refreshData || (() => {});
    if (this.data.doctor) {
      this.doctor = {
        ...this.data.doctor,
        _id: this.data.doctor._id || this.data.doctor.id || '',
      };
    }
  }

  onSave() {
    if (!this.doctor.name || !this.doctor.specialty) {
      alert(
        'Please fill all required fields (Name and Specialty are mandatory)'
      );
      return;
    }
    const url = this.doctor._id
      ? `http://localhost:3000/api/doctors/${this.doctor._id}`
      : 'http://localhost:3000/api/doctors';
    const method = this.doctor._id ? this.http.put : this.http.post;
    method(url, {
      name: this.doctor.name,
      specialty: this.doctor.specialty,
      availability: this.doctor.availability,
    }).subscribe(
      () => {
        this.dialogRef.close(true);
        alert(
          this.doctor._id
            ? 'Doctor updated successfully'
            : 'Doctor added successfully'
        );
        if (typeof this.refreshData === 'function') {
          this.refreshData();
        }
      },
      (error) => {
        console.error('Error saving doctor:', error);
        alert('Error: Failed to save doctor. Check console for details.');
      }
    );
  }

  onCancel() {
    this.dialogRef.close();
  }
}
