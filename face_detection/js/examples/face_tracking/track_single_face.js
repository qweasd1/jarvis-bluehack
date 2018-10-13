(function exampleCode() {
  "use strict";

  brfv4Example.initCurrentExample = function (brfManager, resolution) {

    // By default everything necessary for a single face tracking app
    // is set up for you in brfManager.init. There is actually no
    // need to configure much more for a jump start.

    brfManager.init(resolution, resolution, brfv4Example.appId);
  };

  const socket = io.connect("localhost:9099")
  let first_x = null
  let first_y = null
  let scale = 1
  let _vertices = null

  let mode = 0 // 0- mouse move, 1- mouse scroll
  let scrollSpeedLOW = 1
  let scrollSpeedQUICK = 10

  // root source
  let zoomSource
  let zoomStream = rxjs.Observable.create((_sub) => {
    zoomSource = _sub
  })

  let leftclickSource
  let leftclickStream = rxjs.Observable.create((_sub) => {
    leftclickSource = _sub
  })


  let scaleSource
  let scaleStream = rxjs.Observable.create((_sub) => {
    scaleSource = _sub
  })



  // scale pipe
  // scaleStream.pipe(
  //   rxjs.operators.map(x=>{
  //     return x
  //   }),
  //   rxjs.operators.map((vertices) => dist_average(vertices, 30, [27, 28, 29, 31, 32, 33, 34, 35]) / 10),
  //   rxjs.operators.map(x => Math.floor(x * 20)/20),
  //   rxjs.operators.distinctUntilChanged()
  // ).subscribe((data) => {
  //   console.log(data);
  //   scale = data
  // })


  // zoom Toogle
  const MOUTH_CLOSE_CLICK_THREHOLD = 120
  let previous = -1


  zoomStream.pipe(
    rxjs.operators.map((data) => {
      return mouthMetric(data) / scale
    }),
    rxjs.operators.bufferTime(100),
    rxjs.operators.map((x)=>{

      if(average(x) > MOUTH_CLOSE_CLICK_THREHOLD){
        return true
      }
      else {
        return false
      }
    }),
    // rxjs.operators.map(x => {
    //   if (!x) {
    //     return false
    //   }
    //   const x_average = average(x)
    //
    //
    //   if (x_average) {
    //     if (previous === -1) {
    //       previous = x_average
    //       return false
    //     }
    //     if ((x_average - previous) / scale > MOUTH_CLOSE_CLICK_THREHOLD) {
    //       previous = x_average
    //       return true
    //     }
    //     else {
    //       previous = x_average
    //       return false
    //     }
    //
    //   }
    //   {
    //     previous = x_average
    //     return false
    //   }
    // }),
    rxjs.operators.distinctUntilChanged()
  ).subscribe((data) => {

    if (data) {
      console.log("zoom")
      socket.emit("zoom.toggle")
    }
  })

  // left click
  const EYECLOSE_THREHOLD = 1
  let previous_left = -1
  leftclickStream.pipe(
    rxjs.operators.map(vertices => {
      return (
        Math.abs(vertices[19 * 2 + 1] - vertices[27 * 2 + 1])
        // Math.abs(vertices[38 * 2 + 1] - vertices[40 * 2 + 1]) +
        // Math.abs(vertices[17 * 2 + 1] - vertices[41 * 2 + 1]) +
        // Math.abs(vertices[18 * 2 + 1] - vertices[41 * 2 + 1]) +
        // Math.abs(vertices[19 * 2 + 1] - vertices[41 * 2 + 1]) +
        // Math.abs(vertices[20 * 2 + 1] - vertices[41 * 2 + 1])
      ) / scale
    }),
    rxjs.operators.map((x)=>{

      if(previous_left === -1){
        previous_left = x
        return Infinity
      }
      else {
        let result = x - previous_left
        previous_left = x
        return result
      }
    }),
    rxjs.operators.skip(1),
    rxjs.operators.map(x=>{
      if(x < -EYECLOSE_THREHOLD){
        return true
      }
      else {
        return false
      }
    }),
    rxjs.operators.distinctUntilChanged()
  ).subscribe((data)=>{
    if(data){
      console.log("leftclick");
      socket.emit("leftclick")
    }
  })





  // zoomStream.pipe(
  //   rxjs.operators.map((data)=>{
  //     return mouthMetric(data) / scale
  //   })
  // ).subscribe((data)=>{
  //   console.log(data);
  // })

  function averagePoint(all) {
    let x_sum = 0
    let y_sum = 0
    for (let i = 0; i < all.length; i += 2) {
      x_sum += all[i]
      y_sum += all[i + 1]
    }

    return [x_sum / all.length / 2, y_sum / all.length / 2]
  }

  function averageCoordinates(all) {
    let x_sum = 0
    let y_sum = 0
    for (let i = 0; i < all.length; i++) {
      x_sum += all[i][0]
      y_sum += all[i][1]
    }

    return [x_sum / all.length, y_sum / all.length]
  }

  function average(all) {
    let sum = 0
    for (let item of all) {
      sum += item
    }

    return sum / all.length
  }

  function mouthMetric(vertices) {

    return dim1_dist(vertices, 50, 58, 1) + dim1_dist(vertices, 51, 57, 1) + dim1_dist(vertices, 52, 56, 1)
  }

  function dim1_dist(vertices, a, b, dim) {
    return Math.abs(vertices[a * 2 + dim] - vertices[b * 2 + dim])
  }

  function dist_average(vertices, center, others) {
    let distsum = 0
    const center_x = vertices[center * 2]
    const center_y = vertices[center * 2 + 1]
    for (let node of others) {
      const x = vertices[node * 2]
      const y = vertices[node * 2 + 1]
      distsum += Math.sqrt((center_x - x) * (center_x - x) + (center_y - y) * (center_y - y))
    }
    return distsum / others.length
  }


  function resetMouse() {
    const [nose_x, nose_y] = averagePoint(_vertices.slice(27 * 2, 30 * 2))
    first_x = nose_x / scale
    first_y = nose_y / scale
    socket.emit("move", [0, 0])
  }

  function mousescrollStart() {
    mode = 1
  }

  socket.on("resetmouse", resetMouse)
  socket.on("mousescroll.start", mousescrollStart)

  brfv4Example.updateCurrentExample = function (brfManager, imageData, draw) {

    // In a webcam example imageData is the mirrored webcam video feed.
    // In an image example imageData is the (not mirrored) image content.

    brfManager.update(imageData);

    // Drawing the results:

    draw.clear();

    // Face detection results: a rough rectangle used to start the face tracking.

    draw.drawRects(brfManager.getAllDetectedFaces(), false, 1.0, 0x00a1ff, 0.5);
    draw.drawRects(brfManager.getMergedDetectedFaces(), false, 2.0, 0xffd200, 1.0);

    // Get all faces. The default setup only tracks one face.

    var faces = brfManager.getFaces();

    for (var i = 0; i < faces.length; i++) {

      var face = faces[i];

      if (face.state === brfv4.BRFState.FACE_TRACKING_START ||
        face.state === brfv4.BRFState.FACE_TRACKING) {

        // Face tracking results: 68 facial feature points.

        draw.drawTriangles(face.vertices, face.triangles, false, 1.0, 0x00a0ff, 0.4);
        draw.drawVertices(face.vertices, 2.0, false, 0x00a0ff, 0.4);

        const LEFT_INNER = 39
        const LEFT_OUTTER = 36
        const RIGHT_INNER = 42
        const RIGHT_OUTTER = 45
        const NOSE_CENTER = 30
        //
        const vertices = face.vertices
        const left_length = Math.abs(vertices[LEFT_OUTTER * 2] - vertices[LEFT_INNER * 2])
        const right_length = Math.abs(vertices[RIGHT_OUTTER * 2] - vertices[RIGHT_INNER * 2])

        const [nose_x, nose_y] = averagePoint(vertices.slice(27 * 2, 30 * 2))
        // const nose_x = vertices[NOSE_CENTER * 2]
        // const nose_y = vertices[NOSE_CENTER * 2 + 1]

        zoomSource.next(vertices)
        leftclickSource.next(vertices)
        // scaleSource.next(vertices)


        // console.log(left_length / scale - right_length / scale);
        let data


        if (first_x === null) {
          // scale = Math.abs(vertices[27 * 2] - vertices[30 * 2]) + Math.abs(vertices[36 * 2 + 1] - vertices[45 * 2 + 1])
          // console.log("scale",scale);
          first_x = nose_x / scale
          first_y = nose_y / scale
          data = [0, 0]
        }
        else {
          data = [nose_x / scale - first_x, nose_y / scale - first_y]
        }
        // console.log(data);

        if (mode === 0) {
          socket.emit("move", data)
        }

      }
    }
  };

  brfv4Example.dom.updateHeadline("BRFv4 - basic - face tracking - track single face\n" +
    "Detect and track one face and draw the 68 facial landmarks.");

  brfv4Example.dom.updateCodeSnippet(exampleCode + "");
})();