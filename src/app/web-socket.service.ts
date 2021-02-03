import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket:any;
  //readonly uri: string = 'http://73.182.218.48:4000';

  constructor() {
    const uri = window.prompt("Enter server","");
    this.socket = io(uri);
   }


  listen(eventName:string){
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      })   
    });
  }

  emit(eventName:string,data:any){
    this.socket.emit(eventName,data);
  }
}
