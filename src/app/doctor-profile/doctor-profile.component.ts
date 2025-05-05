import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  profileForm: FormGroup;
  doctorEmail: string = localStorage.getItem('userEmail') || '';
  doctorRole: string = localStorage.getItem('userRole') || '';
  doctorDetails: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      specialty: ['', Validators.required],
      qualifications: [''],
      experience: ['', [Validators.pattern('^[0-9]*$')]],
      contactNumber: ['', [Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      bio: [''],
    });
  }

  ngOnInit() {
    console.log('Doctor email from localStorage:', this.doctorEmail);
    console.log('Doctor role from localStorage:', this.doctorRole);

    // Check if doctorEmail and role are set correctly
    if (!this.doctorEmail || this.doctorRole !== 'Doctor') {
      console.error(
        'No logged-in doctor found or incorrect role. Redirecting to login...'
      );
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchDoctorDetails();
  }

  fetchDoctorDetails() {
    this.http
      .get(`http://localhost:3000/api/doctor/details/${this.doctorEmail}`)
      .subscribe(
        (response: any) => {
          this.doctorDetails = response.doctorDetails;
          this.profileForm.patchValue({
            name: response.user.name,
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
          if (error.status === 404) {
            alert('Doctor not found. Please log in again.');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            this.router.navigate(['/login-signup']);
          }
        }
      );
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      console.log('Submitting form with data:', {
        email: this.doctorEmail,
        name: formData.name,
        specialty: formData.specialty,
        qualifications: formData.qualifications,
        experience: formData.experience,
        contactNumber: formData.contactNumber,
        bio: formData.bio,
        availability: [],
      });
      this.http
        .post('http://localhost:3000/api/doctor/details', {
          email: this.doctorEmail,
          name: formData.name,
          specialty: formData.specialty,
          qualifications: formData.qualifications,
          experience: formData.experience,
          contactNumber: formData.contactNumber,
          bio: formData.bio,
          availability: [], // Backend expects this field
        })
        .subscribe(
          (response) => {
            console.log('Profile updated:', response);
            alert('Profile updated successfully!');
          },
          (error) => {
            console.error('Error updating profile:', error);
            if (error.status === 404) {
              alert('Doctor not found. Please log in again.');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userRole');
              this.router.navigate(['/login-signup']);
            } else {
              alert('Failed to update profile. Please try again.');
            }
          }
        );
    } else {
      alert('Please fill all required fields correctly.');
    }
  }
}
