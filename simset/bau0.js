
function ariContainer(dParent, id, label) {
  let styles = { wmin: 100, hmin: 150, position: 'relative', alignSelf: 'stretch', bg: 'green', fg: 'white', align: 'center' };
  let cont = mDom(dParent, styles, { id });
  if (label) {
    mDom(cont, { position: 'absolute', bottom: 0, w100: true, align: 'center' }, { html: label })
  }
  return cont;

}
function ariHideBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_down(x));
  }
}
function ariPresentPlayer(table, me, plName, dt, styles, smallsz, isHidden = false) {
  let fen = table.fen;
  let pl = table.players[plName];

  //console.log(plName, isHidden)
  let d = mDom(dt, styles, { html: get_user_pic_html(plName, 25) });
  mStyle(d, { border: `2px ${pl.color} solid`, gap: 4 })
  mFlexWrap(d);
  mDom(d, {}, { html: plName })
  mLinebreak(d, 9);
  let ui = { div: d };

  let handCards = ui.handCards = pl.hand.map(key => uiTypeCard52(key));
  if (isHidden) { handCards.map(x => face_down(x)); }
  cont = ariContainer(d, `d${capitalize(plName)}Hand`, 'hand');
  let hand = ui.hand = cSplay(handCards, cont, dir = 'right', splay = .25);

  let stallCards = ui.stallCards = pl.stall.map(key => uiTypeCard52(key));
  cont = ariContainer(d, `d${capitalize(plName)}Stall`, 'stall');
  let stall = ui.stall = cSplay(stallCards, cont, dir = 'right', splay = 1.2);
  if (fen.stage < 5 && isHidden) { stallCards.map(x => face_down(x)); }

  let peasantCards = ui.peasantCards = pl.peasants.map(key => uiTypeCard52(key, smallsz, 'green'));
  cont = ariContainer(d, `d${capitalize(plName)}Peasants`, 'peasants');
  let peasants = ui.peasants = cSplay(peasantCards, cont, dir = 'right', splay = 1.2);

  let peasantUsedCards = ui.peasantUsedCards = pl.peasantsUsed.map(key => uiTypeCard52(key, smallsz, 'green'));
  cont = ariContainer(d, `d${capitalize(plName)}PeasantUsed`, 'used');
  let peasantUsed = ui.peasantUsed = cSplay(peasantUsedCards, cont, dir = 'right', splay = 1.2);
  peasantUsedCards.map(x => face_down(x));

  if (exp_commissions(table.options)) {
    if (!isHidden) pl.commissions = cSort(pl.commissions, null, 'A23456789TJQK');
    let commisionCards = ui.commisionCards = pl.commissions.map(key => uiTypeCard52(key, smallsz, 'blue'));
    cont = ariContainer(d, `d${capitalize(plName)}Commissions`, 'commissions');
    let commissions = ui.commissions = cSplay(commisionCards, cont, dir = 'right', splay = 1.2);
    if (isHidden) { commisionCards.map(x => face_down(x)); }
    else mMagnifyOnHoverControlPopup(cont);
    // if (TESTING && isdef(DA.ttest)) {
    //   let testpl = DA.ttest.players[plName];
    //   ui_type_market(testpl.commissions, d1, { matop: -20, maleft: 12 }, `players.${plName}.test.commissions`, 'commissions', uiTypeCommissionCard)
    // }
  }

  if (exp_rumors(table.options)) {
    if (!isHidden) pl.rumors = cSort(pl.rumors, null, 'A23456789TJQK');
    let rumorCards = ui.rumorCards = pl.rumors.map(key => uiTypeCard52(key, smallsz, 'green'));
    cont = ariContainer(d, `d${capitalize(plName)}Rumors`, 'rumors');
    let rumors = ui.rumors = cSplay(rumorCards, cont, dir = 'right', splay = .25);
    if (isHidden) { rumorCards.map(x => face_down(x)); }
    else mMagnifyOnHoverControlPopup(cont);
  }

  ui.journeys = [];
  let i = 0;
  for (const j of pl.journeys) {
    let jCards = j.map(key => uiTypeCard52(key));
    let cont = ariContainer(d, `d${capitalize(plName)}Journey${i}`, 'journey');
    let jui = cSplay(jCards, cont, dir = 'right', splay = 0.2);
    i += 1;
    ui.journeys.push({ jCards, cont, jui });
  }
  mLinebreak(d, 8);
  ui.buildinglist = [];
  ui.indexOfFirstBuilding = arrChildren(d).length;
  for (const k in pl.buildings) {
    let i = 0;
    for (const b of pl.buildings[k]) {
      let type = k;
      let list = b.list;
      let bCards = list.map(key => uiTypeCard52(key));
      let hiddenCards = bCards.filter(x => x.key != b.lead && (!b.schweine || !b.schweine.includes(x.key)));
      let leadCard = bCards.find(x => x.key == b.lead);

      hiddenCards.map(x => face_down(x));
      let cont = ariContainer(d, `d${capitalize(plName)}Building${k}${i}`, k);
      let bui = cSplay(bCards, cont, dir = 'right', splay = 0.2);
      let dHarvest = null;
      if (isdef(b.h)) {
        let d = iDiv(leadCard);
        mStyle(d, { position: 'relative' });
        dHarvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .8, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
      }
      let dRumors = null, rumorItems = [];
      if (!isEmpty(b.rumors)) {
        let d = cont;
        mStyle(d, { position: 'relative' });
        dRumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 6, right: 4, z: 10000 }); //,bg:'green'});
        for (const rumor of b.rumors) {
          let dr = mDiv(dRumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
          rumorItems.push({ div: dr, key: rumor });
        }
      }
      bui.cards = bCards;
      bui.hiddenCards = hiddenCards;
      bui.dHarvest = dHarvest;
      bui.leadCard = leadCard;
      bui.dRumors = dRumors;
      bui.rumorItems = rumorItems;
      bui.type = k;
      ui.buildinglist.push(bui);
      if (b.isBlackmailed) { mStamp(cont, 'blackmail'); }
      lookupAddToList(ui, ['buildings', k], bui); //GEHT!!!!!!!!!!!!!!!!!!!!!
      i += 1;
    }
  }

  if (plName == me) {
    showHandSortingButtonsFor(table.players[me], ui);
    if (hasBuildings(pl)) {
      let d = ui.div;
      let bstyles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
      let b1 = mDom(d, bstyles, { tag: 'button', innerHTML: 'view buildings' });
      b1.onclick = () => ariRevealBuildings(ui);
    }
  }
  return ui;
}
function ariRevealBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_up(x));
  }
  TO.buildings = setTimeout(() => ariHideBuildings(ui), 5000);
}
function ariShowTitle(table) {
  let fen = table.fen;
  let list = table.turn;
  let d0 = dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { w100: true, patop: 4, wrap: 'nowrap', box: true });
  mStyle(dTitle, flexSpaceBetween());
  let d1 = mDom(d0, { paleft: 12, display: 'flex', alignItems: 'start', justifyContent: 'start' }, { id: 'dTitleLeft' });
  let d2 = mDom(d0, { paright: 10, box: true }, { id: 'dTitleRight' });
  let dPhase = mDom(d1, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
  if (['king', 'queen', 'jack'].some(x => fen.phase == x)) {
    let ph = mDom(dPhase, { wmax: 60, maright: 6 }); //, { html: `Phase: <span style="color:red;font-weight:bold">${capitalize(fen.phase)}</span>` });
    let ph1 = mDom(ph, { fz: 14, deco: 'underline' }, { html: `Phase` });
    let ph2 = mDom(ph, { fz: 18, fg: fen.phase == 'queen' ? 'black' : 'red', weight: 'bold', matop: -2 }, { html: capitalize(fen.phase) });
    let x = mDom(dPhase);
    let rank = fen.phase[0].toUpperCase();
    let card = rank + (fen.phase == 'queen' ? 'Sn' : 'Hn');
    showCardMini(x, card, 44);
  } else {
    dPhase.innerHTML = `Phase: ${fen.phase}`;
  }
  if (TESTING) {
    let dStage = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
    mDom(dStage, { weight: 'bold', fg: 'red', bg: 'yellow', fz: 24 }, { html: `${fen.stage}: ${ARI.stage[fen.stage]}` })
  }
  let dPlayers = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
  mDom(dPlayers, { fz: 14, deco: 'underline' }, { html: 'Turn:' });
  if (sameList(list, table.plorder) && list.length > 2) {
    mDom(dPlayers, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plName of list) {
      let pl = table.players[plName];
      let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
      if (nundef(src)) { src = `../assets/img/users/unknown_user.jpg`; }
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(dPlayers, { cursor: 'pointer', border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
      img.onclick = () => switchToUser(plName);
    }
  }
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(M.config.games[table.game].friendly) + ')';
  mStyle(d2, {}, { html });
}
function ariSetupRumorAssignment(me, table, testing = false) {

  let playerIds = getOtherPlayerNames(table, me);
  let cardIds = table.players[me].rumors;
  let connections = {};
  //testing = true;
  if (!testing) {
    let dParent = mBy('dInstruction');
    mClear(dParent); //mClass(dParent,'section')

    let d = mDom(dParent, { padding: 10, margin: 10,w100:true },{className:'section',}); mCenterFlex(d);
    let line1 = mDom(d, { display: 'flex', gap: 10, margin: 10, place: 'center' },);//mCenterCenterFlex(line1);
    mDom(line1, {}, { html: 'drag user images to rumor cards, then confirm' });
    //mDom(line1, {}, { tag: 'button', html: 'confirm' });
    mButton('commit', async () => ariFinalizeRumorAssignment(me, table, connections), line1, { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectbutton', 'bCommit');
    mStyle(mBy('bCommit'), { border:'gray' }, {className:'disabled',disabled:true});
    mLinebreak(d)
    let dg = mGrid(2, table.plorder.length - 1, d, { place: 'center', gap: 10, margin: 20 });

    //define cards and make them dropzones (mDropZone)
    for (const k of cardIds) {
      let cItem = uiTypeCard52(k, 150);
      let div = cItem.div;
      mAppend(dg, div);
      div.id = k;
      console.log(div.id);
    }
    for (const p of playerIds) {
      let pl = M.users[p];
      let du = mDom(dg, { margin: 10 }, { id: p });
      mAppend(du, get_user_pic(p, 50));
    }
  }

  playerIds.forEach(id => {
    let d = mBy(id);
    let parent = d.parentNode;
    d.setAttribute('data-home', parent.id || 'player-container');

    d.draggable = true;
    d.ondragstart = (ev) => {
      ev.dataTransfer.setData("playerId", id);
    };
  });

  cardIds.forEach(id => {
    let dCard = mBy(id);
    mStyle(dCard, { position: 'relative' });

    dCard.ondragover = (ev) => ev.preventDefault();

    dCard.ondrop = (ev) => {
      ev.preventDefault();
      let newPlayerId = ev.dataTransfer.getData("playerId");
      let newPlayerDiv = mBy(newPlayerId);

      // Find if there is already a player div inside this card
      let existingPlayerDiv = Array.from(dCard.children).find(child => playerIds.includes(child.id));

      if (existingPlayerDiv && existingPlayerDiv.id !== newPlayerId) {
        // Determine where the incoming player came from
        let incomingSource = newPlayerDiv.parentNode;

        // Move the existing player to the incoming player's previous position
        mAppend(incomingSource, existingPlayerDiv);

        // If the incoming player came from another card, center the swapped player there
        if (cardIds.includes(incomingSource.id)) {
          mStyle(existingPlayerDiv, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0
          });
          connections[incomingSource.id] = existingPlayerDiv.id;
        } else {
          // If it went back to a home container, reset styles
          mStyle(existingPlayerDiv, { position: 'static', transform: 'none' });
          // Remove connection entry if the card is now empty (though logic here suggests a swap)
        }
      }

      // Move the new player into this card
      mAppend(dCard, newPlayerDiv);
      mStyle(newPlayerDiv, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0
      });

      // Update the connection for this card
      connections[id] = newPlayerId;

      // Check if all cards have a connection
      if (Object.keys(connections).length === cardIds.length) {
        mStyle(mBy('bCommit'), { opacity: 1 });
        //callback(connections);
      }
    };
  });
}
function ariFinalizeRumorAssignment(me, table, connections) {
  console.log("All cards assigned:", connections);




}


