'use strict';

class TriangleDotGame{
	constructor(nRow, nMove){
		this.nRow   	= nRow;
		this.nMove      = nMove;
		this.states 	= new Array(this.triangleNumber(nRow)).fill(TriangleDotGame.stateEnum.EMPTY); 
		this.selecting 	= false;
		this.playerId   = 0;
	}

	triangleNumber = (n) => n * (n + 1) / 2;

	static idToDotIdx(id) {
		return parseInt(id.replace('dot', ''));
	}

	static get stateEnum(){ 
		return Object.freeze({"EMPTY": 1, "SELECTED":2, "SELECTING":3, "VALID_MOVE":4});
	}

	get moveableR(){
		return [-1, -1, 0, 0, 1, 1];
	}

	get moveableC(){
		return [-1,  0, -1, 1, 0, 1];
	}

	static get playerColors(){ 
		return["green", "cyan"];
	}


	get currPlayerColor(){
		return TriangleDotGame.playerColors[this.playerId % 2];
	}	

	getState(dotIdx){
		return this.states[dotIdx];
	}

	selectDot(dotIdx){
		this.states[dotIdx] = TriangleDotGame.stateEnum.SELECTING;
		let validMoves 	= this.generateValidMove();
		let autoMoves 	= validMoves[0];
		let manualMoves = validMoves[1];

		autoMoves.forEach  ( idx => this.states[idx] = TriangleDotGame.stateEnum.SELECTED);
		manualMoves.forEach( idx => this.states[idx] = TriangleDotGame.stateEnum.VALID_MOVE);
		this.selecting = true;

		return autoMoves;
	}

    idToRC(id){
		let row = 1;
		while(this.triangleNumber(row) <= id) row++;
		return {"row": row - 1, "col" :id - this.triangleNumber(row - 1)};
	}

 	RCtoId(r, c){
		if(c < 0 || c > r || r >= this.nRow) return -1;
		return this.triangleNumber(r) + c;
	}

	getCurrentSelectingDots(){
		let res = [];
		this.states.forEach((state,idx)=> {
			if(state === TriangleDotGame.stateEnum.SELECTING)
				res.push(idx);
		});
		return res;
	}

	getMinRC(selectingDots){
		let r = [], c = [];

		selectingDots.forEach( dot => {
			let rc = this.idToRC(dot)
			r.push(rc.row);
			c.push(rc.col);
		});

		return {"row": Math.min(...r), "col": Math.min(...c)};
	}


	getMaxRC(selectingDots){
		let r = [], c = [];

		selectingDots.forEach( dot => {
			let rc = this.idToRC(dot)
			r.push(rc.row);
			c.push(rc.col);
		});

		return {"row": Math.max(...r), "col": Math.max(...c)};
	}

	getDistBetweenDots(minRC, maxRC){
		let dr = maxRC.row - minRC.row;
		let dc = maxRC.col - minRC.col;
		return Math.max(dr, dc, 1) - 1; // 1 is to elimintae minRC same as max Rc
	}
	

	getMoveableStep(selectingDots){
		if(this.nMove == 1) return [];
		if(selectingDots.length == 1)
			return [this.moveableR, this.moveableC];

		let rc1 = this.idToRC(selectingDots[0]);
		let rc2 = this.idToRC(selectingDots[1]);

		let dr = rc1.row - rc2.row;
		let dc = rc1.col - rc2.col;

		if(dr != 0)
			dr /= Math.abs(dr);
		if(dc != 0)
			dc /= Math.abs(dc);

		return [[-dr, dr], [-dc, dc]];
	}

	clearValidMove(){
		this.states.forEach((state,idx)=>{
			if(state === TriangleDotGame.stateEnum.VALID_MOVE)
				this.states[idx] = TriangleDotGame.stateEnum.EMPTY;
		})
	}

	finishMove(){
		this.states.forEach((state,idx)=>{
			if(state === TriangleDotGame.stateEnum.SELECTING)
				this.states[idx] = TriangleDotGame.stateEnum.SELECTED;
		})

		this.playerId ^= 1;
		this.selecting = false;
	}

	getAIMove(){
		let currState = 0 
		this.states.slice().reverse().forEach((state)=>{
			currState <<= 1;
			currState += (state === TriangleDotGame.stateEnum.SELECTED);		
		});

		let currMove = winningMove[currState];	
		let idx = 0;
		let res = [];

		while(currMove != 0){
			if((currState & 1) != (currMove & 1)){
				this.states[idx] = TriangleDotGame.stateEnum.SELECTED;
				res.push(idx);
			} 

			idx++;
			currMove  >>=1;
			currState >>= 1;
		}

		return res;	
	}

	generateValidMove(){
		this.clearValidMove();

		let selectingDots = this.getCurrentSelectingDots();
		let moveableSteps = this.getMoveableStep(selectingDots);
		let res = [[],[]];

		if(moveableSteps.length === 0) return res;

		let rc  = [this.getMinRC(selectingDots), this.getMaxRC(selectingDots)];
		let dr  = moveableSteps[0];
		let dc  = moveableSteps[1];
		let dis = this.getDistBetweenDots(rc[0], rc[1]);
		let moveLeft = this.nMove - selectingDots.length;


		if(dis > 0){
			let moveR = Math.max(...dr), moveC = Math.max(...dc);
			for(let i = 1 ; i <= dis; i++){
				let idx = this.RCtoId(rc[0].row + i * moveR, rc[0].col + i * moveC);
				if(this.states[idx] === TriangleDotGame.stateEnum.EMPTY){
					res[0].push(idx);
					moveLeft--;
				}
			}
		}

		rc.forEach((rc)=>{
			for(let d = 0 ; d < dr.length; ++d){
				for(let move = 1 ; move <= moveLeft; ++move){
					let dotId = this.RCtoId(rc.row + dr[d] * move, rc.col + dc[d] * move);
					if(dotId === -1) break;

					if(this.states[dotId] === TriangleDotGame.stateEnum.EMPTY)
						res[1].push(dotId);
					else
						break;
				}
			}
		});

		return res;
	}
}


function dotHoverIn(dot, gameObj){
	let dotIdx = TriangleDotGame.idToDotIdx(dot.attr('id'));
	let state  = gameObj.getState(dotIdx);

	if(state === TriangleDotGame.stateEnum.SELECTED || state === TriangleDotGame.stateEnum.SELECTING) return;
	dot.css("background-color", (gameObj.selecting === false ||  state === TriangleDotGame.stateEnum.VALID_MOVE) ? gameObj.currPlayerColor : "red");
}

function dotHoverOut(dot, gameObj){
	let dotIdx = TriangleDotGame.idToDotIdx(dot.attr('id'));
	let state  = gameObj.getState(dotIdx);

	if(state === TriangleDotGame.stateEnum.EMPTY || state === TriangleDotGame.stateEnum.VALID_MOVE)
		dot.css("background-color","white");
}

function dotClick(dot, gameObj){
	let dotIdx = TriangleDotGame.idToDotIdx(dot.attr('id'));
	let state  = gameObj.getState(dotIdx); 

	if(state === TriangleDotGame.stateEnum.SELECTED || state === TriangleDotGame.stateEnum.SELECTING)
		return;

	if(gameObj.selecting  && state !== TriangleDotGame.stateEnum.VALID_MOVE)
		return;

	dot.css('background-color', gameObj.currPlayerColor);
	let autoMove = gameObj.selectDot(dotIdx);
	autoMove.forEach(idx => $('#dot' + idx).css('background-color', gameObj.currPlayerColor));
}

function generateDots(gameObj){
	let idx = 0;
	for(let i = 0; i < gameObj.nRow; ++i){
		let row = $('<div></div>').addClass('row');

		for(let j = 0; j <= i; ++j, ++idx){
			let dot = $('<div></div');

			row.append(
				dot
					.addClass('dot')
					.attr('id', 'dot' + idx)
					.hover(()=> dotHoverIn(dot, gameObj), ()=>dotHoverOut(dot, gameObj))
					.click(()=> dotClick(dot, gameObj))
			);
		}

		$('#game').append(row);
	}
}	

function btnNextClick(gameObj){
	gameObj.finishMove();
	let selectingDots = gameObj.getAIMove();
	selectingDots.forEach( dot =>  $('#dot' + dot).css('background-color', gameObj.currPlayerColor));
	gameObj.finishMove();
}


let game = null;
$(document).ready(function(){
	game = new TriangleDotGame(5,3);
	generateDots(game);
	$('#btnNext').click(()=>btnNextClick(game));
});