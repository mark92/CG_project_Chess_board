//Checks if the mouse cursor is targeting a chess piece in the point clicked, if so shows available moves for that piece, else asume to move the camera
function canvas_click_analysis( event ){
    event.preventDefault();

    //transform the point on 2D screen into a ray thats shoots into 3D space
	var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1 , (event.clientY / window.innerHeight) * (-2) + 1 , 1);
	var ray = projector.pickingRay( vector, camera );
	var intersection = ray.intersectObjects( objects );

	//if we have an intersection - we got a chess piece, else we assume the camera is being moved
	if( intersection.length > 0 ){
		show_movement( intersection[ 0 ].object );
		moving_piece = true;
	} else {
		moving_camera = true;
		rotate = false;
	}
}

//calculates the available moves for a piece and displays them by changing the colors of board squares
function show_movement( piece ){
	var new_x;
	var new_z;
	var move;
	var direction; //define [direction] locally not to conflict with camera direction
	possible_moves = [];
	moved_piece = piece; //update which piece is being manipulated

	selected_move = { x: piece.father_chess_info.object.x, z: piece.father_chess_info.object.z }; //in case no move is chosen, sets the chosen move as current position
	possible_moves.push( {x: piece.father_chess_info.object.x, z: piece.father_chess_info.object.z } );
	console.log( piece.father_chess_info.type);
	
	for( direction in piece_movements[ piece.father_chess_info.type ] ) {
		for( movement in piece_movements[ piece.father_chess_info.type ][ direction ] ){

			move = piece_movements[ piece.father_chess_info.type ][ direction ][ movement ];
			new_x = piece.father_chess_info.object.x + move.x;
			new_z = piece.father_chess_info.object.z + move.z;

			//if there are obstructions when finding a new spot, this direction is skipped
			if( !calculate_possible_move( move, new_x, new_z, piece, possible_moves ) ){
				break;
			}
		}
	}
}

//FUNCTION SHOW_MOVEMENT() HELPER, if there are no obstructions for the selected chess piece, adds the new spot to possible moves, else returns [false]
//checks for conflicts in such a way, that if a friendly piece is on the square, the direction is skipped prematurely, if an enemy, the square is added and then
//the direction is skipped
function calculate_possible_move( move, new_x, new_z, piece, possible_moves ){
	if( fits_on_board( new_x, new_z ) ){

		if( movement_conflict( move, new_x, new_z, piece ) ){
			return false;
		}
		
		board[ new_x ][	new_z ].material.color = new THREE.Color( "rgb(100,255,255)" );
		possible_moves.push( {x: new_x, z: new_z } );
		
		if( enemy_is_on_square( new_x, new_z ) ){
			return false;
		}
	}
	return true;
}

//FUNCTION SHOW_MOVEMENT()>CALCULATE_POSSIBLE_MOVE() HELPER, checks if the new movement will go off board 
function fits_on_board( new_x, new_z ){
	return new_x < 8 && new_x > -1 && new_z < 8 && new_z > -1;
}

//FUNCTION SHOW_MOVEMENT()>CALCULATE_POSSIBLE_MOVE() HELPER, checks if the new movement square has an enemy on it 
function enemy_is_on_square( new_x, new_z ){
	return virtual_board[ new_x ][ new_z ].color != "empty";
}

//FUNCTION SHOW_MOVEMENT()>CALCULATE_POSSIBLE_MOVE() HELPER, check piece specific rules, and if there's a friendly piece on the new square
function movement_conflict( move, new_x, new_z, piece ){

	//pawn(trooper) rules

	//is the move for the pawn of this color?
	if( move.color ){
		if( move.color != virtual_board[ piece.father_chess_info.object.x ][ piece.father_chess_info.object.z ].color ){
			return true;
		}
		//is this move a forward1 or a forward2?
		if( !move.special || move.special == "first_move"){
			//if so, is there anyone on the new square?
			if( virtual_board[ new_x ][ new_z ].color != "empty" ){
				return true;
			}
		}
		//is this a first_move or an attack_move?
		if( move.special ){
			if( move.special == "first_move" ){
				//if so, can the pawn take a first move?
				if( !piece.father_chess_info.first_move ){
					return true;
				}
			} else if( move.special == "attack"){
				//if so, is there an enemy on the new square?
				if( virtual_board[ new_x ][ new_z ].color == "empty" || virtual_board[ new_x ][ new_z ].color == virtual_board[ piece.father_chess_info.object.x ][ piece.father_chess_info.object.z ].color ){
					return true;
				}
			}
		}
	}
	

	//general rules

	//is there a friendly piece on the next square ?
	if( virtual_board[ new_x ][ new_z ].color == virtual_board[ piece.father_chess_info.object.x ][ piece.father_chess_info.object.z ].color ){
		return true;
	}

	return false;
}