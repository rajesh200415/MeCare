import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ServicesComponent } from './departments/services/services.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AppointmentsComponent } from './appointments/appointments.component'; // Import the new AppointmentsComponent

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' }, // Default route
  { path: 'homepage', component: HomepageComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'login-signup', component: LoginSignupComponent },
  { path: 'departments', component: HomepageComponent }, // Placeholder
  { path: 'blog', component: HomepageComponent }, // Placeholder
  { path: 'patient-dashboard', component: PatientDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'appointments', component: AppointmentsComponent }, // New appointments route
  /*
   * Uncomment and add these routes if you implement the corresponding components:
   * { path: 'search-healthcare', component: SearchHealthcareComponent },
   * { path: 'update-profile', component: UpdateProfileComponent },
   * { path: 'medicines', component: MedicinesComponent },
   * { path: 'view-dashboard', component: ViewDashboardComponent },
   */
  { path: '**', redirectTo: '/homepage' }, // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
