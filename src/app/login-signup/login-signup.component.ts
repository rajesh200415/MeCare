import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Custom validator for password with at least 1 special character and 1 number
function passwordValidator(control: any) {
  const value = control.value || '';
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasSpecialChar && hasNumber ? null : { invalidPassword: true };
}

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css'],
})
export class LoginSignupComponent {
  isSignInMode = false;
  roles = ['Patient', 'Doctor', 'Pharmacist', 'Admin', 'Receptionist'];
  specialties = [
    'General Practitioner',
    'Internal Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
  ];
  signupForm: FormGroup;
  signinForm: FormGroup;
  errorMessage: string = '';
  passwordStrength: string = ''; // To store and display password strength

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), passwordValidator],
      ],
      role: ['Patient', Validators.required],
      specialty: [''],
      healthDetails: this.fb.group({
        weight: [''],
        height: [''],
        bloodGroup: [''],
      }),
    });

    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Subscribe to password changes to evaluate strength
    this.signupForm.get('password')?.valueChanges.subscribe((password) => {
      this.updatePasswordStrength(password);
    });

    this.signupForm.get('role')?.valueChanges.subscribe((role) => {
      const specialtyControl = this.signupForm.get('specialty');
      if (role === 'Doctor') {
        specialtyControl?.setValidators(Validators.required);
      } else {
        specialtyControl?.clearValidators();
      }
      specialtyControl?.updateValueAndValidity();
    });
  }

  // Method to evaluate and update password strength
  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const length = password.length;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    let strength = 0;

    if (length >= 6) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;
    if (hasUpperCase) strength += 1;

    switch (strength) {
      case 1:
      case 2:
        this.passwordStrength = 'Weak';
        break;
      case 3:
        this.passwordStrength = 'Medium';
        break;
      case 4:
        this.passwordStrength = 'Strong';
        break;
      default:
        this.passwordStrength = 'Very Weak';
    }
    this.cdr.detectChanges(); // Ensure UI updates
  }

  isRouteActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  toggleMode() {
    this.isSignInMode = !this.isSignInMode;
    this.errorMessage = '';
    this.passwordStrength = ''; // Reset password strength when toggling
  }

  onSignupSubmit() {
    console.log(
      'onSignupSubmit triggered. Form valid:',
      this.signupForm.valid,
      'Form value:',
      this.signupForm.value,
      'Form errors:',
      this.signupForm.errors
    );
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      console.log('Form validation errors:', this.signupForm.errors);
      return;
    }

    const signupData = { ...this.signupForm.value };
    if (signupData.role !== 'Patient') {
      delete signupData.healthDetails;
    }
    if (signupData.role !== 'Doctor') {
      delete signupData.specialty;
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
          specialty: '',
        });
        this.toggleMode();
      },
      (error) => {
        console.error('Signup error details:', error);
        if (error.status === 400) {
          this.errorMessage =
            error.error?.message || 'User already exists or invalid data';
          if (error.error?.message === 'User already exists') {
            console.log('Duplicate email detected:', signupData.email);
          }
        } else if (error.status === 500) {
          this.errorMessage = 'Server error, please try again';
        } else {
          this.errorMessage =
            'Failed to sign up: ' + (error.error?.message || 'Unknown error');
        }
        console.log('Error response:', error.error);
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
    console.log('Login attempt with data:', signinData);
    this.http.post('http://localhost:3000/user/login', signinData).subscribe(
      (response: any) => {
        console.log('Login response:', response);
        if (response && response.user) {
          this.errorMessage = '';
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('userEmail', response.user.email);
          localStorage.setItem(
            'userName',
            response.user.name || 'Unknown User'
          );
          localStorage.setItem('userRole', response.user.role || 'Patient');
          console.log('localStorage after login:', {
            user: localStorage.getItem('user'),
            userEmail: localStorage.getItem('userEmail'),
            userName: localStorage.getItem('userName'),
            userRole: localStorage.getItem('userRole'),
          });

          const role = response.user.role;
          let route = '/homepage';
          if (role === 'Doctor') {
            route = '/doctor/dashboard';
          } else if (role === 'Admin') {
            route = '/admin-dashboard';
          } else if (role === 'Patient') {
            route = '/patient-dashboard';
          } else if (role === 'Pharmacist') {
            route = '/pharmacist-dashboard';
          } else if (role === 'Receptionist') {
            route = '/receptionist-dashboard';
          }

          console.log('Attempting navigation to:', route);
          this.router
            .navigateByUrl(route, { replaceUrl: true })
            .then(() => {
              console.log('Navigated to:', route);
              this.cdr.detectChanges();
            })
            .catch((err) => {
              console.error('Navigation error:', err);
              this.errorMessage = 'Failed to navigate after login';
            });
        } else {
          this.errorMessage = 'Invalid login response from server';
        }
      },
      (error) => {
        console.error('Login error details:', error);
        console.log('Full error object:', JSON.stringify(error, null, 2));
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
  get signupSpecialty() {
    return this.signupForm.get('specialty');
  }
  get signinEmail() {
    return this.signinForm.get('email');
  }
  get signinPassword() {
    return this.signinForm.get('signinPassword');
  }
}
