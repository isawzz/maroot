
function uiTypeStar(cards, dParent, face = 'up') {
  const n = cards.length;
  let dg = mDom(dParent, { h: 130, wmin: 120, display: 'inline-grid', placeItems: 'center', position: 'relative' });
  // let dg = mDom(dParent,{bg:'blue',position:'relative'});
  let inc = 180 / n;// n == 4 ? 45 : n == 2 ? 90 : 360 / n; 
  //console.log('inc', inc)
  let rotation = inc;
  //cSplay(cards, dg, 'right');
  for (const card of cards) {
    remove_card_shadow(card);
    const angle = rotation; //i * angleStep;
    mAppend(dg, card.div);
    mStyle(card.div, {
      position: 'absolute',
      left: 25,
      top: 20,
      transform: `rotate(${angle}deg)`, // translateY(-50px)
      transformOrigin: 'center' // Rotates around the card's center
    });
    rotation += inc;
    if (face === 'down') {
      face_down(card);
    } else {
      face_up(card);
    }
  }

  return {
    dg,
    cards,
    topCard: cards[n - 1]
  };
}



async function uiTypeDeck(cards, dParent, face = 'down', splay = 0.002, nTop = 2) {
  const n = cards.length;
  visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
  visualCount = Math.max(nTop + 1, visualCount);
  let part = cards.slice(-visualCount); //console.log('part', part.map(x => x.key));
  
	mCenterFlex(dParent);
	let dcont=mDom(dParent,{matop:10,position:'relative'});
	let o =await splayItems(part, dcont, { interactive:'none',direction: 'down-right',overlap:1-splay,animate:false }); //'down-right'
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

