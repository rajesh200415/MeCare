import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css'],
})
export class LoginSignupComponent {
  isSignInMode = false;
  roles = ['Patient', 'Admin', 'Doctor', 'Pharmacist'];
  signupForm: FormGroup;
  signinForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Patient', Validators.required],
      healthDetails: this.fb.group({
        weight: [''],
        height: [''],
        bloodGroup: [''],
      }),
    });

    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [''],
    });
  }

  // Method to check if a route is active
  isRouteActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  toggleMode() {
    this.isSignInMode = !this.isSignInMode;
    this.errorMessage = '';
  }

  onSubmit() {
    console.log(
      'onSubmit triggered. Form valid:',
      this.signupForm.valid,
      'Form value:',
      this.signupForm.value
    );
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    const signupData = { ...this.signupForm.value };
    if (signupData.role !== 'Patient') {
      delete signupData.healthDetails;
    }

    console.log('Signup attempt with data:', signupData);
    this.http.post('http://localhost:3000/user/signup', signupData).subscribe(
      (response: any) => {
        console.log('Signup successful:', response);
        this.errorMessage = '';
        alert('Signup successful! Please log in.');
        this.signupForm.reset({
          role: 'Patient',
          healthDetails: { weight: '', height: '', bloodGroup: '' },
        });
        this.toggleMode();
      },
      (error) => {
        console.error('Signup error details:', error);
        this.errorMessage = error.error?.message || 'Failed to sign up';
        if (error.status === 400)
          this.errorMessage = 'User already exists or invalid data';
        else if (error.status === 500)
          this.errorMessage = 'Server error, please try again';
      }
    );
  }

  onSignIn() {
    console.log(
      'onSignIn triggered. Form valid:',
      this.signinForm.valid,
      'Form value:',
      this.signinForm.value
    );
    if (this.signinForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    const signinData = {
      email: this.signinForm.value.email,
      password: this.signinForm.value.password,
    };
    console.log(
      'Login attempt with data:',
      signinData,
      'Selected role:',
      this.signinForm.value.role
    );
    this.http.post('http://localhost:3000/user/login', signinData).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        this.errorMessage = '';
        localStorage.setItem('user', JSON.stringify(response.user));
        const role = response.user.role;
        const route =
          role === 'Admin'
            ? '/admin-dashboard'
            : role === 'Doctor'
            ? '/doctor-dashboard'
            : '/patient-dashboard';
        this.router.navigate([route]);
      },
      (error) => {
        console.error('Login error details:', error);
        this.errorMessage = error.error?.message || 'Failed to login';
        if (error.status === 404) this.errorMessage = 'User not found';
        else if (error.status === 401)
          this.errorMessage = 'Invalid credentials';
      }
    );
  }

  get signupName() {
    return this.signupForm.get('name');
  }
  get signupEmail() {
    return this.signupForm.get('email');
  }
  get signupPassword() {
    return this.signupForm.get('password');
  }
  get signupRole() {
    return this.signupForm.get('role');
  }
  get signinEmail() {
    return this.signinForm.get('email');
  }
  get signinPassword() {
    return this.signinForm.get('password');
  }
  get signinRole() {
    return this.signinForm.get('role');
  }
}
