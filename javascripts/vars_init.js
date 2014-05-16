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
var tower; //backup copy of tower for FACE material swapping


//Controls
var rotate = true; //does the camera rotate automatically?
var direction = 1; //in which direction the camera rotates? 1 - left, -1 - right
var virtual_board = []; //a 'logical' board for piece 'game' position analysis
var objects = []; //a flat array of all chess meshes
var possible_moves = []; //which moves are legible for current [moved_piece]
var nav_mesh = []; //a flat array of the board pieces
var moving_piece = false; //are we moving a chess piece right now?
var moving_camera = false; //are we manipulating the camera right now?
var moved_piece; //which piece was just active or is active now?
var selected_move; //which move did we chose for the [moved_piece]?
var projector = new THREE.Projector(); //a projection object used to cast rays, we use it for mouse picking
var previous_camera = { x: 0, y: 0}; //where the mouse has just been, to determine mouse delta
var angle_x = 0; //angle of rotation for the manual camera
var angle_y = 0; //angle of rotation for the manual camera
var last_material = "nothing"; //what kind of material was just selected? used to check for face material
var asset = document.createElement("audio"); //audio used for attack sound
	asset.src = "assets/attack_hit.mp3";
var dust; //used in the attack animation


//Rendering
var clock = new THREE.Clock;
var angle = 0; //automated camera angle
var loading_bar;
var load_progress = 0;
var DOM_loaded = false;


