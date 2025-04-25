export interface Appointment {
  _id?: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
  };
  patientEmail: string;
  date: string;
  time: string;
  status:
    | 'Pending'
    | 'Confirmed'
    | 'Completed'
    | 'Canceled'
    | 'Approved'
    | 'Rejected';
}
