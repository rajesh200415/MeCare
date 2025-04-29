import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  patients: any[] = [];
  doctors: any[] = [];
  appointments: any[] = [];
  errorMessage: string = '';
  activeSection: 'patients' | 'doctors' | 'appointments' = 'patients';
  selectedItem: any = null; // For editing
  selectedProfile: any = null; // For viewing doctor profiles
  editForm: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['Patient', Validators.required],
      specialty: [''],
      weight: [''],
      height: [''],
      bloodGroup: [''],
      patientEmail: [''],
      date: [''],
      time: [''],
      status: [''],
    });
  }

  ngOnInit() {
    console.log('ngOnInit - Initial activeSection:', this.activeSection);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Admin') {
      this.router
        .navigate(['/login-signup'])
        .then(() => {
          console.log('Redirected to login-signup due to invalid user');
        })
        .catch((err) => {
          console.error('Navigation error in ngOnInit:', err);
        });
      return;
    }
    this.fetchOverview();
  }

  fetchOverview() {
    this.http.get<any[]>('http://localhost:3000/api/patients').subscribe(
      (data) => {
        this.patients = data;
        console.log('Patients fetched:', data);
      },
      (error) => {
        this.errorMessage = `Error fetching patients: ${
          error.message || error.statusText
        }`;
        console.error('Patients error:', error);
      }
    );
    this.http.get<any[]>('http://localhost:3000/api/doctors').subscribe(
      (data) => {
        this.doctors = data;
        console.log('Doctors fetched:', data);
      },
      (error) => {
        this.errorMessage = `Error fetching doctors: ${
          error.message || error.statusText
        }`;
        console.error('Doctors error:', error);
      }
    );
    this.http.get<any[]>('http://localhost:3000/api/appointments').subscribe(
      (data) => {
        this.appointments = data; // Admin sees all appointments, including canceled
        console.log('Appointments fetched:', data);
      },
      (error) => {
        this.errorMessage = `Error fetching appointments: ${
          error.message || error.statusText
        }`;
        console.error('Appointments error:', error);
      }
    );
  }

  setActiveSection(section: 'patients' | 'doctors' | 'appointments') {
    console.log('setActiveSection called with:', section);
    if (this.activeSection !== section) {
      this.activeSection = section;
      this.selectedItem = null;
      this.selectedProfile = null; // Reset profile view
      this.editForm.reset();
      this.cdr.detectChanges(); // Force UI update
      console.log(`Active section changed to: ${section}`);
    }
  }

  getSectionTitle(): string {
    const titles = {
      patients: 'Manage Patients',
      doctors: 'Manage Doctors',
      appointments: 'Appointments Overview',
    };
    return titles[this.activeSection] || 'Admin Dashboard';
  }

  editItem(item: any) {
    console.log('Editing item:', item);
    this.selectedItem = { ...item };
    this.selectedProfile = null; // Close profile view when editing
    this.editForm.patchValue({
      _id: item._id || '',
      name: item.name || '',
      email: item.email || '',
      password: '', // Reset password for security
      role: item.role || 'Patient',
      specialty: item.specialty || '',
      weight: item.healthDetails?.weight || '',
      height: item.healthDetails?.height || '',
      bloodGroup: item.healthDetails?.bloodGroup || '',
      patientEmail: item.patientEmail || '',
      date: item.date || '',
      time: item.time || '',
      status: item.status || '',
    });
  }

  viewDoctorProfile(email: string) {
    console.log('Viewing profile for email:', email);
    this.http
      .get(`http://localhost:3000/api/doctor/details/${email}`)
      .subscribe(
        (response: any) => {
          this.selectedProfile = response;
          this.selectedItem = null; // Close edit form when viewing profile
          this.errorMessage = '';
          console.log('Doctor profile fetched:', response);
        },
        (error) => {
          this.errorMessage = `Error fetching doctor profile: ${
            error.message || error.statusText
          }`;
          console.error('Doctor profile error:', error);
        }
      );
  }

  closeProfile() {
    this.selectedProfile = null;
  }

  updateItem() {
    console.log('Updating item:', this.editForm.value);
    if (this.editForm.invalid || !this.selectedItem) {
      this.errorMessage =
        'Please fill all required fields or select an item to update';
      return;
    }
    const item = this.editForm.value;
    let url = '';
    switch (this.activeSection) {
      case 'patients':
        url = `http://localhost:3000/api/users/${item.email}`; // Use /api/users for patient updates
        break;
      case 'doctors':
        url = `http://localhost:3000/api/doctors/${item._id}`;
        break;
      case 'appointments':
        url = `http://localhost:3000/api/appointments/${item._id}`;
        break;
      default:
        this.errorMessage = 'Invalid section for update';
        return;
    }
    this.http.put(url, item).subscribe(
      () => {
        this.fetchOverview();
        this.editForm.reset();
        this.selectedItem = null;
        this.errorMessage = `${this.getSectionTitle()} updated successfully`;
      },
      (error) => {
        this.errorMessage = `Error updating ${this.getSectionTitle().toLowerCase()}: ${
          error.message || error.statusText
        }`;
        console.error('Update error:', error);
      }
    );
  }

  deleteItem(id: string) {
    console.log('Deleting item with id:', id);
    let url = '';
    switch (this.activeSection) {
      case 'patients':
        url = `http://localhost:3000/api/users/${id}`; // Use /api/users for patient deletion
        break;
      case 'doctors':
        url = `http://localhost:3000/api/doctors/${id}`;
        break;
      case 'appointments':
        url = `http://localhost:3000/api/appointments/${id}`;
        break;
      default:
        this.errorMessage = 'Invalid section for deletion';
        return;
    }
    this.http.delete(url).subscribe(
      () => this.fetchOverview(),
      (error) => {
        this.errorMessage = `Error deleting ${this.getSectionTitle().toLowerCase()}: ${
          error.message || error.statusText
        }`;
        console.error('Delete error:', error);
      }
    );
  }

  // New methods for appointment management
  confirmAppointment(appointmentId: string) {
    console.log('Confirming appointment:', appointmentId);
    this.http
      .put(
        `http://localhost:3000/api/appointments/confirm/${appointmentId}`,
        {}
      )
      .subscribe(
        () => {
          this.fetchOverview();
          this.errorMessage = 'Appointment confirmed successfully';
          console.log('Appointment confirmed:', appointmentId);
        },
        (error) => {
          this.errorMessage = `Error confirming appointment: ${
            error.message || error.statusText
          }`;
          console.error('Confirm error:', error);
        }
      );
  }

  cancelAppointment(appointmentId: string) {
    console.log('Canceling appointment:', appointmentId);
    this.http
      .put(`http://localhost:3000/api/appointments/cancel/${appointmentId}`, {})
      .subscribe(
        () => {
          this.fetchOverview();
          this.errorMessage = 'Appointment canceled successfully';
          console.log('Appointment canceled:', appointmentId);
        },
        (error) => {
          this.errorMessage = `Error canceling appointment: ${
            error.message || error.statusText
          }`;
          console.error('Cancel error:', error);
        }
      );
  }

  logout() {
    console.log('logout() called');
    try {
      localStorage.removeItem('user');
      console.log('User removed from localStorage');
      this.router
        .navigate(['/login-signup'])
        .then(() => {
          console.log('Successfully navigated to login-signup');
        })
        .catch((err) => {
          console.error('Logout navigation error:', err);
          this.errorMessage = 'Failed to navigate to login page';
        });
    } catch (error) {
      console.error('Logout error:', error);
      this.errorMessage = 'An error occurred during logout';
    }
  }
}
