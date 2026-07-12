
function ariMakePlayerHandSelectable(me, table, ui){

	let item = ui.players[me];
	console.log(item);
	for(const c of item.handCards){
		makeSelectable(c);
		iDiv(c).onclick = ()=>toggleSelectionState(c);
	}


}

function makeSelectable(o){
	let d=iDiv(o);
	//mStyle(d,{cursor:'pointer'});
	mClass(d,'hoverScale');
}
function toggleSelectionState(card){
	mStyle(iDiv(card),{border:'red'});
	//iDiv(card).classList.toggle('framedPicture');
	//findParentWithClass(ev.target,'card').classList.toggle('selected');
	//ev.target.classList.toggle('framedPicture');
}