//Handles the shader button controls: [ highliting on hover ] and [ selecting a shader setting on click ]
function set_controls_shaders(){
	var buttons = document.querySelectorAll('.controls div');
	for( button in buttons ){

		//HOVER handling
		buttons[button].onmouseover = function(){
	        this.className = this.className + " selected";
	    };

	    buttons[button].onmouseout = function(){
		        this.className = this.className.split( "selected", 1 );
	    };

	    //SELECTION handling
	    buttons[button].onclick = function(){
	    	if(!DOM_loaded)
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

			//Changes the style to indicate that the shader is now active
	        this.className = this.className + " active";
	    }
	};
}

//Handles the automated camera movement controls
function set_controls_play_menu(){

	//update's the canvas and camera aspect ratio on window resize
	window.addEventListener('resize', function() {
		width = window.innerWidth,
		height = window.innerHeight;
		renderer.setSize( width, height );
		camera.aspect = width/height;
		camera.updateProjectionMatrix();
	});
	
	//checks for A S D key presses, A - left, S - stop, D - right for camera movement
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

	//also handles clicking on camera movement buttons widget
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
}

//Handles the mouse events fired on canvas for: piece movement, camera control
function set_controls_piece_and_camera_movement(){
	document.querySelector( "canvas" ).addEventListener( "mousedown", function( event ) { canvas_click_analysis( event ); } );
	document.querySelector( "canvas" ).addEventListener( "mousemove", function( event ) { canvas_drag_analysis( event ); } );
	document.querySelector( "body" ).addEventListener( "mouseup"	, function( event ) { canvas_click_stop_analysis(); } );
}

//Displays the FRAMES PER SECOND in a little widget
function show_fps( delta ){
	var fps = Math.floor( 1/delta );
	if( Math.abs( fps - document.querySelector( ".fps" ).innerHTML ) > 6 )
		document.querySelector( ".fps" ).innerHTML = fps;
}

//Displays a big black screen with a loading bar until all models finish loading, after that initialises the [virtual_board] and starts the animation function render()
function show_loading(){
	loading_bar = setInterval(function(){
		if( load_progress == 6 ){
			clearInterval(loading_bar);
			document.querySelector( ".loading-bar" ).style.display = "none";
			set_virtual_board();
			render();
		}
	}, 100);
}