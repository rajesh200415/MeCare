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
  activeSection: string = 'patients';
  selectedItem: any = null; // For edit operation
  editForm: FormGroup; // Form for edit only

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize form for edit only
    this.editForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['Patient', Validators.required],
      weight: [''],
      height: [''],
      bloodGroup: [''],
    });
  }

  ngOnInit() {
    console.log('ngOnInit - Initial activeSection:', this.activeSection);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Admin') {
      this.router.navigate(['/login-signup']);
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
        this.appointments = data;
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

  setActiveSection(section: string) {
    this.activeSection = section;
    this.selectedItem = null; // Reset selected item when switching sections
    this.editForm.reset(); // Reset form
    console.log('Active section changed to:', this.activeSection);
    this.cdr.detectChanges();
  }

  editItem(item: any) {
    console.log('Editing item:', item);
    this.selectedItem = { ...item };
    this.editForm.patchValue({
      _id: item._id || '',
      name: item.name || '',
      email: item.email || '',
      password: '', // Reset password for security
      role: item.role || 'Patient',
      weight: item.healthDetails?.weight || '',
      height: item.healthDetails?.height || '',
      bloodGroup: item.healthDetails?.bloodGroup || '',
    });
  }

  updateItem() {
    console.log('Updating item:', this.editForm.value);
    if (this.editForm.invalid || !this.selectedItem) {
      alert('Please fill all required fields or select an item to update');
      return;
    }
    const item = this.editForm.value;
    const url =
      'http://localhost:3000/api/patients/' +
      (item._id || this.selectedItem._id);
    this.http.put(url, item).subscribe(
      () => {
        this.fetchOverview();
        this.editForm.reset();
        this.selectedItem = null;
        alert('Patient updated successfully');
      },
      (error) => {
        this.errorMessage = `Error updating patient: ${
          error.message || error.statusText
        }`;
        console.error('Update error:', error);
      }
    );
  }

  deleteItem(id: string) {
    console.log('Deleting patient with id:', id);
    const url = 'http://localhost:3000/api/patients/' + id;
    this.http.delete(url).subscribe(
      () => this.fetchOverview(),
      (error) => {
        this.errorMessage = `Error deleting patient: ${
          error.message || error.statusText
        }`;
        console.error('Delete error:', error);
      }
    );
  }

  logout() {
    console.log('Logging out');
    localStorage.removeItem('user');
    this.router.navigate(['/login-signup']);
  }
}
