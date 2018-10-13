var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
const selenuimApi  = require('./selenium-service')


var robot = require("robotjs");
let {width,height} = robot.getScreenSize()
// Speed up the mouse.
robot.setMouseDelay(2);
// robot.setKeyboardDelay(20)

function handler (req, res) {

}




app.listen(9099);

let isZoomIn = false




async function init(){

  function linear(x,start,end,toStart,toEnd) {
    return (x -start) / (start-end) * (toStart - toEnd) + toStart
  }

  let prev_x = -1
  let prev_y = -1

  let zoom_prev_x = -1
  let zoom_prev_y = -1

  const MOVE_LTHREHOLD = 5
  const ZOOM_MOVE_LTHREHOLD = 2

  const basic_scale = 10
  const zoom_scale = 20

  let zoom_mouse_x = 0
  let zoom_mouse_y = 0

  let lastTextCount = 0

  let zoomMoveHandler = -1
  function zoomMove(){
    zoomMoveHandler = setInterval(()=>{
      if(!isZoomIn){
        clearZoomMove()
      }
      if(zoom_mouse_x !== 0 || zoom_mouse_y !==0){
        zoom_prev_x+=zoom_mouse_x
        zoom_prev_y+=zoom_mouse_y
        robot.moveMouse(zoom_prev_x,zoom_prev_y)
      }
    },50)

  }

  function clearZoomMove(){
      clearInterval(zoomMoveHandler)
  }


  io.on('connection', function (socket) {
    socket.on('move', function (data) {
      if(!data){
        return
      }


      let x,y

      x = linear(data[0],-basic_scale,basic_scale,0,width)
      y = linear(data[1],-basic_scale,basic_scale,0,height)
      // if(isZoomIn){
      //   x = linear(data[0],-zoom_scale,zoom_scale,0,width)
      //   y = linear(data[1],-zoom_scale,zoom_scale,0,height)
      // }
      // else {
      //   x = linear(data[0],-basic_scale,basic_scale,0,width)
      //   y = linear(data[1],-basic_scale,basic_scale,0,height)
      // }

      // const y = 400
      let isMoved
      isMoved = Math.abs(prev_y - y) < MOVE_LTHREHOLD && Math.abs(prev_x - x) < ZOOM_MOVE_LTHREHOLD
      // if(isZoomIn){
      //   isMoved = Math.abs(prev_y - y) < MOVE_LTHREHOLD && Math.abs(prev_x - x) < ZOOM_MOVE_LTHREHOLD
      // }
      // else {
      //   isMoved = Math.abs(prev_y - y) < MOVE_LTHREHOLD && Math.abs(prev_x - x) < MOVE_LTHREHOLD
      // }

      if(isMoved){
        return
      }

      // if(Math.abs(prev_y - y) > MOVE_UTHREHOLD && Math.abs(prev_x - x) > MOVE_UTHREHOLD){
      //   return
      // }


      if(isZoomIn){
        if(x-prev_x > 200){
          zoom_mouse_x = 1
        }
        else if(x-prev_x < -200){
          zoom_mouse_x = -1
        }
        else{
          zoom_mouse_x = 0
        }

        if(y-prev_y < -100){
          zoom_mouse_y = -1
        }
        else if(y-prev_y > 50){
          zoom_mouse_y = 1
        }
        else{
          zoom_mouse_y = 0
        }
        // robot.moveMouseSmooth(zoom_mouse_x,zoom_mouse_y)
        // console.log(zoom_mouse_x,zoom_mouse_y);
      }
      else {
        robot.moveMouse(
          x,
          y
        );

        prev_y = y
        prev_x = x
      }


    });

    socket.on("leftclick",()=>{

      robot.mouseClick("left",false)
    })

    socket.on("keyboardtype",(text)=>{

      if(text === "\n"){
        robot.keyTap("enter")
        robot.keyTap("enter")
        lastTextCount = 2
        return
      }

      text = text.substring(0,1).toLocaleUpperCase() + text.substring(1)



      if(text.startsWith("Would") || text.startsWith("What") || text.startsWith("Where") || text.startsWith("Can")){
        text = text + "? "
      }
      else {
        text = text + ". "
      }
      lastTextCount = text.length
      robot.typeStringDelayed(text,0.02)

    })

    socket.on("keyboard.undo",()=>{
      for (let i = 0; i < lastTextCount; i++) {
        robot.keyTap("backspace")
      }
    })


    socket.on("youtube.open",()=>{
      selenuimApi.goToYoutube()
    })

    socket.on("youtube.search",(data)=>{
      selenuimApi.searchVideo(data)
    })

    socket.on("youtube.close",(data)=>{
      selenuimApi.close()
    })

    socket.on("resetmouse",()=>{
      socket.broadcast.emit("resetmouse")
    })

    socket.on("zoom.toggle",()=>{
      if(isZoomIn){
        robot.keyTap('8',['alt','command'])
        isZoomIn = false
        clearZoomMove()
      }
      else{
        robot.keyTap('+',['alt','command'])
        zoom_prev_x = prev_x
        zoom_prev_y = prev_y
        isZoomIn = true
        zoomMove()
      }
    })

  });


}

init()




