import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-virtual-appointment',
  templateUrl: './virtual-appointment.component.html',
  styleUrls: ['./virtual-appointment.component.css'],
})
export class VirtualAppointmentComponent implements OnInit {
  appointment: any;

  constructor(private router: Router) {
    this.appointment =
      this.router.getCurrentNavigation()?.extras.state?.['appointment'];
  }

  ngOnInit(): void {
    if (!this.appointment) {
      console.error('No appointment data found. Redirecting...');
      this.router.navigate(['/appointments']);
    }
  }

  joinMeeting(): void {
    alert('Joining virtual meeting... (Implement your video call logic here)');
  }
}
