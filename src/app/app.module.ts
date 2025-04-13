import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './departments/services/services.component';
import { DepartmentsComponent } from './departments/departments.component';
import { BlogComponent } from './blog/blog.component';
import { ProfileComponent } from './profile/profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/login-signup', pathMatch: 'full' },
  { path: 'login-signup', component: LoginSignupComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  { path: '**', redirectTo: '/login-signup' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginSignupComponent,
    HomepageComponent,
    PatientDashboardComponent,
    AboutComponent,
    ServicesComponent,
    DepartmentsComponent,
    BlogComponent,
    ProfileComponent,
    AppointmentsComponent,
    AdminDashboardComponent,
    DoctorDashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
