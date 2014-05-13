// 3D webgl chess board with pieces, made by Mark Ganusevich

// Models made with: Blender, exported to .obj and converted
// with convert_obj_three.py
// 3D library used: Three.js
// Inspired by awesome tutorials at: http://code.tutsplus.com/search?search%5Bkeywords%5D=webgl

// > Setting up the renderer and the camera:
// Straightforward initialization of the default renderer with
// antialiasing( needs video card to work ), turning on the shadow map to
// enable shadows. Camera is also nothing special - simple perspective camera.

// > Setting up the lights:
// There are two lights, a main one and a filler one, positioned on different
// sides of the board. The main light casts shadows on object and as such has
// increased shadow fidelity than the default. There's also a skybox to provide
// background lighting, which is a generic cube with only inside rendering. The
// board is set to receive shadows, and the pieces only to cast.

// > Setting up the board:
// Now this is more interesting, the board is procedurally generated, using the
// beginning of coordinates as an origin point. First we generate the squares by
// going through a double loop, the color of the square depends on the count
// being even or odd. After that we add a big flat cube, just a little bit lower
// than the Y of squares.

// > Setting up the chess pieces:
// We have a $pieces structure, which holds information on what types of pieces
// there are, how many and what are their positions. We also have
// $pieces.color.materials for default material of the color, and
// $pieces.color.direction to define how the pieces should be rotated.

// First, we go through every pieces type we need( implemented with white, but
// black is also okay) and queue their loading. When loading finishes, they are
// passed to a piece creation function which creates a mesh from the data and
// set's it's position/scale/rotation depending on its color and type. If the
// type is 'tower', it is cloned into $tower variable for future use, since we
// use the tower model to demonstrate face materials. Note: if you initialize
// geometry without making a backup of it( i.e. cloning ), you may come up with
// dificulties trying to modify it after( particulary with face materials ).

// > Animating the picture:
// The rendering works how you would expect, notable thing is the camera rotation.
// To rotate the camera around the origin point, we use the well known circle eq-
// uation x^2 + y^2 = r^2. To run through the x and z parameters, we are using Cos
// and Sin, since otherwise you would be making half a rotation back and forth.

// > Swapping the materials:
// Before making changes to materials, we reset some of the parameters:
// $materials array for face material, we recreate the $tower pieces in
// case they were modified with face materials, we reinitialise the board for the
// same reason, we also reset all materials to basic.

// After that we create temporary materials, and just loop through all our
// objects changing them, really nothing fascinating.

// If we choose to change the face materials, in case of the board, we just
// generate an array of basics and recreate a new board base with the new array,
// since you can't really modify the material to be a face material after
// creating a mesh. In the case of tower pieces, we do the same, but first we
// edit the materialIndex of it's geometery's face's to represent the different
// materials. 


//Renderer
var width = window.innerWidth;
var height = window.innerHeight;

var renderer = new THREE.WebGLRenderer({ antialias: true });

var scene = new THREE.Scene;

//Camera
var camera = new THREE.PerspectiveCamera( 45, width/height, 0.1, 10000 );

//Lighting
var light = new THREE.DirectionalLight( 0xffffff, 1.2 );
var light_2 = new THREE.DirectionalLight( 0xffffff, 0.2 );

//Board
var board = [];
var piece_size = 30;
var piece_height = 5;
var piece_margin = piece_size * 1.05;
var board_color = 0x280a0a;
var board_base = new THREE.Mesh( new THREE.CubeGeometry( piece_margin*9, piece_height, piece_margin*9), new THREE.MeshPhongMaterial({ color: board_color }) );

//Models
var loader = new THREE.JSONLoader;

var white_piece_color = 0xffffb4;
var black_piece_color = 0x0d0d0d;
var white_piece_material = new THREE.MeshPhongMaterial({ color: white_piece_color });
var black_piece_material = new THREE.MeshPhongMaterial({ color: black_piece_color });
var tower;

var pieces = {
	white: {
		types: {
			tower: {
				0: { x: 0, y: 0},
				1: { x: 0, y: 7}
			},
			horse: {
				0: { x: 0, y: 1},
				1: { x: 2, y: 5}
			},
			elephant: {
				0: { x: 0, y: 2},
				1: { x: 4, y: 1}
			},
			queen: {
				0: { x: 0, y: 3}
			},
			king: {
				0: { x: 0, y: 4}
			},
			trooper: {
				0: { x: 1, y: 0},
				1: { x: 1, y: 1},
				2: { x: 1, y: 2},
				3: { x: 1, y: 3},
				4: { x: 3, y: 4},
				5: { x: 1, y: 5},
				6: { x: 1, y: 6},
				7: { x: 1, y: 7}
			}
		},
		material: white_piece_material,
		side: 1
	},

	black: {
		types: {
			tower: {
				0: { x: 7, y: 0},
				1: { x: 7, y: 7}
			},
			horse: {
				0: { x: 5, y: 2},
				1: { x: 7, y: 6}
			},
			elephant: {
				0: { x: 7, y: 2},
				1: { x: 7, y: 5}
			},
			queen: {
				0: { x: 7, y: 3}
			},
			king: {
				0: { x: 7, y: 4}
			},
			trooper: {
				0: { x: 6, y: 0},
				1: { x: 6, y: 1},
				2: { x: 6, y: 2},
				3: { x: 6, y: 3},
				4: { x: 4, y: 4},
				5: { x: 6, y: 5},
				6: { x: 6, y: 6},
				7: { x: 6, y: 7}
			}
		},
		material: black_piece_material,
		side: -1
	}
}


var piece_movements = {};
piece_movements[ "tower" ] = [ 
	[	{ x: 1, z: 0},
		{ x: 2, z: 0},
		{ x: 3, z: 0},
		{ x: 4, z: 0},
		{ x: 5, z: 0},
		{ x: 6, z: 0},
		{ x: 7, z: 0}	],

	[	{ x: -1, z: 0},
		{ x: -2, z: 0},
		{ x: -3, z: 0},
		{ x: -4, z: 0},
		{ x: -5, z: 0},
		{ x: -6, z: 0},
		{ x: -7, z: 0}	],

	[	{ x: 0, z: 1},
		{ x: 0, z: 2},
		{ x: 0, z: 3},
		{ x: 0, z: 4},
		{ x: 0, z: 5},
		{ x: 0, z: 6},
		{ x: 0, z: 7}	],

	[	{ x: 0, z: -1},
		{ x: 0, z: -2},
		{ x: 0, z: -3},
		{ x: 0, z: -4},
		{ x: 0, z: -5},
		{ x: 0, z: -6},
		{ x: 0, z: -7}	]
	];


piece_movements[ "elephant" ] = [ 
	[	{ x: 1, z: 1},
		{ x: 2, z: 2},
		{ x: 3, z: 3},
		{ x: 4, z: 4},
		{ x: 5, z: 5},
		{ x: 6, z: 6},
		{ x: 7, z: 7}	],

	[	{ x: 1, z: -1},
		{ x: 2, z: -2},
		{ x: 3, z: -3},
		{ x: 4, z: -4},
		{ x: 5, z: -5},
		{ x: 6, z: -6},
		{ x: 7, z: -7}	],

	[	{ x: -1, z: 1},
		{ x: -2, z: 2},
		{ x: -3, z: 3},
		{ x: -4, z: 4},
		{ x: -5, z: 5},
		{ x: -6, z: 6},
		{ x: -7, z: 7}	],

	[	{ x: -1, z: -1},
		{ x: -2, z: -2},
		{ x: -3, z: -3},
		{ x: -4, z: -4},
		{ x: -5, z: -5},
		{ x: -6, z: -6},
		{ x: -7, z: -7}	]
	];

piece_movements[ "horse" ] = [ 
		[{ x: 2, z: -1}],
		[{ x: 2, z: 1}],
		
		[{ x: 1, z: -2}],
		[{ x: 1, z: 2}],
		
		[{ x: -2, z: -1}],
		[{ x: -2, z: 1}],
		
		[{ x: -1, z: -2}],
		[{ x: -1, z: 2}]
	];

piece_movements[ "queen" ] = [];
piece_movements[ "queen" ] = piece_movements[ "queen" ].concat( piece_movements[ "tower" ] );
piece_movements[ "queen" ] = piece_movements[ "queen" ].concat( piece_movements[ "elephant" ] );

piece_movements[ "king" ] = [
		[{ x: 1, 	z: 0}],
		[{ x: -1, 	z: 0}],
		[{ x: 0, 	z: 1}],
		[{ x: 0, 	z: -1}],

		[{ x: 1, 	z: 1}],
		[{ x: -1, 	z: 1}],
		[{ x: 1, 	z: -1}],
		[{ x: -1, 	z: -1}]	
];

piece_movements[ "trooper" ] = [
		[{ x: 1, z: 0, color: "white" }],
		[{ x: 2, z: 0, color: "white", special: "first_move" }],
		[{ x: 1, z: 1, color: "white", special: "attack" }],
		[{ x: 1, z: -1, color: "white", special: "attack" }],
		
		[{ x: -1, z: 0, color: "black" }],
		[{ x: -2, z: 0, color: "black", special: "first_move" }],
		[{ x: -1, z: 1, color: "black", special: "attack" }],
		[{ x: -1, z: -1, color: "black", special: "attack" }]
];
//Controls
var rotate = true;
var direction = 1;
var virtual_board = [];
var objects = [];
var possible_moves = [];
var nav_mesh = [];
var moving_piece = false;
var moved_piece;
var projector = new THREE.Projector();


//Rendering
var clock = new THREE.Clock;
var angle = 0;
var loading_bar;
var load_progress = 0;

//Main
set_renderer();
set_camera();
set_skybox();
set_lights();
set_board();
set_navigation_mesh();
set_pieces();
set_controls();

show_loading(); //render() fires off when models are loaded.







//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~FUNCTION INDEX~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~UI~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var loaded = false;
function after_load(){
	var buttons = document.querySelectorAll('.controls div');
	for( button in buttons ){
		buttons[button].onmouseover = function(){
	        this.className = this.className + " selected";
	    };

	    buttons[button].onmouseout = function(){
		        this.className = this.className.split( "selected", 1 );
	    };

	    buttons[button].onclick = function(){
	    	if(!loaded)
	    		return;

			var temps = document.querySelectorAll('.controls div');
			for( temp in temps ){
				if( typeof temps[temp] == "object" ){
			        temps[temp].className = temps[temp].className.split( " ", 1 );
				}
			}


			switch( this.className ){
				case "material_basic": 
									set_materials( "Basic", true ); 
									break;
				case "material_depth": 
									set_materials( "Depth", true ); 
									break;
				case "material_normal": 
									set_materials( "Normal", true ); 
									break;
				case "material_face": 
									set_materials_face_for( "board" ); 
									break;
				case "material_face_advanced": 
									set_materials_face_for( "white towers" ); 
									break;
				case "material_lambert": 
									set_materials( "Lambert", true ); 
									break;
				case "material_phong": 
									set_materials( "Phong", true ); 
									break;
			};

	        this.className = this.className + " active";
	    }
	};

	loaded = true;
}

function set_controls(){

	window.addEventListener('resize', function() {
		width = window.innerWidth,
		height = window.innerHeight;
		renderer.setSize( width, height );
		camera.aspect = width/height;
		camera.updateProjectionMatrix();
	});
	
	document.addEventListener( "keyup", function( event ){
		if( event.keyCode == ("s").charCodeAt(0) ||  event.keyCode == ("S").charCodeAt(0) ){
			rotate = !rotate;
			document.querySelector( ".play-menu-stop" ).className = rotate? "play-menu-stop": document.querySelector( ".play-menu-stop" ).className+" play-menu-unactive"; 
		} else if( event.keyCode == ("d").charCodeAt(0) ||
				   event.keyCode == ("D").charCodeAt(0) || 
				   event.keyCode == ("a").charCodeAt(0) || 
				   event.keyCode == ("A").charCodeAt(0) ){
			rotate=true;
			document.querySelector( ".play-menu-stop" ).className = "play-menu-stop"; 
		};

		if( event.keyCode == ("d").charCodeAt(0) || event.keyCode == ("D").charCodeAt(0)){
			direction = -1;
			document.querySelector( ".play-menu-left" ).className += " play-menu-unactive"; 
			document.querySelector( ".play-menu-right" ).className = "play-menu-right"; 

		};

		if( event.keyCode == ("a").charCodeAt(0) || event.keyCode == ("A").charCodeAt(0)){
			direction = 1;
			document.querySelector( ".play-menu-left" ).className = "play-menu-left"; 
			document.querySelector( ".play-menu-right" ).className += " play-menu-unactive";
		};
	});

	document.querySelector( ".play-menu-stop" ).onclick = function() {
		rotate = !rotate;
		document.querySelector( ".play-menu-stop" ).className = rotate? "play-menu-stop": document.querySelector( ".play-menu-stop" ).className+" play-menu-unactive"; 
	};

	document.querySelector( ".play-menu-left" ).onclick = function() {
		direction = 1;
		rotate = true;
		document.querySelector( ".play-menu-left" ).className = "play-menu-left"; 
		document.querySelector( ".play-menu-right" ).className += " play-menu-unactive";
		document.querySelector( ".play-menu-stop" ).className = rotate? "play-menu-stop": document.querySelector( ".play-menu-stop" ).className+" play-menu-unactive"; 
	};

	document.querySelector( ".play-menu-right" ).onclick = function() {
		direction = -1;
		rotate = true;
		document.querySelector( ".play-menu-left" ).className += " play-menu-unactive"; 
		document.querySelector( ".play-menu-right" ).className = "play-menu-right"; 
		document.querySelector( ".play-menu-stop" ).className = rotate? "play-menu-stop": document.querySelector( ".play-menu-stop" ).className+" play-menu-unactive"; 
	};

	document.querySelector( "canvas" ).addEventListener( "mousedown", function( event ) { select_piece( event ); } );
	document.querySelector( "canvas" ).addEventListener( "mousemove", function( event ) { analyze_movement( event ); } );
	document.querySelector( "canvas" ).addEventListener( "mouseup", function( event ) { moving_piece = false; } );
}

function show_fps( delta ){
	var fps = Math.floor( 1/delta );
	if( Math.abs( fps - document.querySelector( ".fps" ).innerHTML ) > 6 )
		document.querySelector( ".fps" ).innerHTML = fps;
}

function show_loading(){
	loading_bar = setInterval(function(){
		if( load_progress == 6 ){
			clearInterval(loading_bar);
			document.querySelector( ".loading-bar" ).style.opacity = 0;
			set_virtual_board();
			render();
		}
	}, 100);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INTERACTION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var last_material = "nothing";
function reset(){
	camera.far = 10000;

	if( last_material == "face" ){
		scene.remove( pieces.white.types.tower[0].mesh );
		scene.remove( pieces.white.types.tower[1].mesh );
		create_pieces( "white", "tower", tower.clone() );

		scene.remove( board_base );
		board_base = new THREE.Mesh( new THREE.CubeGeometry( piece_margin*9, piece_height, piece_margin*9 ), new THREE.MeshBasicMaterial({ color: board_color }) );
		board_base.position.set( -piece_margin/2, -0.2, -piece_margin/2 );
		board_base.receiveShadow = true;
		scene.add( board_base );
	}

	last_material = "nothing";

	set_materials( "Basic", false );
}

function set_materials( material, do_reset ) {
	if( do_reset )
		reset();

	var white_pieces_temp = new THREE["Mesh" + material + "Material"]({ color: white_piece_color });
	var black_pieces_temp = new THREE["Mesh" + material + "Material"]({ color: black_piece_color });
	var board_material = new THREE["Mesh" + material + "Material"]({ color: board_color });

	for( var i = 0; i < 8; i++ ){
		for( var j = 0; j < 8; j++ ){
			var color = (7*i+j)%2 == 0? "rgb(0,0,0)": "rgb(251,253,206)";
			board[i][j].material = new THREE["Mesh" + material + "Material"]({ color: new THREE.Color( color ) } );
		};
	}

	board_base.material = board_material;

	for( type in pieces.white.types ){
		for( count in pieces.white.types[type] ){
			pieces.white.types[type][count].mesh.material = white_pieces_temp;
			pieces.black.types[type][count].mesh.material = black_pieces_temp;
		};
	};

	material == "Depth"? camera.far = 500: camera.far = 10000;
}

function set_materials_face_for( object ) {
	reset();
	var materials = [];
	var tower_clone = tower.clone();

	if( object != "board" ){
		for( face in tower_clone.faces){
			tower_clone.faces[face].materialIndex = Math.floor( face/1300 );
		}
	}

	for( var i = 0; i < 6; i++ ){
		var r = Math.floor( Math.random() * 255 );
		var g = Math.floor( Math.random() * 255 );
		var b = Math.floor( Math.random() * 255 );
		materials.push( new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB( r, g, b ).getHex()}) );
	}

	var faces_mat = new THREE.MeshFaceMaterial( materials );
	last_material = "face";

	if( object == "board" ){
		scene.remove( board_base );
		board_base = new THREE.Mesh( new THREE.CubeGeometry( piece_margin*9, piece_height, piece_margin*9 ), faces_mat);
		board_base.position.set( -piece_margin/2, -0.2, -piece_margin/2 );
		board_base.receiveShadow = true;
		scene.add( board_base );
	} else {
		scene.remove( pieces.white.types.tower[0].mesh );
		scene.remove( pieces.white.types.tower[1].mesh );
		create_pieces( "white", "tower", tower_clone, faces_mat );
	}
}

function select_piece( event ){
    event.preventDefault();
	var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1 , (event.clientY / window.innerHeight) * (-2) + 1 , 1);
	var ray = projector.pickingRay( vector, camera );
	var intersection = ray.intersectObjects( objects );
	reset_board_squares();

	if( intersection.length > 0 ){
			use_navigation_mesh( intersection[ 0 ].point.y );
			show_movement( intersection[ 0 ].object );
			moving_piece = true;
	}
}

function show_movement( piece ){
	var new_x;
	var new_y;
	var move;
	var direction;
	possible_moves = [];
	moved_piece = piece;
	possible_moves.push( {x: piece.father_chess_info.object.x, y: piece.father_chess_info.object.y } );
	for( direction in piece_movements[ piece.father_chess_info.type ] ) {
		for( movement in piece_movements[ piece.father_chess_info.type ][ direction ] ){

			move = piece_movements[ piece.father_chess_info.type ][ direction ][ movement ];
			new_x = piece.father_chess_info.object.x + move.x;
			new_y = piece.father_chess_info.object.y + move.z;

			if( new_x < 8 && new_x > -1 && new_y < 8 && new_y > -1 ){
				if( virtual_board[ new_x ][ new_y ].color == virtual_board[ piece.father_chess_info.object.x ][ piece.father_chess_info.object.y ].color ){
					break;
				}

				board[ new_x ][	new_y ].material.color = new THREE.Color( "rgb(100,255,255)" );
				possible_moves.push( {x: new_x, y: new_y } );
				
				if( virtual_board[ new_x ][ new_y ].color != "empty" ){
					break;
				}
			}
		}
	}
}

function use_navigation_mesh( y ){
	for( piece in nav_mesh ){
		nav_mesh[ piece ].position.y = piece_height;
	}
}

function analyze_movement( event ){
    event.preventDefault();
	if( moving_piece ){
		var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1 , (event.clientY / window.innerHeight) * (-2) + 1 , 1);
		var ray = projector.pickingRay( vector, camera );
		var intersection = ray.intersectObjects( nav_mesh );

		if( intersection.length > 0 ){
			for( move in possible_moves ){
				var selected_x = intersection[ 0 ].object.board_data.x;
				var possible_x = possible_moves[ move ].x;
				var selected_y = intersection[ 0 ].object.board_data.z;
				var possible_y = possible_moves[ move ].y;
				if( selected_x == possible_x && selected_y == possible_y ){
					moved_piece.position.x = intersection[ 0 ].object.position.x;
					moved_piece.position.z = intersection[ 0 ].object.position.z;
				}
			}
		}
	}
}

function reset_board_squares(){
	for( var i = 0; i < 8; i++ ){
		for( var j = 0; j < 8; j++ ){
			var color = (7*i+j)%2 == 0? "rgb(0,0,0)": "rgb(251,253,206)";
			board[ i ][ j ].material.color = new THREE.Color( color );
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SCENE SETUP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function set_pieces() {
	for( type in pieces.white.types ){
		load_pieces( type );
	};
}

function load_pieces( type ){
	loader.load( "./assets/" + type + "/" + type + ".js", function ( geometry, materials ){
		if( type == "tower" ) tower = geometry.clone();

		create_pieces( "white", type, geometry);
		create_pieces( "black", type, geometry);

		load_progress++;
		document.querySelector( ".loading-bar-loader" ).style.width = (100 * load_progress / 6).toString() + "%";
	});
}

function create_pieces( color, type, geometry, material ){
	for( unit in pieces[color].types[type] ){
		var piece = pieces[color].types[type][unit];

		piece.mesh = new THREE.Mesh( geometry, material? material : pieces[color].material );
		piece.mesh.rotation.y = pieces[color].side * 90 * Math.PI/180;
		piece.mesh.castShadow = true;
		piece.mesh.father_chess_info = {};
		piece.mesh.father_chess_info[ "object" ] = piece;
		piece.mesh.father_chess_info[ "type" ] = type;
		pos_x = board[piece.x][piece.y].position.x;
		pos_y = board[piece.x][piece.y].position.y + piece_height/2;
		pos_z = board[piece.x][piece.y].position.z;
		piece.mesh.position.set( pos_x, pos_y, pos_z );
		type == "trooper"? piece.mesh.scale.set( 6, 6, 6 ): piece.mesh.scale.set( 10, 10, 10 );
		scene.add( piece.mesh );
	}
}

function set_board(){
	for( var i = 0; i < 8; i++ ){
		board.push([]);
		for( var j = 0; j < 8; j++ ){
			var color = (7*i+j)%2 == 0? "rgb(0,0,0)": "rgb(251,253,206)";
			var board_piece = new THREE.Mesh( new THREE.CubeGeometry( piece_size, piece_height, piece_size ), new THREE.MeshPhongMaterial({ color: new THREE.Color( color ), shininess: 100 }) );
			board_piece.receiveShadow = true;
			board_piece.position.set( i*piece_margin - 4*piece_margin, 0, j*piece_margin - 4*piece_margin );
			board[i].push( board_piece );
			scene.add( board_piece );
		}
	}

	board_base.position.set( -piece_margin/2, -0.2, -piece_margin/2 );
	board_base.receiveShadow = true;
	scene.add( board_base );
}

function set_navigation_mesh(){
	for( var i = 0; i < 8; i++ ){
		for( var j = 0; j < 8; j++ ){
			var nav_mesh_piece = new THREE.Mesh( new THREE.CubeGeometry( piece_size, 0, piece_size ), new THREE.MeshBasicMaterial() );
			nav_mesh_piece.material.transparent = true; 
			nav_mesh_piece.material.opacity = 0; 
			nav_mesh_piece.position.set( i*piece_margin - 4*piece_margin, 0, j*piece_margin - 4*piece_margin );
			nav_mesh_piece.board_data = { x: i, z: j };
			nav_mesh.push( nav_mesh_piece );
			scene.add( nav_mesh_piece );
		}
	}
}

function set_renderer(){
	renderer.setSize( width, height );
	renderer.shadowMapEnabled = true;
	document.body.appendChild( renderer.domElement );
}

function set_camera(){
	camera.position.y = 160;
	camera.position.z = 400;
	scene.add( camera );
}

function set_skybox(){
	var skybox_geometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skybox_material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.BackSide });
	var skybox = new THREE.Mesh( skybox_geometry, skybox_material );
	scene.add( skybox );
}

function set_lights(){
	light.position.set( 100, 300, 200 );
	light.castShadow = true;
	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	light_2.position.set( -10, 200, -200 );

	scene.add( light );
	scene.add( light_2 );
}

function set_virtual_board(){
	for( var i = 0; i < 8; i++ ){
		virtual_board.push( [] );
		for (var j = 0; j < 8; j++) {
			virtual_board[ i ].push( { piece: "empty", color: "empty" } );
		}
	}

	for( color in pieces ){
		for( type in pieces[ color ].types ){
			for( unit in pieces[ color ].types[ type ] ){
				var piece = pieces[ color ].types[ type ][ unit ];
				virtual_board[ piece.x ][ piece.y ] = { piece: type, color: color };
				objects.push( piece.mesh );			
			}
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ANIMATION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function render(){
	renderer.render( scene, camera );

	var delta = clock.getDelta();
	show_fps( delta );

	if( rotate ){
		angle += direction * delta/4;
		var z = Math.sin( angle ) * 300; 
		var coefficient = Math.cos( angle ) == 0? 0: Math.cos( angle ) > 0? 1: -1;
		var x = coefficient * Math.sqrt( 300*300 - z*z);
		camera.position.set( x, 160, z );
		camera.lookAt( board_base.position );
	}

	requestAnimationFrame( render );
}