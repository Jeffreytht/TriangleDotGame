'use strict';

const nRow 			  = 5;
const stateEnum 	  = Object.freeze({"empty": 1, "selected":2, "ValidMove":3});
const states 		  = new Array(nRow * (nRow + 1) / 2).fill(stateEnum.empty); 
const dr			  = [-1, -1,  0, 0, 1, 1];
const dc 			  = [-1,  0, -1, 1, 0, 1];
const totalMove 	  = 3;
const playerColor     = ["green", "cyan"];
let selectedDot       = [];
let playerId          = 1;


var id2DotIdx      = (id) => parseInt(id.replace('dot', ''));
var triangleNumber = (i)  => i * (i + 1) / 2;
var currColor      = (_)  => playerColor[playerId % 2];

function hoverIn(){
	let dotIdx = id2DotIdx($(this).attr('id'));
	let state = states[dotIdx];

	if(selectedDot.length != 0){
		if(state == stateEnum.selected) return;
		if(state === stateEnum.ValidMove)
			$(this).css("background-color",currColor());
		else 
			$(this).css("background-color", "red");
	}
	else{
		if(state === stateEnum.empty){
			$(this).css("background-color",currColor());
		}
	}

}

function hoverOut(){
	let dotIdx = id2DotIdx($(this).attr('id'));
	if(states[dotIdx] === stateEnum.empty || states[dotIdx] === stateEnum.ValidMove){
		$(this).css("background-color","white");
	}
}

function dotClick(){
	let dotIdx = id2DotIdx($(this).attr('id'));

	if(states[dotIdx] === stateEnum.selected 
		|| selectedDot.length === totalMove
		|| (selectedDot.length != 0 && states[dotIdx] == stateEnum.empty)) 
		return;

	states[dotIdx] = stateEnum.selected;
	selectedDot.push(dotIdx);
	$(this).css('background-color', currColor());

	if(selectedDot.length == 1)
		generateValidMove(dotIdx).forEach(validId => states[validId] = stateEnum.ValidMove);
	else
		filterValidMove(selectedDot);

	
}

function idToRC(id){
	let row = 1;
	while(triangleNumber(row) <= id) row++;
	return {"row": row - 1, "col" :id - triangleNumber(row - 1)};
}

function RCtoId(r, c){
	if(c < 0 || c > r || r >= nRow) return -1;
	return triangleNumber(r) + c;
}


function generateValidMove(idx){
	let res = [];
	let rc = idToRC(idx);
	
	for(let d = 0 ; d < dr.length; ++d){
		for(let move = 1 ; move < totalMove; ++move){
			let dotId = RCtoId(rc.row + dr[d] * move, rc.col + dc[d] * move);
			if(dotId === -1) break;

			if(states[dotId] == stateEnum.empty)
				res.push(dotId);
			else
				break;
		}
	}
	return res;
}

function colorDot(id, color){
	$('#dot' + id).css("background-color", color);
}

function filterValidMove(){
	clearValidMove();
	if(selectedDot.length === totalMove) { 
		playerNext();
		return;
	}

	let rcOri = idToRC(selectedDot[0]), rcCurr = idToRC(selectedDot[1]);
	let dr = rcCurr.row - rcOri.row;
	let dc = rcCurr.col - rcOri.col;
	
	if(Math.abs(dr) >= 2 || Math.abs(dc) >= 2){ 
		//Auto pick
		let nextId = RCtoId(rcCurr.row - dr/2,rcCurr.col - dc/2);
		states[nextId] = stateEnum.selected;
		selectedDot.push(nextId);
		colorDot(nextId, currColor());
		playerNext();
		
	} else {
		let nextId1 = RCtoId(rcCurr.row + dr,rcCurr.col + dc);
		let nextId2 = RCtoId(rcOri.row - dr, rcOri.col - dc);
		let idx = 0;

		if(nextId1 != -1 && states[nextId1] === stateEnum.empty)
			states[nextId1] = stateEnum.ValidMove;
		if(nextId2 != -1 && states[nextId2] === stateEnum.empty)
			states[nextId2] = stateEnum.ValidMove;
	}
}


function clearValidMove(){
	states.forEach((state, idx) => {
		if(state === stateEnum.ValidMove)
			states[idx] = stateEnum.empty;
	});
}

function finishMove(){
	clearValidMove();
	selectedDot = [];
	playerId ++;
}

function playerNext(){
	finishMove();
	aiPlay();
}

function btnNextClick(){
	if(selectedDot.length == 0)
		aiPlay();
	else {
		finishMove();
		aiPlay();
	}
}

function aiPlay(){
	let currState = 0 
	states.slice().reverse().forEach((state)=>{
		currState <<= 1;
		currState += (state === stateEnum.selected);		
	});

	let currMove = winningMove[currState];	
	let idx = 0;

	while(currMove != 0){
		if((currState & 1) != (currMove & 1)){
			states[idx] = stateEnum.selected;
			colorDot(idx, currColor());
		} // last bit
		idx++;
		currMove >>=1;
		currState >>= 1;
	}

	finishMove();
}


$(document).ready(function(){
	let idx = 0;
	for(let i = 0; i < nRow; ++i){
		let row = $('<div></div>').addClass('row');
		for(let j = 0; j <= i; ++j)
			row.append($('<div></div').addClass('dot').attr('id', 'dot' + idx++).hover(hoverIn, hoverOut).click(dotClick));
		$('#game').append(row);
	}

	$('#btnNext').click(btnNextClick);
});