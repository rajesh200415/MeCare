import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('300ms ease-in')),
    ]),
    trigger('slideInSidebar', [
      state('open', style({ transform: 'translateX(0)' })),
      state('closed', style({ transform: 'translateX(-100%)' })),
      transition('closed => open', animate('300ms ease-in')),
      transition('open => closed', animate('300ms ease-out')),
    ]),
    trigger('hover', [
      state('normal', style({ backgroundColor: '#f8f9fa', color: '#333' })),
      state('hovered', style({ backgroundColor: '#e9ecef', color: '#000' })),
      transition('normal <=> hovered', animate('200ms')),
    ]),
  ],
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  currentVitals: any = {};
  userEmail: string = localStorage.getItem('userEmail') || '';
  userName: string = localStorage.getItem('userName') || '';
  sidebarState: string = 'open';
  buttonStates: Map<string, string> = new Map();
  activityChart: Chart | undefined;
  monthlyActivityChart: Chart | undefined;

  healthTips: string[] = [
    'Drink at least 8 glasses of water daily to stay hydrated.',
    'Aim for 30 minutes of physical activity most days of the week.',
    'Include a variety of fruits and vegetables in your diet for essential nutrients.',
    'Get 7-9 hours of sleep each night to support overall health.',
    'Take short breaks every hour to reduce stress and improve focus.',
    'Practice deep breathing exercises to manage stress and anxiety.',
    'Limit processed foods and opt for whole grains instead.',
  ];
  currentTipIndex: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    console.log('ngOnInit - userEmail:', this.userEmail);
    console.log('ngOnInit - userName:', this.userName);
    if (!this.userEmail || !this.userName) {
      console.error('No logged-in user found. Redirecting to login-signup.');
      this.router.navigate(['/login-signup']);
      return;
    }
    this.fetchPatientData();
    setTimeout(() => this.initializeCharts(), 500);
  }

  ngOnDestroy() {
    if (this.activityChart) this.activityChart.destroy();
    if (this.monthlyActivityChart) this.monthlyActivityChart.destroy();
  }

  fetchPatientData() {
    this.http
      .get<any>(`http://localhost:3000/api/patient/${this.userEmail}`)
      .subscribe(
        (data) => {
          this.currentVitals = data || {};
          console.log('Fetched vitals:', {
            name: this.currentVitals.name,
            age: this.currentVitals.age,
            weight: this.currentVitals.healthDetails?.weight,
            height: this.currentVitals.healthDetails?.height,
            bloodGroup: this.currentVitals.healthDetails?.bloodGroup,
            activityLevel: this.currentVitals.healthDetails?.activityLevel,
            waterIntake: this.currentVitals.healthDetails?.waterIntake,
            steps: this.currentVitals.healthDetails?.steps,
          });
          if (!this.currentVitals.name && localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            this.currentVitals.name = user.name || 'Patient';
          }
        },
        (error) => {
          console.error('Patient data error:', error);
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          this.currentVitals.name = user.name || 'Patient';
          this.currentVitals.healthDetails = {
            weight: user.weight || '47',
            height: user.height || '1.40',
            bloodGroup: user.bloodGroup || 'O+',
            activityLevel: 55,
            waterIntake: 73,
            steps: 6500,
          };
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
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Yearly Activity',
            data: [25, 30, 40, 50, 60, 70, 65, 55, 45, 50, 60, 75],
            borderColor: '#1e3a8a',
            backgroundColor: 'rgba(30, 58, 138, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25 },
            display: false,
          },
          x: { display: false },
        },
        plugins: { legend: { display: false } },
      },
    });

    const monthlyActivityCtx = document.getElementById(
      'monthlyActivityChart'
    ) as HTMLCanvasElement;
    this.monthlyActivityChart = new Chart(monthlyActivityCtx, {
      type: 'bar',
      data: {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        datasets: [
          {
            label: 'Monthly Activity',
            data: [45, 50, 65, 70, 55, 60, 75],
            backgroundColor: '#1e3a8a',
            borderColor: '#1e3a8a',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25 },
            display: false,
          },
          x: { display: false },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  nextHealthTip() {
    this.currentTipIndex = (this.currentTipIndex + 1) % this.healthTips.length;
  }

  prevHealthTip() {
    this.currentTipIndex =
      (this.currentTipIndex - 1 + this.healthTips.length) %
      this.healthTips.length;
  }

  updateButtonState(key: string, state: string) {
    this.buttonStates.set(key, state);
  }

  logout() {
    localStorage.clear();
    console.log('Logged out. Navigating to /login-signup');
    this.router.navigate(['/login-signup']);
  }

  toggleSidebar() {
    this.sidebarState = this.sidebarState === 'open' ? 'closed' : 'open';
  }

  logNavigation(route: string): void {
    console.log(`Navigating to ${route}. localStorage:`, {
      userEmail: localStorage.getItem('userEmail'),
      userName: localStorage.getItem('userName'),
      userRole: localStorage.getItem('userRole'),
    });
  }

  // Add the missing isRouteActive method
  isRouteActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getWeightTrendPoints(): string {
    if (!this.currentVitals?.healthDetails?.weight)
      return '10,70 50,65 90,60 130,55 170,50 190,45';
    const baseWeight = parseFloat(this.currentVitals.healthDetails.weight);
    return `10,${70 - baseWeight / 2} 50,${65 - baseWeight / 2} 90,${
      60 - baseWeight / 2
    } 130,${55 - baseWeight / 2} 170,${50 - baseWeight / 2} 190,${
      45 - baseWeight / 2
    }`;
  }

  getGaugePath(percentage: number): string {
    const angle = (percentage / 100) * 180 - 90;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + 30 * Math.cos(rad);
    const y = 40 + 30 * Math.sin(rad);
    return `M10 40 A 30 30 0 ${angle > 0 ? 1 : 0} 1 ${x} ${y}`;
  }

  getStepDashArray(current: number, goal: number): string {
    const percentage = (current / goal) * 100;
    const circumference = 2 * Math.PI * 15.9155;
    const dash = (percentage / 100) * circumference;
    return `${dash}, ${circumference - dash}`;
  }

  getHeatmapColor(value: number): string {
    return value > 50 ? '#1e3a8a' : '#5eead4';
  }

  getHeatmapOpacity(value: number): number {
    return value / 100;
  }
}
