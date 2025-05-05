import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import Chart from 'chart.js/auto';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  doctorName: string = localStorage.getItem('userName') || 'Doctor';
  userEmail: string = localStorage.getItem('userEmail') || '';
  doctorId: string = '';
  selectedYear: string = '2020';
  dashboardData: any = {
    importantTasks: 0,
    highPriorityTasks: 0,
    newPatients: 0,
    waitingPatients: 0,
    totalPatients: 0,
    patientIncrease: 0,
    totalPayments: 0,
    paymentIncrease: 0,
    activityData: [],
    ageData: [],
    patients: [],
  };
  showPrescriptionForm: boolean = false;
  selectedPatient: any = null;
  prescriptionForm: FormGroup;
  errorMessage: string = '';
  activityChart: any;
  ageChart: any;
  private socket: Socket;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize WebSocket connection
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      extraHeaders: {
        'my-custom-header': 'abcd',
      },
    });

    // Initialize the prescription form
    this.prescriptionForm = this.fb.group({
      medications: this.fb.array([
        this.fb.group({
          name: ['', Validators.required],
          dosage: ['', Validators.required],
          frequency: ['', Validators.required],
          duration: ['', Validators.required],
        }),
      ]),
      notes: [''],
    });
  }

  ngOnInit() {
    if (!this.userEmail) {
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchDoctorInfo();
    this.fetchDashboardData();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  setupSocketListeners() {
    this.socket.emit('joinDoctorRoom', this.userEmail);
    console.log('Joined doctor room:', this.userEmail);

    this.socket.on('newAppointment', (data: any) => {
      console.log('Received new appointment update:', data);
      this.dashboardData.newPatients = data.newPatients;
      this.dashboardData.waitingPatients = data.waitingPatients;
      this.dashboardData.patients = data.patients;
      this.dashboardData.totalPatients = data.patients.length / 1000;
    });
  }

  fetchDoctorInfo() {
    this.http
      .get<any>(`http://localhost:3000/api/doctor/details/${this.userEmail}`)
      .subscribe(
        (data) => {
          this.doctorId = data.doctorDetails._id;
          console.log('Fetched doctor ID:', this.doctorId);
        },
        (error) => {
          console.error('Error fetching doctor info:', error);
          this.errorMessage = 'Failed to load doctor info.';
        }
      );
  }

  fetchDashboardData() {
    this.http
      .get<any>(
        `http://localhost:3000/api/doctor-dashboard/${this.userEmail}/${this.selectedYear}`
      )
      .subscribe(
        (data) => {
          this.dashboardData = data;
          this.initializeCharts();
        },
        (error) => {
          console.error('Error fetching dashboard data:', error);
          this.errorMessage = 'Failed to fetch dashboard data.';
        }
      );
  }

  initializeCharts() {
    const activityCtx = document.getElementById(
      'activityChart'
    ) as HTMLCanvasElement;
    this.activityChart = new Chart(activityCtx, {
      type: 'line',
      data: {
        labels: this.dashboardData.activityData.map((d: any) => d.month),
        datasets: [
          {
            label: 'This Year',
            data: this.dashboardData.activityData.map((d: any) => d.value),
            borderColor: '#007bff',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    const ageCtx = document.getElementById('ageChart') as HTMLCanvasElement;
    this.ageChart = new Chart(ageCtx, {
      type: 'bar',
      data: {
        labels: ['0-18', '19-30', '31-50', '51+'],
        datasets: [
          {
            label: 'Age Distribution',
            data: [
              this.dashboardData.ageData.filter((age: number) => age <= 18)
                .length,
              this.dashboardData.ageData.filter(
                (age: number) => age > 18 && age <= 30
              ).length,
              this.dashboardData.ageData.filter(
                (age: number) => age > 30 && age <= 50
              ).length,
              this.dashboardData.ageData.filter((age: number) => age > 50)
                .length,
            ],
            backgroundColor: '#007bff',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login-signup']);
  }

  // Prescription Form Logic
  get medications(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  addMedication() {
    this.medications.push(
      this.fb.group({
        name: ['', Validators.required],
        dosage: ['', Validators.required],
        frequency: ['', Validators.required],
        duration: ['', Validators.required],
      })
    );
  }

  removeMedication(index: number) {
    this.medications.removeAt(index);
  }

  openPrescriptionForm(patient: any) {
    this.selectedPatient = patient;
    this.showPrescriptionForm = true;
    this.errorMessage = '';
  }

  closePrescriptionForm() {
    this.showPrescriptionForm = false;
    this.selectedPatient = null;
    this.prescriptionForm.reset();
    this.medications.clear();
    this.addMedication();
  }

  createPrescription() {
    if (this.prescriptionForm.invalid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    const prescriptionData = {
      doctorId: this.doctorId,
      patientEmail: this.selectedPatient.email,
      medications: this.prescriptionForm.value.medications,
      notes: this.prescriptionForm.value.notes,
    };

    this.http
      .post('http://localhost:3000/api/prescriptions', prescriptionData)
      .subscribe(
        (response: any) => {
          console.log('Prescription created:', response);
          this.sendPrescription(response.prescription._id);
        },
        (error) => {
          console.error('Error creating prescription:', error);
          this.errorMessage = 'Failed to create prescription.';
        }
      );
  }

  sendPrescription(prescriptionId: string) {
    this.http
      .put(`http://localhost:3000/api/prescriptions/send/${prescriptionId}`, {})
      .subscribe(
        (response) => {
          console.log('Prescription sent:', response);
          this.closePrescriptionForm();
        },
        (error) => {
          console.error('Error sending prescription:', error);
          this.errorMessage = 'Failed to send prescription.';
        }
      );
  }
}
