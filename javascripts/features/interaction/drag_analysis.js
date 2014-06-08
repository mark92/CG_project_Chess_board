//Reacts to the mouse movement when a mouse button is held down, if a piece is held - moves the piece, if there was no target - moves the camera
function canvas_drag_analysis( event ){
    event.preventDefault();

	if( moving_piece ){
		move_active_piece( event );
	} else if( moving_camera ){
		move_camera( event );
	}

	//remember previous position to determine the mouse movement vector
	previous_camera.x = event.clientX;
	previous_camera.y = event.clientY;
}

//calculates piece 3D movement with snapping to board squares
function move_active_piece( event ){
	var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1 , (event.clientY / window.innerHeight) * (-2) + 1 , 1);
	var ray = projector.pickingRay( vector, camera );
	var intersection = ray.intersectObjects( nav_mesh );

	//do we target a board square?
	if( intersection.length > 0 ){

		calculate_snapping( intersection );

		//set the not snapped position for free movement( in only snapping was enabled, the piece would move strictly from square to square )
		moved_piece.father_chess_info.lerp_fast_to.x = intersection[ 0 ].point.x;
		moved_piece.father_chess_info.lerp_fast_to.z = intersection[ 0 ].point.z;
	}
}

//find the closest square to snap to
function calculate_snapping( intersection ){
	var shortest = 65535; //shortest distance to a new square
	for( move in possible_moves ){
		var possible_x = possible_moves[ move ].x;
		var possible_z = possible_moves[ move ].z;

		var x_dist = board[ possible_x ][ possible_z ].position.x - intersection[ 0 ].point.x;
		var z_dist = board[ possible_x ][ possible_z ].position.z - intersection[ 0 ].point.z;

		var distance = Math.sqrt( x_dist*x_dist + z_dist*z_dist);
		var candidate_x;
		var candidate_z;

		if( distance < shortest ){
			shortest = distance;
			candidate_x = possible_x;
			candidate_z = possible_z;
		}

		snap_to( candidate_x, candidate_z );
	}
}

//set lerp positions for the requested square
function snap_to( x, z ){
	moved_piece.father_chess_info.lerp_to.x = board[ x ][ z ].position.x;
	moved_piece.father_chess_info.lerp_to.z = board[ x ][ z ].position.z;

	//in case the square is occupied by an enemy piece - raise our chess piece in the 3D space, otherwise return to default height
	if( virtual_board[ x ][ z ].color != "empty" && !(x == moved_piece.father_chess_info.object.x && z == moved_piece.father_chess_info.object.z) ){
		virtual_board[ x ][ z ].object.geometry.computeBoundingBox();
		moved_piece.father_chess_info.lerp_to.y = virtual_board[ x ][ z ].object.geometry.boundingBox.max.y*10;
	} else {
		moved_piece.father_chess_info.lerp_to.y = piece_height/2;
	}

	//if the mouse button is released now, this will be registered as the new square in the 'game' logic
	selected_move = { x: x, z: z };
}

//moves the camera depending on mouse delta, by using the parametrical sphere equation
function move_camera( event ){
	var delta_x = event.clientX - previous_camera.x;
	var delta_y = event.clientY - previous_camera.y;

	direction = 1;
	angle_x += direction * delta_x/200;
	direction = -1;
	angle_y += direction * delta_y/200;

	//restrict Y axis movement beyond 0 < y < 180 degrees
	angle_y = angle_y < 0.1 ? 0.1: angle_y;
	angle_y = angle_y > Math.PI-0.1 ? Math.PI-0.1: angle_y;

	var x = 300 * Math.cos( angle_x ) * Math.sin( angle_y );
	var z = 300 * Math.sin( angle_x ) * Math.sin( angle_y );
	var y = 300 * Math.cos( angle_y );

	camera.position.set( x, y, z );
	camera.lookAt( board_base.position );
}