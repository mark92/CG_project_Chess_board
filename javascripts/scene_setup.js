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
		piece.mesh.father_chess_info[ "first_move" ] = true;
		pos_x = board[piece.x][piece.z].position.x;
		pos_y = board[piece.x][piece.z].position.y + piece_height/2;
		pos_z = board[piece.x][piece.z].position.z;
		piece.mesh.father_chess_info.lerp_to = { x: pos_x, z: pos_z, y:pos_y };
		piece.mesh.father_chess_info.lerp_fast_to = { x: pos_x, z: pos_z, y:pos_y };
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
			board_piece.board_data = { x: i, z: j };
			nav_mesh.push( board_piece );
			scene.add( board_piece );
		}
	}

	board_base.position.set( -piece_margin/2, -0.2, -piece_margin/2 );
	board_base.receiveShadow = true;
	scene.add( board_base );
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

//creates a 'logical' board to holds the 'game' data for move analysis
function set_virtual_board(){
	for( var i = 0; i < 8; i++ ){
		virtual_board.push( [] );
		for (var j = 0; j < 8; j++) {
			virtual_board[ i ].push( { piece: "empty", color: "empty", object: null } );
		}
	}

	for( color in pieces ){
		for( type in pieces[ color ].types ){
			for( unit in pieces[ color ].types[ type ] ){
				var piece = pieces[ color ].types[ type ][ unit ];
				virtual_board[ piece.x ][ piece.z ] = { piece: type, color: color, object: piece.mesh };
				objects.push( piece.mesh );			
			}
		}
	}
}