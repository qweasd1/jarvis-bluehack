import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FaceRecognitionComponent } from './face-recognition/face-recognition.component';

@NgModule({
  declarations: [
    AppComponent,
    FaceRecognitionComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
