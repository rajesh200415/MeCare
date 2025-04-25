import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  profileForm: FormGroup;
  doctorEmail: string = ''; // Replace with logged-in doctor's email
  doctorDetails: any = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      specialty: ['', Validators.required],
      qualifications: [''],
      experience: ['', [Validators.pattern('^[0-9]*$')]], // Only numbers allowed
      contactNumber: ['', [Validators.pattern('^\\+?[1-9]\\d{1,14}$')]], // Basic phone number validation
      bio: [''],
    });
  }

  ngOnInit() {
    this.fetchDoctorDetails();
  }

  fetchDoctorDetails() {
    this.http
      .get(`http://localhost:3000/api/doctor/details/${this.doctorEmail}`)
      .subscribe(
        (response: any) => {
          this.doctorDetails = response.doctorDetails;
          this.profileForm.patchValue({
            name: response.user.name, // Retrieve name from User collection
            specialty: this.doctorDetails?.specialty || '',
            qualifications: this.doctorDetails?.qualifications || '',
            experience: this.doctorDetails?.experience || '',
            contactNumber: this.doctorDetails?.contactNumber || '',
            bio: this.doctorDetails?.bio || '',
          });
          console.log('Doctor details loaded:', response);
        },
        (error) => {
          console.error('Error fetching doctor details:', error);
        }
      );
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      this.http
        .post('http://localhost:3000/api/doctor/details', {
          email: this.doctorEmail,
          name: formData.name, // Will be overridden by backend with User name
          specialty: formData.specialty,
          qualifications: formData.qualifications,
          experience: formData.experience,
          contactNumber: formData.contactNumber,
          bio: formData.bio,
        })
        .subscribe(
          (response) => {
            console.log('Profile updated:', response);
            alert('Profile updated successfully!');
          },
          (error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
          }
        );
    }
  }
}
