import {AfterViewInit, Component, OnInit} from '@angular/core';
import {interval} from 'rxjs'
import {map} from 'rxjs/operators'

declare const clm:any
@Component({
  selector: 'app-face-recognition',
  templateUrl: './face-recognition.component.html',
  styleUrls: ['./face-recognition.component.css']
})
export class FaceRecognitionComponent implements OnInit, AfterViewInit {


  constructor() { }

  ngOnInit() {

  }

  startVideo(){

  }

  ngAfterViewInit(): void {

  }

}

