
function onclickDeckTopCard() {
  if (myDeckArray.length === 0) return;

  // Get the card data without removing it yet
  let drawnCard = myDeckArray[myDeckArray.length - 1];

  // Disable interaction immediately
  drawnCard.div.onclick = null;

  animateCardToHand(drawnCard, 'dDeck', 'dHand', () => {
    // This runs AFTER the animation finishes
    
    // 1. Update Data
    myDeckArray.pop(); 
    myHand.push(drawnCard); // Changed to push so it adds to the end

    // 2. Re-render Deck
    let newTop = drawDeck(myDeckArray, 'dDeck');
    if (newTop) {
      newTop.div.onclick = handleDeckClick;
      mClass(newTop.div, 'selectable');
    }

    // 3. Re-render Hand
    mClear('dHand');
    // Ensure container is ready for grid
    let h = document.getElementById('dHand');
    h.style.display = 'grid';
    
    cSplay(myHand, 'dHand', 'right');
  });
}


