//Resets the materials for all objects before setting new shaders
function reset(){

	//if the last material was a [FaceMaterial] recreates the tower objects and the board base
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

//Changes the material of all objects to requested [material]. If the call comes from function reset() - doesn't call the reset again to avoid recursion
function set_materials( material, do_reset ) {
	if( do_reset )
		reset();

	var white_pieces_temp = new THREE["Mesh" + material + "Material"]({ color: white_piece_color });
	var black_pieces_temp = new THREE["Mesh" + material + "Material"]({ color: black_piece_color });
	var board_material = new THREE["Mesh" + material + "Material"]({ color: board_color });

	//redo the board squares
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

	//if the material is [DepthMaterial] changes camera.far to a much closer one;
	material == "Depth"? camera.far = 500: camera.far = 10000;
}

//equivalent to the function set_materials(), the difference is that it works with faces of a mesh instead of the whole mesh
function set_materials_face_for( object ) {
	reset();
	var materials = [];
	var tower_clone = tower.clone();

	//face #1 button
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

	//face #2 button
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