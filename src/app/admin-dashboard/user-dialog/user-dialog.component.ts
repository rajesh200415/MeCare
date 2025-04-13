import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

interface UserDialogData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  healthDetails?: {
    weight?: string;
    height?: string;
    bloodGroup?: string;
  } | null; // Allow null explicitly
  _id?: string;
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css'],
})
export class UserDialogComponent {
  user: Required<
    Pick<UserDialogData, 'name' | 'email' | 'password' | 'role' | '_id'>
  > & {
    healthDetails: { weight: string; height: string; bloodGroup: string };
  };

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private http: HttpClient
  ) {
    // Ensure all required fields are initialized
    this.user = {
      name: data.name || '',
      email: data.email || '',
      password: data.password || '',
      role: data.role || 'Patient',
      _id: data._id || '',
      healthDetails: {
        weight: data.healthDetails?.weight || '',
        height: data.healthDetails?.height || '',
        bloodGroup: data.healthDetails?.bloodGroup || '',
      },
    };
    if (this.user.password && data._id) this.user.password = ''; // Clear password for edit
  }

  onSave() {
    console.log('Saving user:', this.user);
    if (
      !this.user.name ||
      !this.user.email ||
      !this.user.password ||
      !this.user.role
    ) {
      alert('Please fill all required fields');
      return;
    }
    const url = this.user._id
      ? `http://localhost:3000/api/patients/${this.user._id}`
      : 'http://localhost:3000/api/patients';
    const method = this.user._id ? this.http.put : this.http.post;
    method(url, this.user).subscribe(
      () => {
        this.dialogRef.close(true);
        alert(this.user._id ? 'Patient updated' : 'Patient added');
      },
      (error) => {
        console.error('Save error:', error);
        alert('Error saving patient');
      }
    );
  }

  onCancel() {
    console.log('Canceling dialog');
    this.dialogRef.close();
  }
}
