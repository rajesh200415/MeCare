import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit, AfterViewInit {
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
    divisionData: [],
    ageData: [],
    genderData: [],
    patients: [],
  };
  userEmail: string;
  doctorName: string = 'Unknown Doctor';
  private activityChart: Chart | undefined;
  private ageChart: Chart | undefined;

  constructor(private http: HttpClient, private router: Router) {
    Chart.register(...registerables);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userEmail = user.email || '';
    this.doctorName = user.name || 'Unknown Doctor';
    if (!this.userEmail) {
      console.warn('No user email found, redirecting to login');
      this.router.navigate(['/login-signup']);
    }
  }

  ngOnInit() {
    if (this.userEmail) {
      this.seedMockData();
      this.fetchDashboardData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 100);
  }

  seedMockData() {
    this.dashboardData.activityData = [
      { month: 'Jan', thisYear: 50, previousYear: 40 },
      { month: 'Feb', thisYear: 70, previousYear: 60 },
      { month: 'Mar', thisYear: 90, previousYear: 80 },
      { month: 'Apr', thisYear: 110, previousYear: 100 },
      { month: 'May', thisYear: 130, previousYear: 120 },
      { month: 'Jun', thisYear: 150, previousYear: 140 },
      { month: 'Jul', thisYear: 170, previousYear: 160 },
      { month: 'Aug', thisYear: 190, previousYear: 180 },
      { month: 'Sep', thisYear: 210, previousYear: 200 },
      { month: 'Oct', thisYear: 190, previousYear: 180 },
      { month: 'Nov', thisYear: 170, previousYear: 160 },
      { month: 'Dec', thisYear: 150, previousYear: 140 },
    ];

    this.dashboardData.ageData = [
      { range: '5-17 yo', value: 1280 },
      { range: '12-25 yo', value: 1780 },
      { range: '26-45 yo', value: 900 },
      { range: '46-65 yo', value: 600 },
    ];
  }

  fetchDashboardData() {
    this.http
      .get<any>(
        `http://localhost:3000/api/doctor-dashboard/${this.userEmail}/${this.selectedYear}`
      )
      .subscribe(
        (data) => {
          this.dashboardData = {
            importantTasks:
              data.importantTasks || this.dashboardData.importantTasks,
            highPriorityTasks:
              data.highPriorityTasks || this.dashboardData.highPriorityTasks,
            newPatients: data.newPatients || this.dashboardData.newPatients,
            waitingPatients:
              data.waitingPatients || this.dashboardData.waitingPatients,
            totalPatients:
              data.totalPatients || this.dashboardData.totalPatients,
            patientIncrease:
              data.patientIncrease || this.dashboardData.patientIncrease,
            totalPayments:
              data.totalPayments || this.dashboardData.totalPayments,
            paymentIncrease:
              data.paymentIncrease || this.dashboardData.paymentIncrease,
            activityData: data.activityData || this.dashboardData.activityData,
            divisionData: data.divisionData || this.dashboardData.divisionData,
            ageData: data.ageData || this.dashboardData.ageData,
            genderData: data.genderData || this.dashboardData.genderData,
            patients: data.patients || this.dashboardData.patients,
          };
          this.updateCharts();
        },
        (error) => {
          console.error('Error fetching dashboard data:', error);
          this.updateCharts();
        }
      );
  }

  initCharts() {
    const activityCtx = document.getElementById(
      'activityChart'
    ) as HTMLCanvasElement;
    if (!activityCtx) {
      console.error('Activity chart canvas not found');
      return;
    }
    this.activityChart = new Chart(activityCtx, {
      type: 'line',
      data: {
        labels: this.dashboardData.activityData.map((d: any) => d.month),
        datasets: [
          {
            label: 'This Year',
            data: this.dashboardData.activityData.map((d: any) => d.thisYear),
            borderColor: '#4e73df',
            fill: false,
          },
          {
            label: 'Previous Year',
            data: this.dashboardData.activityData.map(
              (d: any) => d.previousYear
            ),
            borderColor: '#e3e6f0',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, max: 250 },
        },
      },
    });

    const ageCtx = document.getElementById('ageChart') as HTMLCanvasElement;
    if (!ageCtx) {
      console.error('Age chart canvas not found');
      return;
    }
    this.ageChart = new Chart(ageCtx, {
      type: 'bar',
      data: {
        labels: this.dashboardData.ageData.map((d: any) => d.range),
        datasets: [
          {
            label: 'Patients',
            data: this.dashboardData.ageData.map((d: any) => d.value),
            backgroundColor: ['#1cc88a', '#4e73df', '#f6c23e', '#e74a3b'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 2500 },
        },
      },
    });
  }

  updateCharts() {
    if (this.activityChart) {
      this.activityChart.data.labels = this.dashboardData.activityData.map(
        (d: any) => d.month
      );
      this.activityChart.data.datasets[0].data =
        this.dashboardData.activityData.map((d: any) => d.thisYear);
      this.activityChart.data.datasets[1].data =
        this.dashboardData.activityData.map((d: any) => d.previousYear);
      this.activityChart.update();
    }
    if (this.ageChart) {
      this.ageChart.data.labels = this.dashboardData.ageData.map(
        (d: any) => d.range
      );
      this.ageChart.data.datasets[0].data = this.dashboardData.ageData.map(
        (d: any) => d.value
      );
      this.ageChart.update();
    }
  }

  navigateTo(section: string) {
    console.log(
      `Clicked ${section.charAt(0).toUpperCase() + section.slice(1)}`
    );
    console.log('Attempting to navigate to:', `/doctor/${section}`);
    this.router
      .navigate([`/doctor/${section}`])
      .then((success) => {
        console.log(
          'Navigation successful:',
          success,
          'Current URL:',
          this.router.url
        );
      })
      .catch((err) => {
        console.error('Navigation failed:', err);
      });
  }
  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login-signup']);
  }
}
