import { Component } from '@angular/core';
import Artyom from './artyom';
import {ChatbotService} from './chatbot.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  state = 0

  constructor(
    private chatbot:ChatbotService
  ){
    const bot = chatbot.chatbot
    const socket = chatbot.socket


    bot.on(["Jarvis *"],true).then((i,text)=>{
      // bot.say(text)
      this.state = 1
      if(~text.toLowerCase().indexOf("youtube")){
        socket.emit("youtube.open")
      }
      else if(text.startsWith("start typing")){
        this.state = 2
      }

    })

    bot.on(["*"],true).then((i,text)=>{
      console.log(this.state);
      switch (this.state) {
        case 0:
          if(text.startsWith("good")){
            bot.say("you are in global")
            return
          }

          break
        case 1:
          if(text.startsWith("search ")){
            socket.emit("youtube.search",text.substring("search ".length))
            return
          }
          else if(text.startsWith("play this one")){
            socket.emit("leftclick")
            return
          }
          else if(text.startsWith("stop")) {
            console.log("reach");
            socket.emit("youtube.close")
            this.state = 0
            return
          }
          break
        case 2:
          if(text.toLowerCase().startsWith("next line")){
            socket.emit("keyboardtype","\n")
          }
          else if(text.toLowerCase().startsWith("do it again")){
            socket.emit("keyboard.undo")
          }
          else{
            // const words = text.substr("type".length + 1)
            socket.emit("keyboardtype",text)
          }
      }

      if(text.startsWith("reset") || text.startsWith("reset mouth")){
        socket.emit("resetmouse")
        return
      }

      // else if(text.startsWith("scroll")){
      //   socket.emit("scroll")
      // }
      //
      // else if(text.startsWith("click")){
      //   socket.emit("leftclick")
      // }
    })



    // this.mainJarvis.say("at your service")
  }
}
