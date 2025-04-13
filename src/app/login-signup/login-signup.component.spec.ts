import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule for Router

import { LoginSignupComponent } from './login-signup.component'; // Corrected to LoginSignupComponent

describe('LoginSignupComponent', () => {
  let component: LoginSignupComponent; // Corrected to LoginSignupComponent
  let fixture: ComponentFixture<LoginSignupComponent>; // Corrected to LoginSignupComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginSignupComponent], // Corrected to LoginSignupComponent
      imports: [
        ReactiveFormsModule, // Add ReactiveFormsModule for form handling
        RouterTestingModule, // Add RouterTestingModule for Router
      ],
    });
    fixture = TestBed.createComponent(LoginSignupComponent); // Corrected to LoginSignupComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Optional: Add more tests for form validation and toggleMode functionality
  it('should initialize signupForm with required fields', () => {
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.get('name')).toBeTruthy();
    expect(component.signupForm.get('email')).toBeTruthy();
    expect(component.signupForm.get('password')).toBeTruthy();
  });

  it('should initialize signinForm with required fields', () => {
    expect(component.signinForm).toBeDefined();
    expect(component.signinForm.get('email')).toBeTruthy();
    expect(component.signinForm.get('password')).toBeTruthy();
  });

  it('should toggle between sign-in and sign-up modes', () => {
    expect(component.isSignInMode).toBeFalse();
    component.toggleMode();
    expect(component.isSignInMode).toBeTrue();
    component.toggleMode();
    expect(component.isSignInMode).toBeFalse();
  });
});
