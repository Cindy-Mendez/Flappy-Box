var canvas;
var gl;

var yTranslation = 0.000001;
var start = 0;
var firstTime = 1;
var score = 0;
var highScore = 5;
var xMovement = 0;
var randomNess = [ 0.0, 0.0, 0.0, 0.0 ];
var isGameOver = 0;

var bunnyVertices;
var bunnyIndices;
var colorLocation;
var u_MvpMatrix;
var modelMatrix;
var mvpMatrix;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);

    initBuffers(vertexColorGreen, vertices, indices);
    /*document.getElementById('files').onchange = function(e)
    {
      readFile(e);
    }*/
    document.onkeyup = function (ev) {
      deltaSum = 0;
    };
    document.onkeydown = function (ev) {
      switch (ev.keyCode) {
          case 32: if(isGameOver == 0 && start == 1){
                     yTranslation -= 0.15;
                     var audio = new Audio('Sounds/sfx_wing.wav');
                     audio.play();
                   } break;
          case 13: if(isGameOver == 0)
                   {
                     start = 1;
                     document.getElementById("score").innerHTML = "Score: " + score;
                   } break;
          case 82: yTranslation = 0.000001;
                   start = 0;
                   isGameOver = 0;
                   firstTime = 1;
                   score = 0;
                   xMovement = 0;
                   randomNess[3] = 0;
                   for (i = 0; i < 3; i++)
                   {
                     randomNess[i] = (1 + Math.floor(Math.random() * 10)) * 0.1;
                     var zeroOrOne = Math.floor(Math.random() * 2);
                     if (zeroOrOne == 1)
                       randomNess[i] = -randomNess[i];
                   }
                   document.getElementById("score").innerHTML = "Press Enter to Start!"
                              + "<br> <br> Current High Score: " + highScore;
                   break;
      }
    };
    randomNess[3] = 0;
    for (i = 0; i < 3; i++)
    {
      randomNess[i] = (1 + Math.floor(Math.random() * 10)) * 0.1;
      var zeroOrOne = Math.floor(Math.random() * 2);
      if (zeroOrOne == 1)
        randomNess[i] = -randomNess[i];
    }
    document.getElementById("score").innerHTML = "Press Enter to Start! <br><br>" +
                              "Press the Space Bar To Make the Bunny Go up! "
                              + "<br> <br> Current High Score: " + highScore;
    render();
}

function render()
{
  if(start == 1 || firstTime == 1)
  {
    initBuffers(vertexColorGreen, vertices, indices);
    firstTime = 0;
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (xMovement > .298 && xMovement < .3)
    {
      score++;
      var audio = new Audio('Sounds/sfx_point.wav');
      audio.play();
      document.getElementById("score").innerHTML = "Score: " + score;
    }
    if (xMovement > .5)
    {
      xMovement = 0;

      var tempArray = [0, 0, 0, 0];
      for (i = 0; i < 4; i++)
        tempArray[i] = randomNess[i];

      randomNess[0] = (1 + Math.floor(Math.random() * 10)) * 0.1;
      var zeroOrOne = Math.floor(Math.random() * 2);
      if (zeroOrOne == 1)
        randomNess[0] = -randomNess[0];
      randomNess[1] = tempArray[0];
      randomNess[2] = tempArray[1];
      randomNess[3] = tempArray[2];
    }
    var i;
    var xTranslation = 0;

    for (i = 0; i < 4; i++) {
      modelMatrix = translate((0.9 - xTranslation - xMovement), 1, 0);
      modelMatrix = mult(modelMatrix, scale(.15, 1.5 + randomNess[i], 0));

      gl.uniformMatrix4fv(u_MvpMatrix, false, flatten(modelMatrix));
      gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );

      modelMatrix = translate((0.9 - xTranslation - xMovement), -1, 0);
      modelMatrix = mult(modelMatrix, scale(.15, 1.5 - randomNess[i], 0));

      gl.uniformMatrix4fv(u_MvpMatrix, false, flatten(modelMatrix));
      gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );
      xTranslation += .5;
      xMovement += 0.0006;
    }
    yTranslation += 0.004;
    initBuffers(bunnyColors, bunnyVertices, bunnyIndices);
    modelMatrix = translate(-.8, -yTranslation, 0);
    modelMatrix = mult(modelMatrix, scale(.1, .2, 0));
    if (xMovement > .1 && xMovement < .3)
    {
      if( yTranslation < randomNess[3] * .5 - 0.15 || yTranslation > randomNess[3] * .5 + 0.15 )
      {
        var audio = new Audio('Sounds/sfx_hit.wav');
        audio.play();
        if(score > highScore)
          highScore = score;
        document.getElementById("score").innerHTML =
                  "GAME OVER! <br> SCORE: " + score + "<br>HIT 'R' TO TRY AGAIN!"
                  + "<br> <br> Current High Score: " + highScore;;
        gl.uniformMatrix4fv(u_MvpMatrix, false, flatten(modelMatrix));
        gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );
        isGameOver = 1;
        start = 0;
      }
    }
    gl.uniformMatrix4fv(u_MvpMatrix, false, flatten(modelMatrix));
    gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );
  }
  window.requestAnimationFrame( render );
}
function initBuffers(vertexColors, v, i)
{
  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // array element buffer

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(i), gl.STATIC_DRAW);

  // color array atrribute buffer

  var cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  // vertex array attribute buffer

  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(v), gl.STATIC_DRAW );


  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  colorLocation = gl.getUniformLocation(program, "fColor");
}

/*function readFile(e) {
     bunnyVertices = [];
     bunnyColors = [];
     var file = e.target.files[0];
     var reader = new FileReader();
     reader.onload = function() {
        var lines = this.result.split('\n');
        for (var line = 0; line < lines.length; line++) {
            var strings = lines[line].trimRight().split(' ');
            switch (strings[0]) {
                case ('v'):
                    bunnyVertices.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])) );
                    bunnyColors.push(vec4( Math.random(), Math.random(), Math.random(), 1.0 ));
                    break;
                case('f'):
                    bunnyIndices.push( parseFloat(strings[1]) - 1 );
                    bunnyIndices.push( parseFloat(strings[2]) - 1 );
                    bunnyIndices.push (parseFloat(strings[3]) - 1 );
                    break;
            }
         }
         initBuffers();
     };
     reader.readAsText(file);
}*/

var green_color = vec4( 0.0, 1.0, 0.0, 1.0 );
var red_color = vec4( 1.0, 0.0, 0.0, 1.0 );

var bunnyVertices = [
    vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ),
    vec3(  0.5,  0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 )
];

var vertices = [
    vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ),
    vec3(  0.5,  0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 )
];

var vertexColorGreen = [
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
];

var bunnyColors = [
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.5, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 0.0, 1.0, 1.0 )   // cyan
];

var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

var bunnyIndices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];
