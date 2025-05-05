import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      extraHeaders: {
        'my-custom-header': 'abcd',
      },
    });
  }

  joinRoom(room: string): void {
    this.socket.emit('joinPatientRoom', room);
  }

  onAppointmentStatusUpdated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('appointmentStatusUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
