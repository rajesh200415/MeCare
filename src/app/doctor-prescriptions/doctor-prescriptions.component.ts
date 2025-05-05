import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

@Component({
  selector: 'app-doctor-prescriptions',
  templateUrl: './doctor-prescriptions.component.html',
  styleUrls: ['./doctor-prescriptions.component.css'],
})
export class DoctorPrescriptionsComponent implements OnInit {
  patients: any[] = [];
  selectedPatientEmail: string = '';
  selectedPatient: any = null;
  medications: Medication[] = [
    { name: '', dosage: '', frequency: '', duration: '' },
  ];
  notes: string = '';
  message: string = '';
  error: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'Doctor') {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.loadPatients(user.email);
  }

  loadPatients(doctorEmail: string): void {
    this.http
      .get<any[]>(`http://localhost:3000/api/patients/doctor/${doctorEmail}`)
      .subscribe({
        next: (patients) => {
          this.patients = patients;
        },
        error: (err) => {
          console.error('Error fetching patients:', err);
          this.message = 'Failed to load patients';
          this.error = true;
        },
      });
  }

  loadPatientDetails(): void {
    if (this.selectedPatientEmail) {
      this.http
        .get<any>(
          `http://localhost:3000/api/patient/${this.selectedPatientEmail}`
        )
        .subscribe({
          next: (patient) => {
            this.selectedPatient = patient;
          },
          error: (err) => {
            console.error('Error fetching patient details:', err);
            this.message = 'Failed to load patient details';
            this.error = true;
          },
        });
    }
  }

  addMedication(): void {
    this.medications.push({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
    });
  }

  removeMedication(index: number): void {
    if (this.medications.length > 1) {
      this.medications.splice(index, 1);
    }
  }

  prescribeMedicines(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.http
      .get<any>(`http://localhost:3000/api/doctor/details/${user.email}`)
      .subscribe({
        next: (doctorData) => {
          const prescription = {
            doctorId: doctorData.doctorDetails._id,
            patientEmail: this.selectedPatientEmail,
            medications: this.medications,
            notes: this.notes,
          };

          this.http
            .post<any>('http://localhost:3000/api/prescriptions', prescription)
            .subscribe({
              next: (response) => {
                const prescriptionId = response.prescription._id;

                this.http
                  .put<any>(
                    `http://localhost:3000/api/prescriptions/send/${prescriptionId}`,
                    {}
                  )
                  .subscribe({
                    next: () => {
                      this.message =
                        'Prescription created and sent successfully';
                      this.error = false;
                      this.medications = [
                        { name: '', dosage: '', frequency: '', duration: '' },
                      ];
                      this.notes = '';
                    },
                    error: (err) => {
                      console.error('Error sending prescription:', err);
                      this.message = 'Failed to send prescription';
                      this.error = true;
                    },
                  });
              },
              error: (err) => {
                console.error('Error creating prescription:', err);
                this.message = 'Failed to create prescription';
                this.error = true;
              },
            });
        },
        error: (err) => {
          console.error('Error fetching doctor details:', err);
          this.message = 'Failed to fetch doctor details';
          this.error = true;
        },
      });
  }

  // Method to determine if the "Prescribe Medicines" button should be disabled
  isPrescribeButtonDisabled(): boolean {
    return (
      this.medications.length === 0 ||
      !this.medications.every(
        (med) =>
          med.name.trim() &&
          med.dosage.trim() &&
          med.frequency.trim() &&
          med.duration.trim()
      )
    );
  }

  // Method to get message classes
  getMessageClasses(): { [key: string]: boolean } {
    return {
      'bg-green-100': !this.error,
      'text-green-700': !this.error,
      'bg-red-100': this.error,
      'text-red-700': this.error,
    };
  }
}
