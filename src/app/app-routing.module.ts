// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ServicesComponent } from './departments/services/services.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { DoctorPatientsComponent } from './doctor-patients/doctor-patients.component';
import { DoctorMessagesComponent } from './doctor-messages/doctor-messages.component';
import { DoctorMedicationsComponent } from './doctor-medications/doctor-medications.component';
import { DoctorDocumentsComponent } from './doctor-documents/doctor-documents.component';
import { DoctorFinancesComponent } from './doctor-finances/doctor-finances.component';
import { DoctorSettingsComponent } from './doctor-settings/doctor-settings.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'login-signup', component: LoginSignupComponent },
  { path: 'departments', component: HomepageComponent },
  { path: 'blog', component: HomepageComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent },
  { path: 'profile', component: ProfileComponent }, // Keep this for non-doctor profile (e.g., patient)
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  {
    path: 'doctor',
    children: [
      { path: 'dashboard', component: DoctorDashboardComponent },
      { path: 'appointments', component: DoctorAppointmentsComponent },
      { path: 'patients', component: DoctorPatientsComponent },
      { path: 'messages', component: DoctorMessagesComponent },
      { path: 'medications', component: DoctorMedicationsComponent },
      { path: 'documents', component: DoctorDocumentsComponent },
      { path: 'finances', component: DoctorFinancesComponent },
      { path: 'settings', component: DoctorSettingsComponent },
      { path: 'prescriptions', component: PrescriptionsComponent },
      { path: 'profile', component: DoctorProfileComponent }, // Add doctor profile route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/homepage' }, // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
