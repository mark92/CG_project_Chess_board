var pieces = {
	white: {
		types: {
			tower: {
				0: { x: 0, z: 0},
				1: { x: 0, z: 7}
			},
			horse: {
				0: { x: 0, z: 1},
				1: { x: 0, z: 6}
			},
			elephant: {
				0: { x: 0, z: 2},
				1: { x: 0, z: 5}
			},
			queen: {
				0: { x: 0, z: 3}
			},
			king: {
				0: { x: 0, z: 4}
			},
			trooper: {
				0: { x: 1, z: 0},
				1: { x: 1, z: 1},
				2: { x: 1, z: 2},
				3: { x: 1, z: 3},
				4: { x: 1, z: 4},
				5: { x: 1, z: 5},
				6: { x: 1, z: 6},
				7: { x: 1, z: 7}
			}
		},
		material: white_piece_material,
		side: 1
	},

	black: {
		types: {
			tower: {
				0: { x: 7, z: 0},
				1: { x: 7, z: 7}
			},
			horse: {
				0: { x: 7, z: 1},
				1: { x: 7, z: 6}
			},
			elephant: {
				0: { x: 7, z: 2},
				1: { x: 7, z: 5}
			},
			queen: {
				0: { x: 7, z: 3}
			},
			king: {
				0: { x: 7, z: 4}
			},
			trooper: {
				0: { x: 6, z: 0},
				1: { x: 6, z: 1},
				2: { x: 6, z: 2},
				3: { x: 6, z: 3},
				4: { x: 6, z: 4},
				5: { x: 6, z: 5},
				6: { x: 6, z: 6},
				7: { x: 6, z: 7}
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