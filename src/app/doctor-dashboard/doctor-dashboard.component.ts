import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
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

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('NavigationStart:', event.url, 'ID:', event.id);
      } else if (event instanceof NavigationEnd) {
        console.log('NavigationEnd:', event.url, 'ID:', event.id);
      } else if (event instanceof NavigationCancel) {
        console.log(
          'NavigationCancel:',
          event.url,
          'Reason:',
          event.reason,
          'ID:',
          event.id
        );
      } else if (event instanceof NavigationError) {
        console.error(
          'NavigationError:',
          event.url,
          'Error:',
          event.error,
          'ID:',
          event.id
        );
      }
    });
  }

  ngOnInit() {
    if (this.userEmail) {
      this.fetchDashboardData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 100);
  }

  fetchDashboardData() {
    this.http
      .get<any>(
        `http://localhost:3000/api/doctor-dashboard/${this.userEmail}/${this.selectedYear}`
      )
      .subscribe(
        (data) => {
          this.dashboardData = {
            importantTasks: data.importantTasks || 0,
            highPriorityTasks: data.highPriorityTasks || 0,
            newPatients: data.newPatients || 0,
            waitingPatients: data.waitingPatients || 0,
            totalPatients: data.totalPatients || 0,
            patientIncrease: data.patientIncrease || 0,
            totalPayments: data.totalPayments || 0,
            paymentIncrease: data.paymentIncrease || 0,
            activityData: data.activityData || [],
            divisionData: data.divisionData || [],
            ageData: data.ageData || [],
            genderData: data.genderData || [],
            patients: data.patients || [],
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

  isActive(section: string): boolean {
    const currentUrl = this.router.url;
    const expectedUrl = `/doctor/${section}`;
    console.log(
      `Checking if active: currentUrl=${currentUrl}, expectedUrl=${expectedUrl}`
    );
    return currentUrl === expectedUrl;
  }

  logout() {
    console.log('Logging out');
    localStorage.removeItem('user');
    this.router.navigate(['/login-signup']).then(
      (success) => {
        console.log(
          'Navigation successful:',
          success,
          'Target URL:',
          '/login-signup',
          'Current URL:',
          this.router.url
        );
      },
      (error) => {
        console.error(
          'Navigation failed:',
          error,
          'Target URL:',
          '/login-signup'
        );
      }
    );
  }
}
