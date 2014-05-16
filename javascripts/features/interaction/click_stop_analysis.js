//decides what to do, when the mouse button was released
function canvas_click_stop_analysis(){
	if( moving_piece ){
		moving_piece = false;
		handle_piece_movement_choice();
		print_board();
	} else if( moving_camera ){
		moving_camera = false;
	}
}

//registers the movement choice made and performs 'logical' movement of the piece on the virtual board, also analyzes for attack conditions
function handle_piece_movement_choice(){
	//if this was a pawn, tell it it can't perform a forward2_move anymore
	if( moved_piece.father_chess_info.first_move ){
		moved_piece.father_chess_info.first_move = false;
	}

	reset_board_squares_color();

	//is the new square the same as current? DON'T DO SHIT
	if( selected_move.x == moved_piece.father_chess_info.object.x && selected_move.z == moved_piece.father_chess_info.object.z ){
		return;
	}

	check_attack();
	update_logical_position();
}

//if there's an enemy on the new spot, destroy him in a fancy way
function check_attack(){
	if( virtual_board[ selected_move.x ][ selected_move.z ].color != "empty" ){
		spawn_particles_attack();
		play_sound_attack();
		
		//cleanup the objects array
		scene.remove( virtual_board[  selected_move.x ][ selected_move.z ].object );
		for( object in objects ){
			if( objects[ object ].father_chess_info.object.x == selected_move.x && objects[ object ].father_chess_info.object.z == selected_move.z ){
				objects.splice(object, 1);				
			}
		}
	}
}

//creates particles of dust under the active piece if it destroyed an another piece
function spawn_particles_attack(){
	var dust_particles = new THREE.Geometry;
	for (var i = 0; i < 150; i++) {
	    var particle = new THREE.Vector3(Math.random() * 32 - 16, Math.random() * 15, Math.random() * 32 - 16);
	    dust_particles.vertices.push(particle);
	}

	var dust_texture = THREE.ImageUtils.loadTexture('assets/dust.png');
	var dust_material = new THREE.ParticleBasicMaterial({ map: dust_texture, transparent: true, blending: THREE.NormalBlending, size: 20, color: 0x755a5a });

	scene.remove( dust );

	dust = new THREE.ParticleSystem(dust_particles, dust_material);
	dust.sortParticles = true;
	dust.position.x = virtual_board[ selected_move.x ][ selected_move.z ].object.position.x;
	dust.position.z = virtual_board[ selected_move.x ][ selected_move.z ].object.position.z;
	dust.position.y = -5;
	 
	scene.add(dust);
}

//changes the position of the dust particles, when they reach a certain height, they start to dissapear
function animate_attack_particles( delta ){
	var particle_count = dust.geometry.vertices.length;
	while (particle_count--) {
	    var particle = dust.geometry.vertices[particle_count];
	    if (particle.y >= 10) {
	        dust.material.opacity -= delta/100;
	    } else {
		    particle.y += Math.random() * 10 * delta;
	    }
	    particle.x += dust.position.x < particle.x? Math.random() * 2 * delta: -(Math.random() * 2 * delta);
	    particle.z += dust.position.z < particle.z? Math.random() * 2 * delta: -(Math.random() * 2 * delta);
	}
	dust.geometry.__dirtyVertices = true;
}

function play_sound_attack(){
	asset.play();
}

//reposition our selected piece
function update_logical_position(){
	//remove our selected piece from the old spot
	var color_buff = virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].color;
	var piece_buff = virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].piece;
	var object_buff = virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].object;

	virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].color = "empty";
	virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].piece = "empty";
	virtual_board[  moved_piece.father_chess_info.object.x ][ moved_piece.father_chess_info.object.z ].object = null;

	//place our piece in the new spot
	virtual_board[  selected_move.x ][ selected_move.z ].color = color_buff;
	virtual_board[  selected_move.x ][ selected_move.z ].piece = piece_buff;
	virtual_board[  selected_move.x ][ selected_move.z ].object = object_buff;

	moved_piece.father_chess_info.object.x = selected_move.x;
	moved_piece.father_chess_info.object.z = selected_move.z;

	//default the height
	moved_piece.father_chess_info.lerp_to.y = piece_height/2;
}

//recalculates colors for squares on the board
function reset_board_squares_color(){
	for( var i = 0; i < 8; i++ ){
		for( var j = 0; j < 8; j++ ){
			var color = (7*i+j)%2 == 0? "rgb(0,0,0)": "rgb(251,253,206)";
			board[ i ][ j ].material.color = new THREE.Color( color );
		}
	}
}