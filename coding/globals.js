var A = null;
var B = {};
var Menu = null;
var T = null;
var Tid = null;
var U = {};
var SLEEP_WATCHER = null; //elim!
var ColorThiefObject;
var WhichCorner = 0;
const CORNERS0 = ['♠', '♡']; //, '♣', '♢'];
const CORNERS = ['◢', '◣', '◤', '◥'];
const CORNERS2 = ['⬔', '⬕'];
const CORNERS3 = ['⮜', '⮝', '⮞', '⮟'];
const CORNERS4 = ['⭐', '⭑']; //, '⭒', '⭓'];
const CORNERS5 = ['⬛', '⬜']; //, '⭒', '⭓'];
const ANIM = {};
var Session = {};
var Clientdata = {};
const allPeeps = []
const availablePeeps = []
const crowd = []
const DEF_ORIENTATION = 'v';
const DEF_SPLIT = 0.5;
var activatedTests = [];
var AD;
var ADS;
var aiActivated;
var Animation1;
var AREAS = {};
var AU = {};
var auxOpen;
var Categories;
var ColorDi;
var ColorNames;
var currentGame = IS_TESTING ? 'gTouchPic' : 'sequence';
var currentLanguage = 'E';
var currentLevel;
var DA = {};
var DB;
var draggedElement;
var dragStartOffset;
var dropPosition = 'none';
var dynSpec;
var FUNCTIONS = {
  instanceof: 'instanceOf',
  prop: (o, v) => isdef(o[v]),
  no_prop: (o, v) => nundef(o[v]),
  no_spec: (o, v) => false,
}
var G = null;
var gameSequence = IS_TESTING ? ['gSayPicAuto', 'gTouchPic', 'gTouchColors', 'gWritePic', 'gMissingLetter', 'gSayPic'] : ['gSayPic', 'gTouchColors', 'gWritePic'];
var Goal;
var I;
var INFO = {};
var IS_TESTING = true;
var IsAnswerCorrect;
var IsControlKeyDown = false;
var Items = {};
var KeySets;
var lastPosition = 0;
var LevelChange = true;
var M = {};
var MAGNIFIER_IMAGE;
var MAXLEVEL = 10;
var nMissing;
var P;
var Pictures = [];
var Players;
var PROTO;
var R;
var S = {};
var sData;
var Selected;
var Serverdata = {};
var Settings;
var Socket = null;
var SPEC = null;
var Speech;
var symbolDict;
var Syms;
var TESTING = false;
var TO = {};
var TOFleetingMessage;
var TOList;
var TOMain;
var TOMan;
var TOTrial;
var UI = {};
var uiActivated = false;
var UID = 0;
var UIDCounter = 0;
var UIROOT;
var Username;
var Z;
var Zones = {};

var PolyClips = {
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hex: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  test1: 'inset(50% 0% 100% 25% 100% 75% 50% 100% 0% 75% 0% 25% round 10px)',
  test0: 'inset(45% 0% 33% 10% round 10px)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  hexF: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexFlat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexflat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  rect: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  sq: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  tri: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triUp: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triup: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triDown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  tridown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  triright: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  triRight: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  trileft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  triLeft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  splayup: 'polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)',
}
const BLUE = '#4363d8';
const BROWN = '#96613d';
const FIREBRICK = '#800000';
const GREEN = '#3cb44b';
const BLUEGREEN = '#004054';
const LIGHTBLUE = '#42d4f4';
const LIGHTGREEN = '#afff45';
const OLIVE = '#808000';
const ORANGE = '#f58231';
const NEONORANGE = '#ff6700';
const PURPLE = '#911eb4';
const RED = '#e6194B';
const TEAL = '#469990';
const YELLOW = '#ffe119';
const NEONYELLOW = '#efff04';
const YELLOW2 = '#fff620';
const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow', 'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED, GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue',
  'deeppink', TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE,
  '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'deeppink',
  'palegreen', '#e6194B'];
const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
var SHAPEFUNCS = { 'circle': 'agCircle', 'hex': 'agHex', 'rect': 'agRect', };
const STYLE_PARAMS_2 = {
  acontent: 'align-content',
  aitems: 'align-items',
  align: 'text-align',
  aspectRatio: 'aspect-ratio',
  bgAttach: 'background-attachment',
  bgBlend: 'background-blend-mode', //'mix-blend-mode', //
  bgImage: 'background-image',
  bgRepeat: 'background-repeat',
  bgSize: 'background-size',
  deco: 'text-decoration',
  dir: 'flex-direction',
  family: 'font-family',
  fontSize: 'font-size',
  fStyle: 'font-style',
  fz: 'font-size',
  grow: 'flex-grow',
  h: 'height',
  hgap: 'column-gap',
  hmin: 'min-height',
  hmax: 'max-height',
  hline: 'line-height',
  jcontent: 'justify-content',
  jitems: 'justify-items',
  justify: 'justify-content',
  matop: 'margin-top',
  maleft: 'margin-left',
  mabottom: 'margin-bottom',
  maright: 'margin-right',
  origin: 'transform-origin',
  overx: 'overflow-x',
  overy: 'overflow-y',
  patop: 'padding-top',
  paleft: 'padding-left',
  pabottom: 'padding-bottom',
  paright: 'padding-right',
  place: 'place-items',
  rounding: 'border-radius',
  shrink: 'flex-shrink',
  valign: 'align-items',
  vgap: 'row-gap',
  w: 'width',
  wmin: 'min-width',
  wmax: 'max-width',
  weight: 'font-weight',
  x: 'left',
  xover: 'overflow-x',
  y: 'top',
  yover: 'overflow-y',
  z: 'z-index'
};
