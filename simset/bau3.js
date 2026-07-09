
function ari_present(me, table) {
  let fen = table.fen;
  let stage = table.fen.stage;
  PrevItems = Items;
  Items = {};
  let dTable = Items.dTable = stdPresentBGATableCols(me, table, 2000);
  ariShowTitle(table);
  DA.stats = ariStats(me, table);
  historyShow(table, 'dStats');
  let dt = Items.dt = mDom('dTable', { pabottom: 20, h100: true, box: true, w100: true, bg: colorLight('#EDC690', 50) });
  let dOpenTable = Items.dOpenTable = mDom(dt, { gap: 4 }, { id: 'dOpenTable' }); mFlexWrap(dOpenTable);

  let deckCards = Items.deckCards = fen.deck.map(key => uiTypeCard52(key));
  let cont = ariContainer(dOpenTable, 'dDeck', 'deck'); 
  let deck = Items.deck = uiTypeDeck(deckCards, cont);

  if (exp_church(table.options)) {
    //fen.church = ['KS', '2C', '3C', '4H', 'QS', 'KC', 'AC', '2H', '3H', '4S'].slice(0,2);
    let churchCards = Items.churchCards = fen.church.map(key => uiTypeCard52(key));
    let cont = ariContainer(dOpenTable, 'dChurch', 'church');
    let church = Items.church = uiTypeStar(churchCards, cont);
  }

  let marketCards = Items.marketCards = fen.market.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dMarket', 'market');
  let market = Items.market = cSplay(marketCards, cont, dir = 'right', splay = 1.1);
  INTERRUPT()

  let openDiscardCards = Items.openDiscardCards = fen.openDiscard.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dOpenDiscard', 'buy');
  let openDiscard = Items.openDiscard = cSplay(openDiscardCards, cont, dir = 'right', splay = 1.1);

  let deckDiscardCards = Items.deckDiscardCards = fen.deckDiscard.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dDeckDiscard', 'discard');
  let deckDiscard = Items.deckDiscard = uiTypeDeck(deckDiscardCards, cont);

  let smallsz = 60;
  if (exp_commissions(table.options)) {
    let openCommissionCards = Items.openCommissionCards = fen.openCommissions.map(key => uiTypeCard52(key, smallsz, 'blue'));
    cont = ariContainer(dOpenTable, 'dOpenCommissions', 'commissions');
    mMagnifyOnHoverControlPopup(cont);
    let openCommissions = Items.openCommissions = cSplay(openCommissionCards, cont, dir = 'right', splay = 1.1);

    let deckCommissionCards = Items.deckCommissionCards = fen.deckCommission.map(key => uiTypeCard52(key, smallsz));
    cont = ariContainer(dOpenTable, 'dDeckCommission', 'commission');
    let deckCommission = Items.deckCommission = uiTypeDeck(deckCommissionCards, cont);
  }
  if (exp_peasants(table.options) || exp_rumors(table.options)) {
    let deckRumorsCards = Items.deckRumorsCards = fen.deckRumors.map(key => uiTypeCard52(key, smallsz, 'green'));
    cont = ariContainer(dOpenTable, 'dDeckRumors', 'peasants');
    let deckRumors = Items.deckRumors = uiTypeDeck(deckRumorsCards, cont);
  }
  if (exp_journeys(table.options)) {
    let deckLuxuryCards = Items.deckLuxuryCards = fen.deckLuxury.map(key => uiTypeCard52(key, smallsz, 'blue'));
    cont = ariContainer(dOpenTable, 'dDeckLuxury', 'luxury');
    let deckLuxury = Items.deckLuxury = uiTypeDeck(deckLuxuryCards, cont);
  }
  Items.players = {};
  let uname_plays = table.plorder.includes(me);
  let show_first = uname_plays ? me : table.turn[0];
  let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
  let playerStyles = { bg: '#ffffff80', fg: 'black', padding: 10, margin: 4, rounding: 9 };
  for (const plName of order) {
    let hidden = plName != order[0];
    Items.players[plName] = ariPresentPlayer(table, me, plName, dt, playerStyles, smallsz, hidden && !TESTING);
    // Items.players[plName] = ariPresentPlayer(plName, table, d, smallsz, hidden && !TESTING);
  }
  //assertion(false, '* THE END *');
  // let desc = ARI.stage[stage];
  // if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
  // else if (desc == 'comm_weitergeben' && !table.turn.includes(me)) {
  // 	stdInstruction(me, table);
  // }
  return Items;
}

