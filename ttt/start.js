// start.js - Hearts game entry point

VERBOSE = false;
TESTING = true;
DEV = false;

onload = async function start() {
  await loadAssetsStaticPreload();
  await loadAssetsStatic();
  create_card_assets_c52();
  heartsUIInit();
};
