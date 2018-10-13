# Jarvis - use Face + Voice control your device
![jarvis](https://vignette.wikia.nocookie.net/marvelcinematicuniverse/images/b/b0/JuARaVeInSy.png/revision/latest?cb=20120722164138)

This is the MVP code for Jarvis in Bluehack. See the final [demo](https://youtu.be/RFzEWv3bsXY) which use Jarvis to watch youtube using your face and voice

## main components
* face_detection: use face detection algorithm to detect face features and generate mouse move/click signal to backend
* voice_detction: detect what you said and send signal to backend
* backend: process the signal from frontend and control your computer


## Technology Stack
![tech_stack](http://i.imgur.com/EuQHqpLr.jpg)


## before you run
* install firefox on your computer
* download firefox [driver](https://github.com/mozilla/geckodriver/releases) and put it on your ```PATH``` environment variable

## how to run
* face_detection: simple open the ```face_detection/index.html``` in your browser
* voice_detection: run ```"cd voice_detection && ng serve"``` in commandline and then go to localhost:4200 in your browser
* backend: run ```"node backend/face-control-backend.js"```

you are all set and enjoy


