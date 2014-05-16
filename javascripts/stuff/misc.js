function print_board(){
var pieces = { "horse": "H", "trooper": "t", "tower": "T", "queen": "Q", "king":"K","elephant":"E","empty":"."};
var printer = "";
	for( var i = 0; i< 8; i++){
		for( var j = 7; j > -1; j--){
			printer = pieces[virtual_board[i][j].piece]+ " " + printer;
		}
		printer = "\n" + printer;
	}
	console.log(printer);
}

