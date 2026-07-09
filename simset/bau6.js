
async function uiTypeDeck(cards, dParent, face = 'down', splay = 0.002, nTop = 2) {
  const n = cards.length;
  visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
  visualCount = Math.max(nTop + 1, visualCount);
  let part = cards.slice(-visualCount); //console.log('part', part.map(x => x.key));
  
	mCenterFlex(dParent);
	let dcont=mDom(dParent,{matop:10,position:'relative'});
	let o =await splayItems(part, dcont, { direction: 'down-right',overlap:1-splay,animate:false }); //'down-right'
	let dg = o.container;
  //let dg = cSplayDiagonal(part, dParent, splay); 
	
	console.log('dg', dg,dcont);
  
	let topCard = cards[n - 1];
  if (face == 'down') part.map(x => face_down(x));
  let bottomCard = part[0];
  if (n > 0) addBadge(dg, n)
  return {
    topCard,
    bottomCard,
    dg,
  }
}

