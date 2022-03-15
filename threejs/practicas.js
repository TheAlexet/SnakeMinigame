/*
** Práctica de
** @author: Alejandro Vicent Micó
** @date: 28-02-2022
*/

// Variables globales estandar
var renderer, scene, camera;

// Otras variables
var terreno, snake, comida, leftPupil, rightPupil, marcador, mensajeDerrota, rocas;
var casillas = [];
var snakeCuerpo = [];
var snakeDireccion = "down";
var snakeCuerpoIndice = 0;
var jugando = true;
var anguloComida = 0;
var antes = Date.now();
var parpadeando = false;
var cerrando = true;
var casillaComida = 0;
var comidaSubiendo = true;
var ultimoMovimiento = Date.now();
var direccionCambiada = false;
var puntuacion = 0;
var nubes = [];
var rocas = [];

init();
loadScene();
setupGUI();
setupKeyControls();
render();

// Inicializacion de motor, escena y camara
function init() {
	// Motor de render
	añadirMotor();

	// Escena
	scene = new THREE.Scene();

	// Camara
	añadirCamara();

	// Controlador de cámara
	añadirControlCamara();

	// Luces
	añadirLuces();

	// Musica
	añadirMusica();
}

// Motor de renderizado
function añadirMotor() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color(0x000000) );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;
	document.getElementById('container').appendChild(renderer.domElement);
}

// Cámara
function añadirCamara() {
	var aspectRatio = window.innerWidth/window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, aspectRatio, 0.1, 100 );
	camera.position.set( 1, 10, 10 );
	camera.lookAt( new THREE.Vector3( 1,0,0 ) );
}

// Control de cámara
function añadirControlCamara() {
	cameraControl = new THREE.OrbitControls(camera,renderer.domElement);
	cameraControl.target.set(1,0,0);
	cameraControl.enableZoom = true;
	cameraControl.keys = null;
	cameraControl.minDistance = 8;
	cameraControl.maxDistance = 20;
	cameraControl.update();
}

// Luces de la escena
function añadirLuces() {
	var ambiental = new THREE.AmbientLight(0xffffff);
	scene.add(ambiental);

	var direccional = new THREE.DirectionalLight( 0xffffff, 0.5 );
	direccional.position.set( 150, 100, 0 );
	direccional.target.position.set( 0,1,0 );
	direccional.angle = Math.PI/7;
	direccional.penumbra = 1;
	direccional.castShadow = true;
	scene.add( direccional );
}

// Musica
function añadirMusica() {
	// create an AudioListener and add it to the camera
	const listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	const sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'sounds/ambientMusic.ogg', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.05 );
		sound.play();
	});
}

// Cargado de la escena y sus objetos
function loadScene() {
	// Cielo
	crearCielo();
	
	// Isla
	crearIsla();

  	// Terreno de juego
	terreno = crearTerreno();

	// Snake
	snake = crearSnake();
	alargarSnake();

	// Comida del snake
	generarComida();
	
	// Marcador
	crearMarcador();

	scene.add( terreno );
	scene.add( snake );
}

// Creacion del cielo
function crearCielo() {
	var entorno = [ "images/sky_ft.jpg" , "images/sky_bk.jpg",
	                "images/sky_up.jpg" , "images/sky_dn.jpg",
	                "images/sky_rt.jpg" , "images/sky_lf.jpg"];
	var texEsfera = new THREE.CubeTextureLoader().load( entorno );
	var shader = THREE.ShaderLib.cube;
	shader.uniforms.tCube.value = texEsfera;

	var matParedes = new THREE.ShaderMaterial( {
						vertexShader: shader.vertexShader,
						fragmentShader: shader.fragmentShader,
						uniforms: shader.uniforms,
						depthWrite: false,
						side: THREE.BackSide
	} );

	var habitacion = new THREE.Mesh( new THREE.CubeGeometry(30,30,30), matParedes );
    habitacion.name = 'habitacion';
	scene.add(habitacion);
	crearNubes();
}

// Creacion de las nubes
function crearNubes() {
	var loader = new THREE.ObjectLoader();
	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(1,1,1);
		objeto.position.set(-3,12,3);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});
	
	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(1,1,1);
		objeto.position.set(2,14,-2);
		objeto.rotation.set(Math.PI/2, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(0.2,0.2,0.2);
		objeto.position.set(0.8,14,-0.8);
		objeto.rotation.set(Math.PI, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(0.8,0.8,0.8);
		objeto.position.set(7,10,1);
		objeto.rotation.set(Math.PI/2, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(1.2,1.2,1.2);
		objeto.position.set(10,3,-8);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(0.7,0.7,0.7);
		objeto.position.set(4,0,-10);
		objeto.rotation.set(Math.PI/2, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(0.9,0.9,0.9);
		objeto.position.set(17,12,-2);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(0.8,0.8,0.8);
		objeto.position.set(-12,10,0);
		objeto.rotation.set(Math.PI/2, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(1,1,1);
		objeto.position.set(-6,0,8);
		objeto.rotation.set(Math.PI/2, 0, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(0.5,0.5,0.5);
		objeto.position.set(6,1,9);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(0.8,0.8,0.8);
		objeto.position.set(-3,1,-15);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube1.json', 
		function (objeto){
		objeto.scale.set(0.8,0.8,0.8);
		objeto.position.set(18,3,-15);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});

	loader.load( 'models/nube/nube2.json', 
		function (objeto){
		objeto.scale.set(1.2,1.2,1.2);
		objeto.position.set(-15,1,-14);
		objeto.rotation.set(Math.PI/2, Math.PI, 0);
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
		nubes.push(objeto);
	});
}

// Creacion de la isla
function crearIsla() {
	var loader = new THREE.ObjectLoader();
	loader.load( 'models/isla/islas.json', 
		         function (objeto){
                    objeto.scale.set(0.006,0.006,0.006);
                    objeto.position.set(0.5,-7.4,-2);
					objeto.rotation.y = Math.PI/2;
					aplicarSombrasGenerador(objeto);
					scene.add(objeto);
		         });

	loader.load( 'models/isla/rocas.json', 
		         function (objeto){
                    objeto.scale.set(0.006,0.006,0.006);
                    objeto.position.set(0.5,-7.4,-2);
					objeto.rotation.y = Math.PI/2;
					aplicarSombrasGenerador(objeto);
					scene.add(objeto);
					rocas.push(objeto);
		         });
				 
	loader.load( 'models/isla/rocas.json', 
		         function (objeto){
                    objeto.scale.set(0.006,0.006,0.006);
                    objeto.position.set(0.5,-7.4,-2);
					objeto.rotation.y = -Math.PI/2;
					aplicarSombrasGenerador(objeto);
					scene.add(objeto);
					rocas.push(objeto);
		         });

	crearArboles();			 
}

// Creacion de los arboles
function crearArboles() {
	var loader = new THREE.ObjectLoader();
	loader.load( 'models/tree/tree1.json', 
		function (objeto){
		objeto.scale.set(0.3,0.3,0.3);
		objeto.position.set(7,-1,3);
		objeto.rotation.y = Math.PI/2;
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
	});	

	loader.load( 'models/tree/tree2.json', 
		function (objeto){
		objeto.scale.set(0.3,0.3,0.3);
		objeto.position.set(7.5,-1.2,-1);
		objeto.rotation.y = Math.PI/2;
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
	});	

	loader.load( 'models/tree/tree3.json', 
		function (objeto){
		objeto.scale.set(0.3,0.3,0.3);
		objeto.position.set(1,-1,-7);
		objeto.rotation.y = Math.PI/2;
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
	});

	loader.load( 'models/tree/tree2.json', 
		function (objeto){
		objeto.scale.set(0.3,0.3,0.3);
		objeto.position.set(-7,-1.8,-3);
		objeto.rotation.y = Math.PI/2;
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
	});	

	loader.load( 'models/tree/tree3.json', 
		function (objeto){
		objeto.scale.set(0.3,0.3,0.3);
		objeto.position.set(-6.5,-1.2,2);
		objeto.rotation.y = Math.PI/2;
		aplicarSombrasGenerador(objeto);
		scene.add(objeto);
	});	
}

// Creacion del terreno de juego
function crearTerreno() {
	var miTerreno = new THREE.Object3D();
	miTerreno.position.set(-5, 0, -5);

	var geoCasilla, matCasilla, casilla, color;

	for(var i = 0; i < 11; i++) {
		for(var j = 0; j < 11; j++) {
			geoCasilla = new THREE.PlaneGeometry(1,1,1,1);
			color = (i + j) % 2 == 0 ? '#89E36F' : '#AEFA7F';
			var matCasilla = new THREE.MeshStandardMaterial({color: color});
			casilla = new THREE.Mesh( geoCasilla, matCasilla );
			casilla.position.set(i, 0, j);
			casilla.rotation.x = -Math.PI/2;
			aplicarSombrasGenerador(casilla);
			casillas.push(casilla);
			miTerreno.add(casilla);
			
		}
	}

	var geoEscalon = new THREE.BoxGeometry(11,2,11);
	var matEscalon = new THREE.MeshStandardMaterial({color: 0xE8844B});
	var escalon = new THREE.Mesh( geoEscalon, matEscalon );
	escalon.position.set(0, -1.001, 0);
	escalon.rotation.set(0, Math.PI/2, 0);
	aplicarSombrasGenerador(escalon);
	scene.add(escalon);
	
	return miTerreno;
}

// Creacion del snake
function crearSnake() {
	var miSnake = new THREE.Object3D();
	miSnake.position.set(0, 0.5, 0);
	miSnake.rotation.set(-Math.PI/2, 0, Math.PI);

	var geoSnake, matSnake, miSnakeCuerpo, textureSnake, entorno, shader, 
		geoEyes, matEyes, leftEye, rightEye, 
		geoPupils, matPupils, 
		leftNostril, rightNostril, 
		mouth, 
		geoTeethLeft, geoTeethRight, leftTooth, rightTooth;

	geoSnake = new THREE.BoxGeometry(1,1,1);
	textureSnake = new THREE.TextureLoader().load('models/snake/snake.png');
	matSnake = new THREE.MeshStandardMaterial({color: 0xffffff, map: textureSnake,});
   
	miSnakeCuerpo = new THREE.Mesh(geoSnake, matSnake);
	aplicarSombrasGenerador(miSnakeCuerpo);

	geoEyes = new THREE.SphereGeometry(15, 32, 16);
	matEyes = new THREE.MeshBasicMaterial({ color: 0xffffff });
	leftEye = new THREE.Mesh(geoEyes, matEyes);
	rightEye = new THREE.Mesh(geoEyes, matEyes);
	leftEye.scale.set(0.010, 0.010, 0.010);
	rightEye.scale.set(0.010, 0.010, 0.010);
	miSnakeCuerpo.add(leftEye);
	miSnakeCuerpo.add(rightEye);
	leftEye.position.set(0.25, 0.5, 0.2);
	rightEye.position.set(-0.25, 0.5, 0.2);
	aplicarSombrasGenerador(rightEye);
	aplicarSombrasGenerador(leftEye);

	geoPupils = new THREE.SphereGeometry(15, 32, 16);
	matPupils = new THREE.MeshBasicMaterial({ color: 0x000000 });
	leftPupil = new THREE.Mesh(geoPupils, matPupils);
	rightPupil = new THREE.Mesh(geoPupils, matPupils);
	leftPupil.scale.set(0.4, 0.4, 0.4);
	rightPupil.scale.set(0.4, 0.4, 0.4);
	leftEye.add(leftPupil);
	rightEye.add(rightPupil);
	leftPupil.position.set(2, 10, 5);
	rightPupil.position.set(-2, 10, 5);
	aplicarSombrasGenerador(leftPupil);
	aplicarSombrasGenerador(rightPupil);

	leftNostril = new THREE.Mesh(geoPupils, matPupils);
	rightNostril = new THREE.Mesh(geoPupils, matPupils);
	leftNostril.scale.set(0.0015, 0.0015, 0.003);
	rightNostril.scale.set(0.0015, 0.0015, 0.003);
	miSnakeCuerpo.add(leftNostril);
	miSnakeCuerpo.add(rightNostril);
	leftNostril.position.set(0.025, 0.5, 0);
	rightNostril.position.set(-0.025, 0.5, 0);
	aplicarSombrasGenerador(leftNostril);
	aplicarSombrasGenerador(rightNostril);

	mouth = new THREE.Mesh(geoPupils, matPupils);
	mouth.scale.set(0.012, 0.002, 0.01);
	miSnakeCuerpo.add(mouth);
	mouth.position.set(0, 0.5, -0.22);
	aplicarSombrasGenerador(mouth);

	geoTeethLeft = new THREE.Geometry();
	geoTeethRight = new THREE.Geometry();
	var a = new THREE.Vector3(0, 0, 0);
	var b = new THREE.Vector3(4, 0, 0);
	var c = new THREE.Vector3(0, 8, 0);
	geoTeethLeft.vertices.push(a, b, c);
	geoTeethRight.vertices.push(a, b, c);
	var face = new THREE.Face3(0, 1, 2);
	geoTeethLeft.faces.push(face);
	geoTeethRight.faces.push(face);
	leftTooth = new THREE.Mesh(geoTeethLeft, matEyes);
	rightTooth = new THREE.Mesh(geoTeethRight, matEyes);
	leftTooth.scale.set(1, 1.5, 1);
	rightTooth.scale.set(1, 1.5, 1);
	mouth.add(leftTooth);
	mouth.add(rightTooth);
	leftTooth.position.set(5, 4, -11);
	rightTooth.position.set(-8, 4, -11);
	leftTooth.rotation.set(-Math.PI/2, 0, 0);
	rightTooth.rotation.set(-Math.PI/2, 0, 0);

	snakeCuerpo.push(miSnakeCuerpo);
	miSnake.add(miSnakeCuerpo);
	return miSnake;
}

// Crecimiento del cuerpo del snake
function alargarSnake() {
	var geoSnake, matSnake, miSnakeCuerpo, textureSnake;

	geoSnake = new THREE.BoxGeometry(1,1,1);	
	textureSnake = new THREE.TextureLoader().load('models/snake/snake.png');
	matSnake = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		map: textureSnake,
		flatShading: false
	});
   
	miSnakeCuerpo = new THREE.Mesh(geoSnake, matSnake);
	miSnakeCuerpo.position.set(1000, 1000, 0);
	aplicarSombrasGenerador(miSnakeCuerpo);
	snakeCuerpo.push(miSnakeCuerpo);
	snake.add(miSnakeCuerpo);
}

// Creacion del marcador de partida
function crearMarcador() {
	scene.remove(marcador);
	var fontLoader = new THREE.FontLoader();
	matMarcador = new THREE.MeshPhongMaterial({color:'#E8844B',
                                                   specular: '#E8844B',
                                                   shininess: 10 });
	fontLoader.load( 'fonts/optimer_bold.typeface.json',
		             function(font){
		             	var geoMarcador = new THREE.TextGeometry( 
		             		'Puntos: ' + puntuacion,
		             		{
		             			size: 1,
		             			height: 0.1,
		             			curveSegments: 3,
		             			style: "normal",
		             			font: font,
		             			bevelThickness: 0.05,
		             			bevelSize: 0.04,
		             			bevelEnabled: true
		             		});
		             	marcador = new THREE.Mesh( geoMarcador, matMarcador );
		             	marcador.name = 'texto';
		             	scene.add( marcador );
		             	marcador.position.set(-2.5, 7.5, 0);
		             });
}

// Creacion del mensaje de derrota
function crearMensajeDerrota() {
	scene.remove(mensajeDerrota);
	var fontLoader = new THREE.FontLoader();
	matmensajeDerrota = new THREE.MeshPhongMaterial({color:'#E8844B',
                                                   specular: '#E8844B',
                                                   shininess: 50 });
	fontLoader.load( 'fonts/optimer_bold.typeface.json',
		             function(font){
		             	var geomensajeDerrota = new THREE.TextGeometry( 
		             		'Has muerto!',
		             		{
		             			size: 1.5,
		             			height: 0.1,
		             			curveSegments: 3,
		             			style: "normal",
		             			font: font,
		             			bevelThickness: 0.05,
		             			bevelSize: 0.04,
		             			bevelEnabled: true
		             		});
						mensajeDerrota = new THREE.Mesh( geomensajeDerrota, matmensajeDerrota );
		             	scene.add( mensajeDerrota );
		             	mensajeDerrota.position.set(-5.8, 6, 0);
		             });
}

// Controles del snake con las flechas del teclado
function setupKeyControls() {
	document.addEventListener("keydown", onDocumentKeyDown, false);
	function onDocumentKeyDown(event) {
		var keyCode = event.which;
		switch(keyCode) {
			case 37:
				if(snakeDireccion != "left" && snakeDireccion != "right" && !direccionCambiada) {
					direccionCambiada = true;
					snakeDireccion = "left";
					snakeCuerpoIndice = 0;
					girarSnake();
				}
				break;
			case 38:
				if(snakeDireccion != "up" && snakeDireccion != "down" && !direccionCambiada) {
					direccionCambiada = true;
					snakeDireccion = "up";
					snakeCuerpoIndice = 0;
					girarSnake();
				}
				break;
			case 39:
				if(snakeDireccion != "right" && snakeDireccion != "left" && !direccionCambiada) {
					direccionCambiada = true;
					snakeDireccion = "right";
					snakeCuerpoIndice = 0;
					girarSnake();
				}
				break;
			case 40:
				if(snakeDireccion != "down" && snakeDireccion != "up" && !direccionCambiada) {
					direccionCambiada = true;
					snakeDireccion = "down";
					snakeCuerpoIndice = 0;
					girarSnake();
				}
				break;	
		}
	};
}

// Gira la dirección del snake poco a poco
function girarSnake() {
	if(snakeCuerpoIndice < snakeCuerpo.length) {
		switch(snakeDireccion) {
			case "up":
				snakeCuerpo[snakeCuerpoIndice].rotation.set(Math.PI, Math.PI, 0);
				break;
			case "down":
				snakeCuerpo[snakeCuerpoIndice].rotation.set(0, 0, 0);
				break;
			case "left":
				snakeCuerpo[snakeCuerpoIndice].rotation.set(0, 0, -Math.PI/2);
				
				break;
			case "right":
				snakeCuerpo[snakeCuerpoIndice].rotation.set(0, 0, Math.PI/2);
				break;
		}
		snakeCuerpoIndice++;
		setInterval(girarSnake, effectControls.velocidadSnake)
	}
}

// Selecciona una posición aleatoria con una distancia de al menos 1 unidad del snake
function seleccionarPosicion() {
	var casillaResultado = Math.floor(Math.random() * 121);
	var x = Math.floor(casillaResultado / 11);
	var z = casillaResultado % 11;
	var a, b;

	for(var i = 0; i < snakeCuerpo.length; i++) {
		a = -snakeCuerpo[i].position.x + 5 - x;
		b = snakeCuerpo[i].position.y + 5 - z;
		if(a == 0 && b == 0) {
			seleccionarPosicion();
		}
	}

	return casillaResultado;
}

// Genera la comida del snake en una casilla aleatoria
function generarComida() {
	casillaComida = seleccionarPosicion();

	var loader = new THREE.ObjectLoader();
	loader.load( 'models/apple/apple.json', 
		         function (objeto){
					comida = objeto;
                    comida.scale.set(0.2,0.2,0.2);
					comida.position.set(0,0,0.3);
					comida.rotation.set(0,0,0);
					aplicarSombrasGenerador(comida);
					casillas[casillaComida].add(comida);
		         });
}

// Inicializacion de la interfaz de usuario
function setupGUI() {
	// Controles
	effectControls = {
		mensaje: "Interfaz",
		velocidadSnake: 500,
		puntosManzana: 1,
		invencible: false,
		atravesarParedes: true,
		resetear: function() {
			resetearPartida();
		}
	};

	// Interfaz
	var gui = new dat.GUI();
	var folder = gui.addFolder("Ajustes de Partida");
	folder.add( effectControls, "velocidadSnake", 100, 1000, 10 ).name("Velocidad Snake");
	folder.add( effectControls, "puntosManzana", 1, 10, 1 ).name("Puntos Manzana");
	folder.add( effectControls, "invencible" ).name("Invencible");
	folder.add( effectControls, "atravesarParedes" ).name("Atravesar Paredes");
	folder.add( effectControls, "resetear" ).name("Resetear Partida");
}

// Reseteamos la partida
function resetearPartida() {
	scene.remove(snake);
	snake = null;
	snakeCuerpo = [];
	snakeCuerpoIndice = 0;
	snakeDireccion = "down";
	parpadeando = false;
    cerrando = true;
	direccionCambiada = false;
	snake = crearSnake();
	alargarSnake();
	scene.add(snake);

	casillas[casillaComida].remove(comida);
	casillaComida = 0;
	anguloComida = 0;
	comidaSubiendo = true;
	comida = null;
	generarComida();

	puntuacion = 0;
	scene.remove(marcador);
	marcador = null;
	crearMarcador();

	scene.remove(mensajeDerrota);
	mensajeDerrota = null;
	
    antes = Date.now();
    ultimoMovimiento = Date.now();
	
	jugando = true;
}

// Cambiar propiedades entre frames
function update() {
	if(jugando) { 
		moverSnake();
		comprobarSnakeMuere();
		animarComida();
		animarSnake();
	}
	animarRocas();
	animarNubes();
}

// Mover las rocas de la isla
function animarRocas() {
	for(var i = 0; i < rocas.length; i++) {
		rocas[i].rotation.y += 0.002;
	}
}

// Mover las nubes
function animarNubes() {
	for(var i = 0; i < nubes.length; i++) {
		nubes[i].position.x += 0.005;
		if(nubes[i].position.x > 25) {
			nubes[i].position.x = -20;
		}
	}
}

// Mueve el snake utilizando las flechas del teclado como input
function moverSnake() {
	// Calcular dirección hacia la que se mueve el snake
	var ahora = Date.now();
	if(ahora - ultimoMovimiento >= effectControls.velocidadSnake) {
		for(var i = snakeCuerpo.length - 1; i > 0; i--) {
			snakeCuerpo[i].position.x = snakeCuerpo[i - 1].position.x;
			snakeCuerpo[i].position.y = snakeCuerpo[i - 1].position.y;
		}
		switch(snakeDireccion) {
			case "up":
				if(snakeCuerpo[0].position.y == -5) {
					if(effectControls.atravesarParedes) {
						snakeCuerpo[0].position.y = 5;
					} else {
						if(jugando) snakeMuere();
					}
				} else {
					snakeCuerpo[0].position.y -= 1;
				}
				break;
			case "down":
				if(snakeCuerpo[0].position.y == 5) {
					if(effectControls.atravesarParedes) {
						snakeCuerpo[0].position.y = -5;
					} else {
						if(jugando) snakeMuere();
					}
				} else {
					snakeCuerpo[0].position.y += 1;
				}
				break;
			case "left":
				if(snakeCuerpo[0].position.x == 5) {
					if(effectControls.atravesarParedes) {
						snakeCuerpo[0].position.x = -5;
					} else {
						if(jugando) snakeMuere();
					}
				} else {
					snakeCuerpo[0].position.x += 1;
				}
				break;
			case "right":
				if(snakeCuerpo[0].position.x == -5) {
					if(effectControls.atravesarParedes) {
						snakeCuerpo[0].position.x = 5;
					} else {
						if(jugando) snakeMuere();
					}
				} else {
					snakeCuerpo[0].position.x -= 1;
				}
				break;
		}
		ultimoMovimiento = ahora;
		comprobarSnakeCome();
		comprobarSnakeMuere();
		direccionCambiada = false;
	}
}

// Comprueba si el snake se ha comido la fruta
function comprobarSnakeCome() {
	var a = -snakeCuerpo[0].position.x + 5 - casillas[casillaComida].position.x;
	var b = snakeCuerpo[0].position.y + 5 - casillas[casillaComida].position.z;
	if(a == 0 && b == 0) {
		casillas[casillaComida].remove(comida);
		alargarSnake();
		generarComida();
		puntuacion += parseInt(effectControls.puntosManzana);
		crearMarcador();
	}
} 

// Comprueba si el snake se ha muerto
function comprobarSnakeMuere() {
	if(!effectControls.invencible) {
		for(var i = 1; i < snakeCuerpo.length; i++) {
			if(snakeCuerpo[0].position.x == snakeCuerpo[i].position.x && snakeCuerpo[0].position.y == snakeCuerpo[i].position.y) {
				if(jugando) snakeMuere();
			}
		}
	}
}

// Snake muere
function snakeMuere() {
	jugando = false;
	crearMensajeDerrota();
}



// Anima la comida del snake
function animarComida() {
	if(comida != undefined) {
		anguloComida += 0.01;
		comida.rotation.set(0, 0, anguloComida)
		if(comidaSubiendo) {
			comida.position.z += 0.005
			if(comida.position.z > 0.8) {
				comidaSubiendo = false;
			}
		} else {
			comida.position.z -= 0.005
			if(comida.position.z < 0.3) {
				comidaSubiendo = true;
			}
		}
	}
} 

// Anima el snake
function animarSnake() {
	var ahora = Date.now();
	if(!parpadeando) {
		if(ahora - antes > 3000) {
			parpadeando = true;
		}
	} else {
		if(cerrando) {
			leftPupil.scale.z -= 0.01
			rightPupil.scale.z -= 0.01
			if(leftPupil.scale.z < 0.05) {
				cerrando = false;
			}
		} else {
			leftPupil.scale.z += 0.01
			rightPupil.scale.z += 0.01
			if(leftPupil.scale.z == 0.4) {
				cerrando = true;
				parpadeando = false;
				antes = ahora;
			}
		}	
	}	
}

// Aplicacion de sombras cuando miObjeto genera y recibe sombras
function aplicarSombrasGenerador(miObjeto) {
	miObjeto.traverse(function(node) {
		if (node.isMesh) {
		  node.receiveShadow = true;
		  node.castShadow = true;
		}
	});
}

// Aplicacion de sombras cuando miObjeto solo recibe sombras
function aplicarSombrasRecibidor(miObjeto) {
	miObjeto.traverse(function(node) {
		if (node.isMesh) {
		  node.receiveShadow = true;
		}
	});
}

// Blucle de refresco
function render() {
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}