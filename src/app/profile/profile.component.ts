import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('500ms ease-in', style({ opacity: 1 }))]),
    ]),
    trigger('slideIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('500ms ease-out')]),
    ]),
  ],
})
export class ProfileComponent implements OnInit {
  healthForm: FormGroup;
  formState = 'hidden';
  userEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.healthForm = this.fb.group({
      weight: ['', Validators.required],
      height: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      allergies: [''],
      medicalHistory: [''],
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userEmail = user.email;

    if (!this.userEmail) {
      alert('Please log in to update your health details.');
      this.router.navigate(['/login-signup']);
      return;
    }

    this.http
      .get(`http://localhost:3000/user/health-details/${this.userEmail}`)
      .subscribe(
        (response: any) => {
          if (response.healthDetails) {
            this.healthForm.patchValue(response.healthDetails);
          }
          this.formState = 'visible';
        },
        (error) => {
          console.error('Error fetching health details:', error);
          this.formState = 'visible';
        }
      );
  }

  onSubmit() {
    if (this.healthForm.valid && this.userEmail) {
      const healthDetails = this.healthForm.value;
      this.http
        .put(
          `http://localhost:3000/user/health-details/${this.userEmail}`,
          healthDetails
        )
        .subscribe(
          (response) => {
            console.log('Health details updated:', response);
            alert('Health details updated successfully!');
          },
          (error) => {
            console.error('Error updating health details:', error);
            alert('Failed to update health details. Please try again.');
          }
        );
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
