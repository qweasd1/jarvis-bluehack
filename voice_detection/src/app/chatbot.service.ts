import { Injectable } from '@angular/core';
import Artyom from './artyom';


const GLOBAL_STATE =  0
declare const io

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  chatbot:Artyom = new Artyom()
  state = 0
  socket = io("localhost:9099")

  constructor(
  ) {
    this.chatbot.initialize({
      lang:"en-GB",
      soundex:true,
      debug:true,
      continuous:true,
      listen:true
    })
  }


  addGlobalCommands(){

  }

  addSubState(){

  }
}
