var canvas;
var gl;

/* -------------------------- Variables de Control -------------------------- */
//Maneja la posicion en Y del box. Se va decrementando cada vez que se corre el
//render y se incrementa cuando el usuario entra la tecla de space
var yTranslation = 0.000001;
//Variable que controla si el juego debe empezar o no
var start = 0;
//Variable que nos dice si fue la primera vez que se corrio el render
//para esa forma hacer el render una vez, y despues parar hasta que
//el usuario empieze el jeugo
var firstTime = 1;
//Variable para llevar el score del juego actual
var score = 0;
//Variable que lleva la puntuacion mas alta
var highScore = 5;
//Variable que usamos para las translaciones en x de los pipes, se va
//incrementando cada vez que se hace el render.
var xMovement = 0;
//Variable que usamos para crear espacios entre los pipes.
var xTranslation = 0;
//Arreglo donde se guarda donde esta localizado en Y el espacio por donde
//debe pasar el box entre pipes
var randomNess = [ 0.0, 0.0, 0.0, 0.0 ];
//Variable de control donde sabemos si hubo un gameover para no refrescar
//la pantalla y no aceptar mas users inputs hasta que el juego se re-inicie.
var isGameOver = 0;

//Matriz de modelado para hacer las translaciones, y el escalado
var u_modelMatrix;
var modelMatrix;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    initBuffers(vertexColorGreen, vertices, indices);
    //funcion de js para capturar eventos, de teclas presionadas por el usuario
    document.onkeydown = function (ev) {
      switch (ev.keyCode) {
          //Capturamos si debemos permitir que el box suba dependiendo si no hubo
          //un gameover y si el usuario comenzo el juego (SPACEBAR)
          case 32: if(isGameOver == 0 && start == 1){
                     yTranslation -= 0.15;
                     var audio = new Audio('Sounds/sfx_wing.wav');
                     audio.play();
                   } break;
          //Si no estamos en la pantalla de gameover, permitimos que el usuario
          //comienze el juego (ENTER)
          case 13: if(isGameOver == 0) {
                     start = 1;
                     document.getElementById("score").innerHTML = "Score: " + score;
                   } break;
          //Si hubo un gameover, permitimos al usuario resetear el juego. Por
          //ende reseteamos todas las variables de control
          case 82: if(isGameOver == 1){
                     yTranslation = 0.000001;
                     start = 0;
                     isGameOver = 0;
                     firstTime = 1;
                     score = 0;
                     xMovement = 0;
                     //Aqui se encuentra el primer pipe, en la posicion 3. El
                     //primero siempre es zero, porque queremos que el primer
                     //pipe siempre aparezca en la primera posicison
                     randomNess[3] = 0;
                     for (i = 0; i < 3; i++) {
                       randomNess[i] = (1 + Math.floor(Math.random() * 10)) * 0.1;
                       var zeroOrOne = Math.floor(Math.random() * 2);
                       if (zeroOrOne == 1)
                         randomNess[i] = -randomNess[i];
                     }
                     document.getElementById("score").innerHTML = "Press Enter "
                        + "to Start!<br> <br> Current High Score: " + highScore;
                   } break;
      }
    };
    randomNess[3] = 0;
    //Tenemos el for loop que va por los remaining pipes, y para cada posicion
    //se crea un valor random que va desde -1 a 1 en incrementos de .1. Estos
    //valores se usan para posicionar el espacio seguro entre pipes donde el
    //box tiene que pasar aleatoreamente
    for (i = 0; i < 3; i++)
    {
      randomNess[i] = (1 + Math.floor(Math.random() * 10)) * 0.1;
      var zeroOrOne = Math.floor(Math.random() * 2);
      //Anadimos valores negativos de vez en cuando aleatoreamente
      if (zeroOrOne == 1)
        randomNess[i] = -randomNess[i];
    }
    document.getElementById("score").innerHTML = "Press Enter to Start! <br><br>" +
                              "Press the Space Bar To Make the Box Go up! "
                              + "<br> <br> Current High Score: " + highScore;
    render();
}

//Funcion para renderizar nuestro programa
function render()
{
  //Si la variable de control de start es cierto, el programa continua el
  //rendering. La variable de control firstTime la usamos para imprimir la
  //pantalla una vez cuando sube el programa
  if(start == 1 || firstTime == 1)
  {
    initBuffers(vertexColorGreen, vertices, indices);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //Si el movimiento en x es .3, aproximado, ese es el momento en el que
    //el box pasa el pipe. Se añade un punto y suena el sonido del punto
    if (xMovement > .298 && xMovement < .3) {
      score++;
      var audio = new Audio('Sounds/sfx_point.wav');
      audio.play();
      //El score se le da update en el HTML
      document.getElementById("score").innerHTML = "Score: " + score;
    }
    //Si el movimiento en x es .5 o mas, significa que el pipe en la posicion 3,
    //o sea, el pipe mas cercano al box ya va a salir de la pantalla. Por eso
    //tenemos que hacer varias cosas para que el programa siga funcionando sin
    //ningun problema.
    if (xMovement > .5)
    {
      //Inicializamos la variable de xMovement a cero, para que los pipes vuelvan
      //a desplegarse desde el principio del canvas
      xMovement = 0;

      //Guardamos los valores de randomNess en una arreglo temporero ya que
      //tenemos que cambiar el orden de randomNess ya que uno de los arreglos,
      //el tercero salio de la pantalla y un nuevo pipe se tiene que dibujar tambien
      var tempArray = [0, 0, 0, 0];
      for (i = 0; i < 4; i++)
        tempArray[i] = randomNess[i];

      //Nuevo random para el pipe en la posicion cero, q es el pipe mas a la
      //derecha de nuestro canvas
      randomNess[0] = (1 + Math.floor(Math.random() * 10)) * 0.1;
      var zeroOrOne = Math.floor(Math.random() * 2);
      if (zeroOrOne == 1)
        randomNess[0] = -randomNess[0];

      //Ahora, lo que hacemos es asignamos los valores que teniamos de randomNess
      //de la posicion 0, 1 y 2 a , 1, 2, 3, respectivamente. EL pipe que teniamos
      //en la posicion 3 se fue, y el que teniamos en la posicion 2, ahora estara
      //en la posicion 3 (con el xMovement reseteado), el que teniamos en la posicion
      //1, ahora estara en la 2, y el de la posicion 0, en la 1. El de la posicion
      //0 es un pipe nuevo.
      randomNess[1] = tempArray[0];
      randomNess[2] = tempArray[1];
      randomNess[3] = tempArray[2];
    }
    var i;
    var xTranslation = 0;

    //Loop que imprime los cuatro pipes en la pantalla. Para cada pipe hay dos
    //figuras rectangulares, arriba y abajo. El randomNess se usa en el scaling
    //para hacer la figura mas larga o mas corta. El mismo size que se alarga
    //en uno de los dos pipes, se acorta en el otro
    for (i = 0; i < 4; i++) {
      //Con la funcion de translate se hace el translate del pipe  incluyendo
      //el movimiento en x, y la translacion en x, que indica el spacing entre
      //los pipes. Primero se dibuja el pipe de arriba aqui.
      modelMatrix = translate((0.9 - xTranslation - xMovement), 1, 0);
      //Con la funcion del scale, hacemos el scaling de nuestro primer pipe de
      //arriba. El randomNess se usa en el scaling para hacer la figura mas
      //larga o mas corta. El mismo size que se alarga en uno de los dos pipes,
      //se acorta en el otro
      modelMatrix = mult(modelMatrix, scale(.15, 1.5 + randomNess[i], 0));

      //Se le da update a la matrix de modelado
      gl.uniformMatrix4fv(u_modelMatrix, false, flatten(modelMatrix));
      //Se dibuja el pipe de arriba
      gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );

      //Aqui se hace el translate del pipe de abajo
      modelMatrix = translate((0.9 - xTranslation - xMovement), -1, 0);
      //Aqui se hace el scaling del pipe de abajo. El randomNess que se sumo
      //en el de arriba, se resta aqui. Com el randomNess siempre va en
      //incrementos de .1 el 'safe zone' siempre es del mismo tamano
      modelMatrix = mult(modelMatrix, scale(.15, 1.5 - randomNess[i], 0));

      //Se le da update a la matrix de modelado
      gl.uniformMatrix4fv(u_modelMatrix, false, flatten(modelMatrix));
      //Se dibuja el pipe de abajo
      gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0  );

      //Movemos a .5 y alli es donde imprimiremos el proximo pipe
      xTranslation += .5;
      //Con esto controlamos el moviento en x.
      xMovement += 0.0006;
    }

    //Si el movimiento en x esta entre .1 y .3, esto implica que el box esta
    //pasando por el safe zone y tenemos que verificar si hay colisiones
    if (xMovement > .1 && xMovement < .3)
    {
      //Esta es una ecuacion(es) que encontramos para determinar si hay colision en
      //base a la posicion en y del box, y el valor de randomNess. Se verifica
      //si hay colision en el pipe de arriba y el de abajo.
      //Para encontrar esta formula, manualmente capturamos puntos de yTranslation
      //donde habia colision arriba y abajo para varios valores de -1 a 1 con
      //incrementos en .1, y asi encontramos la formula
      if( yTranslation < randomNess[3] * .5 - 0.15 || yTranslation > randomNess[3] * .5 + 0.15 )
      {
        //Hubo colision, y por eso el programa deja de renderizar imagenes ya
        //que seteamos la variable de control isGameOver a 1. Tambien enviamos
        //el audio de gameover y verificamos si hubo un nuevo highScore
        var audio = new Audio('Sounds/sfx_hit.wav');
        audio.play();
        if(score > highScore)
          highScore = score;
        document.getElementById("score").innerHTML =
                  "GAME OVER! <br> SCORE: " + score + "<br>HIT 'R' TO TRY AGAIN!"
                  + "<br> <br> Current High Score: " + highScore;
        isGameOver = 1;
        start = 0;
      }
    }
    //Cada vez que se renderiza la figura, le restamos un poco a la variable de
    //control de yTranslation para que el box baje (esta sube cuando se entra
    //un input en el spacebar)
    yTranslation += 0.004;
    initBuffers(vertexFunColors, vertices, indices);
    //Le damos update a nuestra matriz de escalado para el box, usando translacion
    modelMatrix = translate(-.8, -yTranslation, 0);
    //Y aqui scaling
    modelMatrix = mult(modelMatrix, scale(.1, .2, 0));
    //Subimos nuestra nueva modelMatrix antes de dibujar nuestro box
    gl.uniformMatrix4fv(u_modelMatrix, false, flatten(modelMatrix));
    //Dibujamos nuestro box
    gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );
  }
  //Cambiamos la variable de control firstTime a zero, ya que imprimimos la
  //imagen una vez
  firstTime = 0;
  window.requestAnimationFrame( render );
}

//Funcion para initializar los buffers dado unos colores, vertices e indices
function initBuffers(vertexColors, v, i)
{
  //  Load shaders and initialize attribute buffers
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

  //Nuestro variable de modelado
  u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
}

//Vertices de los pipes y del box
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

//Vertices para hacer los pipes verdes
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

//Vertices para darle color al box
var vertexFunColors = [
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.5, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 0.0, 1.0, 1.0 )   // cyan
];

//Indices de nuestros pipes y flappy box
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
