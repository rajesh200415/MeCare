import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
export class LoginSignupComponent implements OnInit {
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
    private http: HttpClient, // Fixed typo: Client -> HttpClient
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

  ngOnInit() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    console.log(
      'LoginSignupComponent ngOnInit - userEmail:',
      userEmail,
      'userRole:',
      userRole
    );

    if (userEmail && userRole) {
      console.log(
        'User already logged in. Redirecting based on role:',
        userRole
      );
      let route = '/homepage';
      if (userRole === 'Doctor') {
        route = '/doctor/dashboard';
      } else if (userRole === 'Admin') {
        route = '/admin-dashboard';
      } else if (userRole === 'Patient') {
        route = '/patient-dashboard';
      } else if (userRole === 'Pharmacist') {
        route = '/pharmacist-dashboard';
      } else if (userRole === 'Receptionist') {
        route = '/receptionist-dashboard';
      }

      this.router
        .navigateByUrl(route, { replaceUrl: true })
        .then(() => {
          console.log('Navigated to:', route);
        })
        .catch((err) => {
          console.error('Navigation error in ngOnInit:', err);
          this.errorMessage = 'Failed to navigate after login check';
        });
    }
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

  toggleMode() {
    this.isSignInMode = !this.isSignInMode;
    this.errorMessage = '';
    this.passwordStrength = ''; // Reset password strength when toggling
    this.signupForm.reset({
      role: 'Patient',
      healthDetails: { weight: '', height: '', bloodGroup: '' },
      specialty: '',
    });
    this.signinForm.reset();
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
      const errors: { [key: string]: any } = {};
      Object.keys(this.signupForm.controls).forEach((key) => {
        const controlErrors = this.signupForm.get(key)?.errors;
        if (controlErrors) errors[key] = controlErrors;
        if (key === 'healthDetails') {
          const healthDetailsGroup = this.signupForm.get(
            'healthDetails'
          ) as FormGroup;
          Object.keys(healthDetailsGroup.controls).forEach((subKey) => {
            const subControlErrors = healthDetailsGroup.get(subKey)?.errors;
            if (subControlErrors)
              errors[`healthDetails.${subKey}`] = subControlErrors;
          });
        }
      });
      console.log('Detailed form errors:', errors);
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
      (error: HttpErrorResponse) => {
        // Added type for error
        console.error('Signup error details:', error);
        if (error.status === 400) {
          this.errorMessage =
            error.error?.message || 'User already exists or invalid data';
          if (error.error?.message === 'User already exists') {
            console.log('Duplicate email detected:', signupData.email);
          }
        } else if (error.status === 500) {
          this.errorMessage =
            'Server error, please try again. Check server logs.';
        } else {
          this.errorMessage =
            'Failed to sign up: ' + (error.error?.message || 'Unknown error');
        }
        console.log('Full error response:', JSON.stringify(error, null, 2));
      }
    );
  }

  onSignInButtonClick() {
    console.log('Sign In button clicked. Form valid:', this.signinForm.valid);
    if (this.signinForm.invalid) {
      console.log('Sign In button click aborted: Form is invalid');
    }
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
      const errors: { [key: string]: any } = {};
      Object.keys(this.signinForm.controls).forEach((key) => {
        const controlErrors = this.signinForm.get(key)?.errors;
        if (controlErrors) errors[key] = controlErrors;
      });
      console.log('Detailed signin form errors:', errors);
      return;
    }

    const signinData = {
      email: this.signinForm.value.email,
      password: this.signinForm.value.password,
    };
    console.log('Login attempt with data:', signinData);
    this.http.post('http://localhost:3000/user/login', signinData).subscribe({
      next: (response: any) => {
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
            .then((success) => {
              if (success) {
                console.log('Successfully navigated to:', route);
                this.cdr.detectChanges();
              } else {
                console.error('Navigation failed without throwing an error');
                this.errorMessage = 'Navigation failed after login';
              }
            })
            .catch((err) => {
              console.error('Navigation error:', err);
              this.errorMessage =
                'Failed to navigate after login: ' + err.message;
            });
        } else {
          this.errorMessage = 'Invalid login response from server';
          console.error('Invalid response structure:', response);
        }
      },
      error: (error: HttpErrorResponse) => {
        // Added type for error
        console.error('Login error details:', error);
        console.log('Full error object:', JSON.stringify(error, null, 2));
        this.errorMessage = error.error?.message || 'Failed to login';
        if (error.status === 404) this.errorMessage = 'User not found';
        else if (error.status === 401)
          this.errorMessage = 'Invalid credentials';
        else if (error.status === 0) {
          this.errorMessage =
            'Server not reachable. Ensure the backend server is running on port 3000.';
          // Fallback navigation for debugging
          console.log('Attempting fallback navigation to /homepage');
          this.router
            .navigateByUrl('/homepage', { replaceUrl: true })
            .then((success) => {
              console.log(
                'Fallback navigation to /homepage successful:',
                success
              );
            })
            .catch((err) => {
              console.error('Fallback navigation error:', err);
            });
        }
      },
      complete: () => {
        console.log('Login HTTP request completed');
      },
    });
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
    return this.signinForm.get('password');
  }
}
