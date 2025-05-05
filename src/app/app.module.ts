import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ServicesComponent } from './departments/services/services.component';
import { DepartmentsComponent } from './departments/departments.component';
import { BlogComponent } from './blog/blog.component';
import { ProfileComponent } from './profile/profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { DoctorPatientsComponent } from './doctor-patients/doctor-patients.component';
import { DoctorMessagesComponent } from './doctor-messages/doctor-messages.component';
import { DoctorMedicationsComponent } from './doctor-medications/doctor-medications.component';
import { DoctorDocumentsComponent } from './doctor-documents/doctor-documents.component';
import { DoctorFinancesComponent } from './doctor-finances/doctor-finances.component';
import { DoctorSettingsComponent } from './doctor-settings/doctor-settings.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { PharmacistDashboardComponent } from './pharmacist-dashboard/pharmacist-dashboard.component';
import { ReceptionistDashboardComponent } from './receptionist-dashboard/receptionist-dashboard.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { VirtualAppointmentComponent } from './virtual-appointment/virtual-appointment.component';
import { FeedbackComponent } from './feedback/feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginSignupComponent,
    HomepageComponent,
    PatientDashboardComponent,
    AboutUsComponent,
    ServicesComponent,
    DepartmentsComponent,
    BlogComponent,
    ProfileComponent,
    AppointmentsComponent,
    AdminDashboardComponent,
    PrescriptionsComponent,
    DoctorDashboardComponent,
    DoctorAppointmentsComponent,
    DoctorPatientsComponent,
    DoctorMessagesComponent,
    DoctorMedicationsComponent,
    DoctorDocumentsComponent,
    DoctorFinancesComponent,
    DoctorSettingsComponent,
    DoctorProfileComponent,
    PharmacistDashboardComponent,
    ReceptionistDashboardComponent,
    PatientDetailsComponent,
    VirtualAppointmentComponent,
    FeedbackComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
