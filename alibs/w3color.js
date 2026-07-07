/* w3color.js ver.1.18 by w3schools.com (Do not remove this line)*/
(function () {
  function w3color(color, elmnt) {
    if (!(this instanceof w3color)) { return new w3color(color, elmnt); }
    if (typeof color == "object") { return color; }
    this.attachValues(toColorObject(color));
    if (elmnt) { elmnt.style.backgroundColor = this.toRgbString(); }
  }
  w3color.prototype = {
    toRgbString: function () {
      return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
    },
    toRgbaString: function () {
      return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.opacity + ")";
    },
    toHwbString: function () {
      return "hwb(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%)";
    },
    toHwbStringDecimal: function () {
      return "hwb(" + this.hue + ", " + this.whiteness + ", " + this.blackness + ")";
    },
    toHwbaString: function () {
      return "hwba(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity + ")";
    },
    toHslString: function () {
      return "hsl(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%)";
    },
    toHslStringDecimal: function () {
      return "hsl(" + this.hue + ", " + this.sat + ", " + this.lightness + ")";
    },
    toHslaString: function () {
      return "hsla(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%, " + this.opacity + ")";
    },
    toCmykString: function () {
      return "cmyk(" + Math.round(this.cyan * 100) + "%, " + Math.round(this.magenta * 100) + "%, " + Math.round(this.yellow * 100) + "%, " + Math.round(this.black * 100) + "%)";
    },
    toCmykStringDecimal: function () {
      return "cmyk(" + this.cyan + ", " + this.magenta + ", " + this.yellow + ", " + this.black + ")";
    },
    toNcolString: function () {
      return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%";
    },
    toNcolStringDecimal: function () {
      return this.ncol + ", " + this.whiteness + ", " + this.blackness;
    },
    toNcolaString: function () {
      return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity;
    },
    toName: function () {
      var r, g, b, colorhexs = getColorArr('hexs');
      for (i = 0; i < colorhexs.length; i++) {
        r = parseInt(colorhexs[i].substr(0, 2), 16);
        g = parseInt(colorhexs[i].substr(2, 2), 16);
        b = parseInt(colorhexs[i].substr(4, 2), 16);
        if (this.red == r && this.green == g && this.blue == b) {
          return getColorArr('names')[i];
        }
      }
      return "";
    },
    toHexString: function () {
      var r = toHex(this.red);
      var g = toHex(this.green);
      var b = toHex(this.blue);
      return "#" + r + g + b;
    },
    toRgb: function () {
      return { r: this.red, g: this.green, b: this.blue, a: this.opacity };
    },
    toHsl: function () {
      return { h: this.hue, s: this.sat, l: this.lightness, a: this.opacity };
    },
    toHwb: function () {
      return { h: this.hue, w: this.whiteness, b: this.blackness, a: this.opacity };
    },
    toCmyk: function () {
      return { c: this.cyan, m: this.magenta, y: this.yellow, k: this.black, a: this.opacity };
    },
    toNcol: function () {
      return { ncol: this.ncol, w: this.whiteness, b: this.blackness, a: this.opacity };
    },
    isDark: function (n) {
      var m = (n || 128);
      return (((this.red * 299 + this.green * 587 + this.blue * 114) / 1000) < m);
    },
    saturate: function (n) {
      var x, rgb, color;
      x = (n / 100 || 0.1);
      this.sat += x;
      if (this.sat > 1) { this.sat = 1; }
      rgb = hslToRgb(this.hue, this.sat, this.lightness);
      color = colorObject(rgb, this.opacity, this.hue, this.sat);
      this.attachValues(color);
    },
    desaturate: function (n) {
      var x, rgb, color;
      x = (n / 100 || 0.1);
      this.sat -= x;
      if (this.sat < 0) { this.sat = 0; }
      rgb = hslToRgb(this.hue, this.sat, this.lightness);
      color = colorObject(rgb, this.opacity, this.hue, this.sat);
      this.attachValues(color);
    },
    lighter: function (n) {
      var x, rgb, color;
      x = (n / 100 || 0.1);
      this.lightness += x;
      if (this.lightness > 1) { this.lightness = 1; }
      rgb = hslToRgb(this.hue, this.sat, this.lightness);
      color = colorObject(rgb, this.opacity, this.hue, this.sat);
      this.attachValues(color);
    },
    darker: function (n) {
      var x, rgb, color;
      x = (n / 100 || 0.1);
      this.lightness -= x;
      if (this.lightness < 0) { this.lightness = 0; }
      rgb = hslToRgb(this.hue, this.sat, this.lightness);
      color = colorObject(rgb, this.opacity, this.hue, this.sat);
      this.attachValues(color);
    },
    attachValues: function (color) {
      this.red = color.red;
      this.green = color.green;
      this.blue = color.blue;
      this.hue = color.hue;
      this.sat = color.sat;
      this.lightness = color.lightness;
      this.whiteness = color.whiteness;
      this.blackness = color.blackness;
      this.cyan = color.cyan;
      this.magenta = color.magenta;
      this.yellow = color.yellow;
      this.black = color.black;
      this.ncol = color.ncol;
      this.opacity = color.opacity;
      this.valid = color.valid;
    }
  };
  function toColorObject(c) {
    var x, y, typ, arr = [], arrlength, i, opacity, match, a, hue, sat, rgb, colornames = [], colorhexs = [];
    c = w3trim(c.toLowerCase());
    x = c.substr(0, 1).toUpperCase();
    y = c.substr(1);
    a = 1;
    if ((x == "R" || x == "Y" || x == "G" || x == "C" || x == "B" || x == "M" || x == "W") && !isNaN(y)) {
      if (c.length == 6 && c.indexOf(",") == -1) {
      } else {
        c = "ncol(" + c + ")";
      }
    }
    if (c.length != 3 && c.length != 6 && !isNaN(c)) { c = "ncol(" + c + ")"; }
    if (c.indexOf(",") > 0 && c.indexOf("(") == -1) { c = "ncol(" + c + ")"; }
    if (c.substr(0, 3) == "rgb" || c.substr(0, 3) == "hsl" || c.substr(0, 3) == "hwb" || c.substr(0, 4) == "ncol" || c.substr(0, 4) == "cmyk") {
      if (c.substr(0, 4) == "ncol") {
        if (c.split(",").length == 4 && c.indexOf("ncola") == -1) {
          c = c.replace("ncol", "ncola");
        }
        typ = "ncol";
        c = c.substr(4);
      } else if (c.substr(0, 4) == "cmyk") {
        typ = "cmyk";
        c = c.substr(4);
      } else {
        typ = c.substr(0, 3);
        c = c.substr(3);
      }
      arrlength = 3;
      opacity = false;
      if (c.substr(0, 1).toLowerCase() == "a") {
        arrlength = 4;
        opacity = true;
        c = c.substr(1);
      } else if (typ == "cmyk") {
        arrlength = 4;
        if (c.split(",").length == 5) {
          arrlength = 5;
          opacity = true;
        }
      }
      c = c.replace("(", "");
      c = c.replace(")", "");
      arr = c.split(",");
      if (typ == "rgb") {
        if (arr.length != arrlength) {
          return emptyObject();
        }
        for (i = 0; i < arrlength; i++) {
          if (arr[i] == "" || arr[i] == " ") { arr[i] = "0"; }
          if (arr[i].indexOf("%") > -1) {
            arr[i] = arr[i].replace("%", "");
            arr[i] = Number(arr[i] / 100);
            if (i < 3) { arr[i] = Math.round(arr[i] * 255); }
          }
          if (isNaN(arr[i])) { return emptyObject(); }
          if (parseInt(arr[i]) > 255) { arr[i] = 255; }
          if (i < 3) { arr[i] = parseInt(arr[i]); }
          if (i == 3 && Number(arr[i]) > 1) { arr[i] = 1; }
        }
        rgb = { r: arr[0], g: arr[1], b: arr[2] };
        if (opacity == true) { a = Number(arr[3]); }
      }
      if (typ == "hsl" || typ == "hwb" || typ == "ncol") {
        while (arr.length < arrlength) { arr.push("0"); }
        if (typ == "hsl" || typ == "hwb") {
          if (parseInt(arr[0]) >= 360) { arr[0] = 0; }
        }
        for (i = 1; i < arrlength; i++) {
          if (arr[i].indexOf("%") > -1) {
            arr[i] = arr[i].replace("%", "");
            arr[i] = Number(arr[i]);
            if (isNaN(arr[i])) { return emptyObject(); }
            arr[i] = arr[i] / 100;
          } else {
            arr[i] = Number(arr[i]);
          }
          if (Number(arr[i]) > 1) { arr[i] = 1; }
          if (Number(arr[i]) < 0) { arr[i] = 0; }
        }
        if (typ == "hsl") { rgb = hslToRgb(arr[0], arr[1], arr[2]); hue = Number(arr[0]); sat = Number(arr[1]); }
        if (typ == "hwb") { rgb = hwbToRgb(arr[0], arr[1], arr[2]); }
        if (typ == "ncol") { rgb = ncolToRgb(arr[0], arr[1], arr[2]); }
        if (opacity == true) { a = Number(arr[3]); }
      }
      if (typ == "cmyk") {
        while (arr.length < arrlength) { arr.push("0"); }
        for (i = 0; i < arrlength; i++) {
          if (arr[i].indexOf("%") > -1) {
            arr[i] = arr[i].replace("%", "");
            arr[i] = Number(arr[i]);
            if (isNaN(arr[i])) { return emptyObject(); }
            arr[i] = arr[i] / 100;
          } else {
            arr[i] = Number(arr[i]);
          }
          if (Number(arr[i]) > 1) { arr[i] = 1; }
          if (Number(arr[i]) < 0) { arr[i] = 0; }
        }
        rgb = cmykToRgb(arr[0], arr[1], arr[2], arr[3]);
        if (opacity == true) { a = Number(arr[4]); }
      }
    } else if (c.substr(0, 3) == "ncs") {
      rgb = ncsToRgb(c);
    } else {
      match = false;
      colornames = getColorArr('names');
      for (i = 0; i < colornames.length; i++) {
        if (c.toLowerCase() == colornames[i].toLowerCase()) {
          colorhexs = getColorArr('hexs');
          match = true;
          rgb = {
            r: parseInt(colorhexs[i].substr(0, 2), 16),
            g: parseInt(colorhexs[i].substr(2, 2), 16),
            b: parseInt(colorhexs[i].substr(4, 2), 16)
          };
          break;
        }
      }
      if (match == false) {
        c = c.replace("#", "");
        if (c.length == 3) { c = c.substr(0, 1) + c.substr(0, 1) + c.substr(1, 1) + c.substr(1, 1) + c.substr(2, 1) + c.substr(2, 1); }
        for (i = 0; i < c.length; i++) {
          if (!isHex(c.substr(i, 1))) { return emptyObject(); }
        }
        arr[0] = parseInt(c.substr(0, 2), 16);
        arr[1] = parseInt(c.substr(2, 2), 16);
        arr[2] = parseInt(c.substr(4, 2), 16);
        for (i = 0; i < 3; i++) {
          if (isNaN(arr[i])) { return emptyObject(); }
        }
        rgb = {
          r: arr[0],
          g: arr[1],
          b: arr[2]
        };
      }
    }
    return colorObject(rgb, a, hue, sat);
  }
  function colorObject(rgb, a, h, s) {
    var hsl, hwb, cmyk, ncol, color, hue, sat;
    if (!rgb) { return emptyObject(); }
    if (a === null) { a = 1; }
    hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hwb = rgbToHwb(rgb.r, rgb.g, rgb.b);
    cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    hue = (h || hsl.h);
    sat = (s || hsl.s);
    ncol = hueToNcol(hue);
    color = {
      red: rgb.r,
      green: rgb.g,
      blue: rgb.b,
      hue: hue,
      sat: sat,
      lightness: hsl.l,
      whiteness: hwb.w,
      blackness: hwb.b,
      cyan: cmyk.c,
      magenta: cmyk.m,
      yellow: cmyk.y,
      black: cmyk.k,
      ncol: ncol,
      opacity: a,
      valid: true
    };
    color = roundDecimals(color);
    return color;
  }
  function emptyObject() {
    return {
      red: 0,
      green: 0,
      blue: 0,
      hue: 0,
      sat: 0,
      lightness: 0,
      whiteness: 0,
      blackness: 0,
      cyan: 0,
      magenta: 0,
      yellow: 0,
      black: 0,
      ncol: "R",
      opacity: 1,
      valid: false
    };
  }
  function getColorArr(x) {
    if (x == "names") { return ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkSlateGrey', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSlateGrey', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen']; }
    if (x == "hexs") { return ['f0f8ff', 'faebd7', '00ffff', '7fffd4', 'f0ffff', 'f5f5dc', 'ffe4c4', '000000', 'ffebcd', '0000ff', '8a2be2', 'a52a2a', 'deb887', '5f9ea0', '7fff00', 'd2691e', 'ff7f50', '6495ed', 'fff8dc', 'dc143c', '00ffff', '00008b', '008b8b', 'b8860b', 'a9a9a9', 'a9a9a9', '006400', 'bdb76b', '8b008b', '556b2f', 'ff8c00', '9932cc', '8b0000', 'e9967a', '8fbc8f', '483d8b', '2f4f4f', '2f4f4f', '00ced1', '9400d3', 'ff1493', '00bfff', '696969', '696969', '1e90ff', 'b22222', 'fffaf0', '228b22', 'ff00ff', 'dcdcdc', 'f8f8ff', 'ffd700', 'daa520', '808080', '808080', '008000', 'adff2f', 'f0fff0', 'ff69b4', 'cd5c5c', '4b0082', 'fffff0', 'f0e68c', 'e6e6fa', 'fff0f5', '7cfc00', 'fffacd', 'add8e6', 'f08080', 'e0ffff', 'fafad2', 'd3d3d3', 'd3d3d3', '90ee90', 'ffb6c1', 'ffa07a', '20b2aa', '87cefa', '778899', '778899', 'b0c4de', 'ffffe0', '00ff00', '32cd32', 'faf0e6', 'ff00ff', '800000', '66cdaa', '0000cd', 'ba55d3', '9370db', '3cb371', '7b68ee', '00fa9a', '48d1cc', 'c71585', '191970', 'f5fffa', 'ffe4e1', 'ffe4b5', 'ffdead', '000080', 'fdf5e6', '808000', '6b8e23', 'ffa500', 'ff4500', 'da70d6', 'eee8aa', '98fb98', 'afeeee', 'db7093', 'ffefd5', 'ffdab9', 'cd853f', 'ffc0cb', 'dda0dd', 'b0e0e6', '800080', '663399', 'ff0000', 'bc8f8f', '4169e1', '8b4513', 'fa8072', 'f4a460', '2e8b57', 'fff5ee', 'a0522d', 'c0c0c0', '87ceeb', '6a5acd', '708090', '708090', 'fffafa', '00ff7f', '4682b4', 'd2b48c', '008080', 'd8bfd8', 'ff6347', '40e0d0', 'ee82ee', 'f5deb3', 'ffffff', 'f5f5f5', 'ffff00', '9acd32']; }
  }
  function roundDecimals(c) {
    c.red = Number(c.red.toFixed(0));
    c.green = Number(c.green.toFixed(0));
    c.blue = Number(c.blue.toFixed(0));
    c.hue = Number(c.hue.toFixed(0));
    c.sat = Number(c.sat.toFixed(2));
    c.lightness = Number(c.lightness.toFixed(2));
    c.whiteness = Number(c.whiteness.toFixed(2));
    c.blackness = Number(c.blackness.toFixed(2));
    c.cyan = Number(c.cyan.toFixed(2));
    c.magenta = Number(c.magenta.toFixed(2));
    c.yellow = Number(c.yellow.toFixed(2));
    c.black = Number(c.black.toFixed(2));
    c.ncol = c.ncol.substr(0, 1) + Math.round(Number(c.ncol.substr(1)));
    c.opacity = Number(c.opacity.toFixed(2));
    return c;
  }
  function hslToRgb(hue, sat, light) {
    var t1, t2, r, g, b;
    hue = hue / 60;
    if (light <= 0.5) {
      t2 = light * (sat + 1);
    } else {
      t2 = light + sat - (light * sat);
    }
    t1 = light * 2 - t2;
    r = hueToRgb(t1, t2, hue + 2) * 255;
    g = hueToRgb(t1, t2, hue) * 255;
    b = hueToRgb(t1, t2, hue - 2) * 255;
    return { r: r, g: g, b: b };
  }
  function hueToRgb(t1, t2, hue) {
    if (hue < 0) hue += 6;
    if (hue >= 6) hue -= 6;
    if (hue < 1) return (t2 - t1) * hue + t1;
    else if (hue < 3) return t2;
    else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
    else return t1;
  }
  function hwbToRgb(hue, white, black) {
    var i, rgb, rgbArr = [], tot;
    rgb = hslToRgb(hue, 1, 0.50);
    rgbArr[0] = rgb.r / 255;
    rgbArr[1] = rgb.g / 255;
    rgbArr[2] = rgb.b / 255;
    tot = white + black;
    if (tot > 1) {
      white = Number((white / tot).toFixed(2));
      black = Number((black / tot).toFixed(2));
    }
    for (i = 0; i < 3; i++) {
      rgbArr[i] *= (1 - (white) - (black));
      rgbArr[i] += (white);
      rgbArr[i] = Number(rgbArr[i] * 255);
    }
    return { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] };
  }
  function cmykToRgb(c, m, y, k) {
    var r, g, b;
    r = 255 - ((Math.min(1, c * (1 - k) + k)) * 255);
    g = 255 - ((Math.min(1, m * (1 - k) + k)) * 255);
    b = 255 - ((Math.min(1, y * (1 - k) + k)) * 255);
    return { r: r, g: g, b: b };
  }
  function ncolToRgb(ncol, white, black) {
    var letter, percent, h, w, b;
    h = ncol;
    if (isNaN(ncol.substr(0, 1))) {
      letter = ncol.substr(0, 1).toUpperCase();
      percent = ncol.substr(1);
      if (percent == "") { percent = 0; }
      percent = Number(percent);
      if (isNaN(percent)) { return false; }
      if (letter == "R") { h = 0 + (percent * 0.6); }
      if (letter == "Y") { h = 60 + (percent * 0.6); }
      if (letter == "G") { h = 120 + (percent * 0.6); }
      if (letter == "C") { h = 180 + (percent * 0.6); }
      if (letter == "B") { h = 240 + (percent * 0.6); }
      if (letter == "M") { h = 300 + (percent * 0.6); }
      if (letter == "W") {
        h = 0;
        white = 1 - (percent / 100);
        black = (percent / 100);
      }
    }
    return hwbToRgb(h, white, black);
  }
  function hueToNcol(hue) {
    while (hue >= 360) {
      hue = hue - 360;
    }
    if (hue < 60) { return "R" + (hue / 0.6); }
    if (hue < 120) { return "Y" + ((hue - 60) / 0.6); }
    if (hue < 180) { return "G" + ((hue - 120) / 0.6); }
    if (hue < 240) { return "C" + ((hue - 180) / 0.6); }
    if (hue < 300) { return "B" + ((hue - 240) / 0.6); }
    if (hue < 360) { return "M" + ((hue - 300) / 0.6); }
  }
  function ncsToRgb(ncs) {
    var black, chroma, bc, percent, black1, chroma1, red1, factor1, blue1, red1, red2, green2, blue2, max, factor2, grey, r, g, b;
    ncs = w3trim(ncs).toUpperCase();
    ncs = ncs.replace("(", "");
    ncs = ncs.replace(")", "");
    ncs = ncs.replace("NCS", "NCS ");
    ncs = ncs.replace(/  /g, " ");
    if (ncs.indexOf("NCS") == -1) { ncs = "NCS " + ncs; }
    ncs = ncs.match(/^(?:NCS|NCS\sS)\s(\d{2})(\d{2})-(N|[A-Z])(\d{2})?([A-Z])?$/);
    if (ncs === null) return false;
    black = parseInt(ncs[1], 10);
    chroma = parseInt(ncs[2], 10);
    bc = ncs[3];
    if (bc != "N" && bc != "Y" && bc != "R" && bc != "B" && bc != "G") { return false; }
    percent = parseInt(ncs[4], 10) || 0;
    if (bc !== 'N') {
      black1 = (1.05 * black - 5.25);
      chroma1 = chroma;
      if (bc === 'Y' && percent <= 60) {
        red1 = 1;
      } else if ((bc === 'Y' && percent > 60) || (bc === 'R' && percent <= 80)) {
        if (bc === 'Y') {
          factor1 = percent - 60;
        } else {
          factor1 = percent + 40;
        }
        red1 = ((Math.sqrt(14884 - Math.pow(factor1, 2))) - 22) / 100;
      } else if ((bc === 'R' && percent > 80) || (bc === 'B')) {
        red1 = 0;
      } else if (bc === 'G') {
        factor1 = (percent - 170);
        red1 = ((Math.sqrt(33800 - Math.pow(factor1, 2))) - 70) / 100;
      }
      if (bc === 'Y' && percent <= 80) {
        blue1 = 0;
      } else if ((bc === 'Y' && percent > 80) || (bc === 'R' && percent <= 60)) {
        if (bc === 'Y') {
          factor1 = (percent - 80) + 20.5;
        } else {
          factor1 = (percent + 20) + 20.5;
        }
        blue1 = (104 - (Math.sqrt(11236 - Math.pow(factor1, 2)))) / 100;
      } else if ((bc === 'R' && percent > 60) || (bc === 'B' && percent <= 80)) {
        if (bc === 'R') {
          factor1 = (percent - 60) - 60;
        } else {
          factor1 = (percent + 40) - 60;
        }
        blue1 = ((Math.sqrt(10000 - Math.pow(factor1, 2))) - 10) / 100;
      } else if ((bc === 'B' && percent > 80) || (bc === 'G' && percent <= 40)) {
        if (bc === 'B') {
          factor1 = (percent - 80) - 131;
        } else {
          factor1 = (percent + 20) - 131;
        }
        blue1 = (122 - (Math.sqrt(19881 - Math.pow(factor1, 2)))) / 100;
      } else if (bc === 'G' && percent > 40) {
        blue1 = 0;
      }
      if (bc === 'Y') {
        green1 = (85 - 17 / 20 * percent) / 100;
      } else if (bc === 'R' && percent <= 60) {
        green1 = 0;
      } else if (bc === 'R' && percent > 60) {
        factor1 = (percent - 60) + 35;
        green1 = (67.5 - (Math.sqrt(5776 - Math.pow(factor1, 2)))) / 100;
      } else if (bc === 'B' && percent <= 60) {
        factor1 = (1 * percent - 68.5);
        green1 = (6.5 + (Math.sqrt(7044.5 - Math.pow(factor1, 2)))) / 100;
      } else if ((bc === 'B' && percent > 60) || (bc === 'G' && percent <= 60)) {
        green1 = 0.9;
      } else if (bc === 'G' && percent > 60) {
        factor1 = (percent - 60);
        green1 = (90 - (1 / 8 * factor1)) / 100;
      }
      factor1 = (red1 + green1 + blue1) / 3;
      red2 = ((factor1 - red1) * (100 - chroma1) / 100) + red1;
      green2 = ((factor1 - green1) * (100 - chroma1) / 100) + green1;
      blue2 = ((factor1 - blue1) * (100 - chroma1) / 100) + blue1;
      if (red2 > green2 && red2 > blue2) {
        max = red2;
      } else if (green2 > red2 && green2 > blue2) {
        max = green2;
      } else if (blue2 > red2 && blue2 > green2) {
        max = blue2;
      } else {
        max = (red2 + green2 + blue2) / 3;
      }
      factor2 = 1 / max;
      r = parseInt((red2 * factor2 * (100 - black1) / 100) * 255, 10);
      g = parseInt((green2 * factor2 * (100 - black1) / 100) * 255, 10);
      b = parseInt((blue2 * factor2 * (100 - black1) / 100) * 255, 10);
      if (r > 255) { r = 255; }
      if (g > 255) { g = 255; }
      if (b > 255) { b = 255; }
      if (r < 0) { r = 0; }
      if (g < 0) { g = 0; }
      if (b < 0) { b = 0; }
    } else {
      grey = parseInt((1 - black / 100) * 255, 10);
      if (grey > 255) { grey = 255; }
      if (grey < 0) { grey = 0; }
      r = grey;
      g = grey;
      b = grey;
    }
    return {
      r: r,
      g: g,
      b: b
    };
  }
  function rgbToHsl(r, g, b) {
    var min, max, i, l, s, maxcolor, h, rgb = [];
    rgb[0] = r / 255;
    rgb[1] = g / 255;
    rgb[2] = b / 255;
    min = rgb[0];
    max = rgb[0];
    maxcolor = 0;
    for (i = 0; i < rgb.length - 1; i++) {
      if (rgb[i + 1] <= min) { min = rgb[i + 1]; }
      if (rgb[i + 1] >= max) { max = rgb[i + 1]; maxcolor = i + 1; }
    }
    if (maxcolor == 0) {
      h = (rgb[1] - rgb[2]) / (max - min);
    }
    if (maxcolor == 1) {
      h = 2 + (rgb[2] - rgb[0]) / (max - min);
    }
    if (maxcolor == 2) {
      h = 4 + (rgb[0] - rgb[1]) / (max - min);
    }
    if (isNaN(h)) { h = 0; }
    h = h * 60;
    if (h < 0) { h = h + 360; }
    l = (min + max) / 2;
    if (min == max) {
      s = 0;
    } else {
      if (l < 0.5) {
        s = (max - min) / (max + min);
      } else {
        s = (max - min) / (2 - max - min);
      }
    }
    s = s;
    return { h: h, s: s, l: l };
  }
  function rgbToHwb(r, g, b) {
    var h, w, bl;
    r = r / 255;
    g = g / 255;
    b = b / 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    chroma = max - min;
    if (chroma == 0) {
      h = 0;
    } else if (r == max) {
      h = (((g - b) / chroma) % 6) * 360;
    } else if (g == max) {
      h = ((((b - r) / chroma) + 2) % 6) * 360;
    } else {
      h = ((((r - g) / chroma) + 4) % 6) * 360;
    }
    w = min;
    bl = 1 - max;
    return { h: h, w: w, b: bl };
  }
  function rgbToCmyk(r, g, b) {
    var c, m, y, k;
    r = r / 255;
    g = g / 255;
    b = b / 255;
    max = Math.max(r, g, b);
    k = 1 - max;
    if (k == 1) {
      c = 0;
      m = 0;
      y = 0;
    } else {
      c = (1 - r - k) / (1 - k);
      m = (1 - g - k) / (1 - k);
      y = (1 - b - k) / (1 - k);
    }
    return { c: c, m: m, y: y, k: k };
  }
  function toHex(n) {
    var hex = n.toString(16);
    while (hex.length < 2) { hex = "0" + hex; }
    return hex;
  }
  function cl(x) {
    console.log(x);
  }
  function w3trim(x) {
    return x.replace(/^\s+|\s+$/g, '');
  }
  function isHex(x) {
    return ('0123456789ABCDEFabcdef'.indexOf(x) > -1);
  }
  window.w3color = w3color;

})();
//const w3color = window.w3color;
function w3SetColorsByAttribute() {
  var z, i, att;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    att = z[i].getAttribute("data-w3-color");
    if (att) {
      z[i].style.backgroundColor = w3color(att).toRgbString();
    }
  }
}

const dicolor = {
  black: {
    dark_gray: "#353535",
    darkgray: "#a9a9a9",
    darkgrey: "#a9a9a9",
    eerie_black: "#101820",
    gainsboro: "#dcdcdc",
    gray: "#808080",
    grey: "#808080",
    raisin_black: "#1a1423",
    very_pale_grey: "#e1ede9"
  },
  blue: {
    airforce_greyblue: "#577590",
    american_blue: "#3b3b6d",
    black: "#000000",
    blue_bell: "#a2a2d0",
    blue_lavender: "#5b5ea6",
    blue_pantone: "#0018a8",
    blue_pigment: "#333399",
    blue_ryb: "#0247fe",
    bluebonnet: "#1c1cf0",
    bright_blue: "#0033cc",
    bright_gray: "#ebecf0",
    bright_navy: "#000080",
    cadmium_blue: "#0a1195",
    catalina_blue: "#062a78",
    ceil: "#92a1cf",
    cerulean_blue: "#2a52be",
    cetacean_blue: "#001440",
    chinese_blue: "#365194",
    chrome_aluminum: "#a8a9ad",
    coarse_wool: "#181b26",
    cobalt_blue: "#4363d8",
    coconut_white: "#e9edf6",
    cool_grey: "#8c92ac",
    cosmic_cobalt: "#2e2d88",
    dark_blue: "#000099",
    dark_blue_kon: "#192236",
    dark_blue_lapis_lazuli: "#1b294b",
    dark_cornflower_blue: "#26428b",
    dark_imperial_blue: "#00147e",
    dark_navy: "#02075d",
    dark_slate_blue: "#336699",
    darkblue: "#00008b",
    deep_blue: "#000075",
    deep_koamaru: "#333366",
    denim_blue: "#2243b6",
    dimgray: "#696969",
    dimgrey: "#696969",
    duke_blue: "#00009c",
    egyptian_blue: "#1034a6",
    elderberry: "#17182b",
    electric_blue: "#3333ff",
    facebook_blue: "#39569c",
    ghostwhite: "#f8f8ff",
    gun_grey: "#2b2d42",
    han_blue: "#446ccf",
    imperial_blue: "#002395",
    independence: "#4c516d",
    indigo_dye: "#091f92",
    indigo_rainbow: "#233067",
    indigo_sky: "#3333cc",
    lavender_mist: "#e6e6fa",
    liberty: "#545aa7",
    light_periwinkle: "#c5cbe1",
    light_royal_blue: "#6699ff",
    lightgray: "#d3d3d3",
    lightgrey: "#d3d3d3",
    manatee: "#979aaa",
    maximum_blue_purple: "#acace6",
    medium_blue: "#0000cc",
    mediumblue: "#0000cd",
    midnightblue: "#191970",
    navy: "#000066",
    navy_blue_bellflower: "#191f45",
    new_car: "#214fc6",
    palatinate_blue: "#273be2",
    periwinkle: "#779ecb",
    periwinkle_crayola: "#c3cde6",
    persian_blue: "#1c39bb",
    phthalo_blue: "#000f89",
    primary_blue: "#0000ff",
    prussian_blue: "#1b263b",
    purple_navy: "#4e5180",
    resolution_blue: "#002387",
    roman_silver: "#838996",
    royal_blue: "#3366cc",
    royal_blue_light: "#4169e1",
    saint_patricks_blue: "#23297a",
    samsung_blue: "#12279e",
    silver: "#c0c0c0",
    space_cadet: "#1d2951",
    summer_sky: "#3366ff",
    ua_blue: "#0033aa",
    ultramarine_blue: "#4166f5",
    very_light_blue: "#6666ff",
    violet_blue: "#324ab2",
    vodka: "#bfc0ee",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    wild_blue: "#a2add0",
    winter_blue: "#26547c",
    zaffre: "#0014a8"
  },
  bluemagenta: {
    american_violet: "#551b8c",
    amethyst: "#9966cc",
    aubergine: "#462255",
    blue_magenta_violet: "#553592",
    blue_purple: "#6b5b95",
    blue_violet_color_wheel: "#4d1a7f",
    blue_violet_crayola: "#7366bd",
    blueviolet: "#8a2be2",
    bright_lavender: "#bf94e4",
    blue_lilac: "#9f00ff",
    bright_purple: "#6a0dad",
    bright_violet: "#9900ff",
    cyber_grape: "#58427c",
    dark_indigo: "#614e6e",
    dark_lavender: "#3f3351",
    dark_lavenderblue: "#666699",
    dark_lilac: "#734f96",
    dark_pastel_purple: "#966fd6",
    dark_purple: "#7209b7",
    dark_violet: "#9900cc",
    darkorchid: "#9932cc",
    darkslateblue: "#483d8b",
    deep_lilac: "#9955bb",
    deep_purple: "#6600cc",
    deep_violet: "#330066",
    electric_indigo: "#6f00ff",
    electric_lilac: "#9933ff",
    electric_ultramarine: "#3f00ff",
    electric_violet: "#8f00ff",
    french_violet: "#8806ce",
    grape: "#6f2da8",
    han_purple: "#5218fa",
    independence2: "#4a4e69",
    indigo: "#4b0082",
    interdimensional_blue: "#360ccc",
    iris: "#5a4fcf",
    jacarta: "#3d325d",
    ksu_purple: "#512888",
    languid_lavender: "#d6cadd",
    lavender_blue: "#c7ceea",
    lavender_floral: "#b57edc",
    lavender_gray: "#c4c3d0",
    lavender_indigo: "#9457eb",
    lavender_purple: "#967bb6",
    lenurple: "#ba93d8",
    light_pastel_purple: "#b19cd9",
    magnolia: "#f8f4ff",
    majorelle_blue: "#6050dc",
    mauve: "#e0b0ff",
    medium_slate_blue: "#836fff",
    medium_violet: "#9966ff",
    mediumpurple: "#9370db",
    mediumslateblue: "#7b68ee",
    metallic_violet: "#5b0a91",
    middle_blue_purple: "#8b72be",
    midnight_purple: "#10002b",
    mousy_wisteria: "#766980",
    neon_blue: "#1b03a3",
    ocean_blue: "#4f42b5",
    pale_lavender: "#dcd0ff",
    pale_lilac: "#9999ff",
    pale_purple: "#774d8e",
    pale_violet: "#cc99ff",
    palelavender: "#ccccff",
    persian_indigo: "#32127a",
    pixie_powder: "#391285",
    plump_purple: "#5946b2",
    purple_heart: "#69359c",
    purple_mountain_majesty: "#9678b6",
    purple_x11: "#a020f0",
    rebeccapurple: "#663399",
    regalia: "#522d80",
    rhythm: "#777696",
    rich_lavender: "#a76bcf",
    royal_purple: "#7851a9",
    russian_violet: "#32174d",
    safflower: "#5a4f74",
    silver_metallic: "#aaa9ad",
    slateblue: "#6a5acd",
    soap: "#cec8ef",
    spanish_violet: "#4c2882",
    stained_red: "#78779b",
    toolbox: "#746cc0",
    ube: "#8878c3",
    very_dark_violet: "#240046",
    violet: "#911eb4",
    violet_blue_crayola: "#766ec8",
    violet_color_wheel: "#7f00ff",
    violetblue: "#4424d6",
    violets_are_blue: "#8366f4",
    vivid_violet: "#6600ff",
    wisteria_fuji: "#89729e",
    wisteria_purple: "#875f9a"
  },
  cyan: {
    aluminum_foil: "#d2d9db",
    aqua: "#00ffff",
    aqua_blue: "#86aba5",
    aquagreen: "#00ffcc",
    aurometalsaurus: "#6e7f80",
    azure_mist: "#f0ffff",
    baby_blue: "#89cff0",
    ball_blue: "#21abcd",
    battery_charged_blue: "#1dacd6",
    bayside: "#5fc9bf",
    bleach: "#66ffff",
    blizzard_blue: "#ace5ee",
    blue_bolt: "#00b9fb",
    blue_green: "#0d98ba",
    blue_munsell: "#0093af",
    blue_ncs: "#0087bd",
    blue_raspberry: "#0cbfe9",
    blue_sapphire: "#126180",
    bondi_blue: "#0095b6",
    boy_red: "#0e9ca5",
    bright_aqua: "#00f5d4",
    bright_turquoise: "#08e8de",
    bubbles: "#e7feff",
    cadet: "#536872",
    cadetblue: "#5f9ea0",
    capri: "#00bfff",
    caribbean_blue: "#1ac1dd",
    celadon_blue: "#007ba7",
    celadon_green: "#2f847c",
    celeste: "#b2ffff",
    cg_blue: "#007aa5",
    charleston_green: "#232b2b",
    columbia_blue: "#c4d8e2",
    cornflower: "#93ccea",
    crystal: "#a7d8de",
    crystal_blue: "#68a0b0",
    cyan_cornflower_blue: "#188bc2",
    cyan_process: "#00b7eb",
    dark_cyan: "#004346",
    dark_sky_blue: "#8cbed6",
    dark_turquoise: "#55b4b0",
    darkcyan: "#008b8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    deep_jungle_green: "#004b49",
    deep_space_sparkle: "#4a646c",
    delicate_girl_blue: "#6ab2ca",
    desaturated_cyan: "#669999",
    diamond: "#b9f2ff",
    douban_blue: "#2496cd",
    electric_sky: "#7df9ff",
    fluorescent_blue: "#15f4ee",
    fresh_air: "#a6e7ff",
    goryeo_storeroom: "#203838",
    gunmetal: "#2a3439",
    hawaii_blue: "#00c3e3",
    indigo_white: "#ebf6f7",
    iron_head_flower: "#344d56",
    iron_storage: "#2b3736",
    japanese_indigo: "#264348",
    jelly_bean_blue: "#44798e",
    keppel: "#3ab09e",
    kimono_storage: "#3d4c51",
    light_aqua: "#66ffcc",
    light_blue: "#48929b",
    light_blue_flower: "#1d697c",
    light_blue_silk: "#044f67",
    light_cyan: "#7fcdcd",
    light_teal: "#469990",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightseagreen: "#20b2aa",
    lotion_blue: "#15f2fd",
    maximum_blue: "#47abcc",
    maximum_blue_green: "#30bfbf",
    medium_sky_blue: "#80daeb",
    medium_turquoise: "#45b8ac",
    mediumaquamarine: "#66cdaa",
    mediumturquoise: "#48d1cc",
    metallic_seaweed: "#0a7e8c",
    microsoft_blue: "#00a2ed",
    middle_blue: "#7ed4e6",
    midnight_green: "#004953",
    ming: "#36747d",
    moonstone: "#3aa8c1",
    moonstone_blue: "#73a9c2",
    myrtle_green: "#317873",
    new_bridge: "#006c7f",
    non_photo_blue: "#a4dded",
    onando: "#364141",
    onyx: "#353839",
    opposite_flower: "#4d646c",
    outer_space: "#414a4c",
    outer_space_crayola: "#2d383a",
    pacific_blue: "#1ca9c9",
    pale_blue_pale_turquoise: "#afeeee",
    pale_cyan: "#87d3f8",
    pastel_blue: "#aec6cf",
    persian_green: "#00a693",
    pewter_blue: "#8ba8b7",
    picton_blue: "#45b1e8",
    pine_green: "#01796f",
    powderblue: "#b0e0e6",
    rich_black: "#004040",
    rich_electric_blue: "#0892d0",
    robin_egg_blue: "#00cccc",
    rusty_storage: "#455859",
    sea_blue: "#006994",
    sea_serpent: "#4bc7cf",
    sea_sky: "#33cccc",
    seaglass: "#009b77",
    silk_crepe: "#354e4b",
    silver_sand: "#bfc1c2",
    skobeloff: "#007474",
    sky_blue_crayola: "#76d7ea",
    skyblue: "#87ceeb",
    spiro_disco_ball: "#0fc0fc",
    star_command_blue: "#007bb8",
    steel_teal: "#5f8a8b",
    stormcloud: "#4f666a",
    strong_cyan: "#009999",
    teal: "#008080",
    teal_blue: "#367588",
    teal_green: "#00827f",
    thousand_herb: "#317589",
    tiffany_blue: "#0abab5",
    turquoise: "#40e0d0",
    turquoise_blue: "#00ffef",
    turquoise_surf: "#00c5cd",
    twitter_blue: "#26a7de",
    verdigris: "#43b3ae",
    very_pale_cyan: "#ccffff",
    viridian_green: "#009698",
    vivid_cerulean: "#00aaee",
    vivid_sky_blue: "#00ccff",
    warm_black: "#004242",
    water: "#d4f1f9",
    waterspout: "#a4f4f9",
    winter_sky: "#4d8fac",
    winter_wizard: "#a0e6ff"
  },
  cyanblue: {
    absolute_zero: "#0048ba",
    aero: "#7cb9e8",
    air_force_blue: "#5d8aa8",
    air_force_blue_usaf: "#00308f",
    air_superiority_blue: "#72a0c1",
    aliceblue: "#f0f8ff",
    anti_flash_white: "#f2f3f4",
    ateneo_blue: "#003a6c",
    azure: "#007fff",
    azureish_white: "#dbe9f4",
    baby_blue_eyes: "#a1caf1",
    bdazzled_blue: "#2e5894",
    beau_blue: "#bcd4e6",
    black_coral: "#54626f",
    bleu_de_france: "#318ce7",
    blue: "#0047ab",
    blue_cola: "#0088dc",
    blue_crayola: "#1f75fe",
    blue_gray: "#6699cc",
    blue_jeans: "#5dadec",
    blue_yonder: "#5072a7",
    blueberry: "#4f86f7",
    brandeis_blue: "#0070ff",
    bright_navy_blue: "#1974d2",
    bright_sky_blue: "#00bbf9",
    brilliant_azure: "#3399ff",
    brilliant_blue: "#0066ff",
    button_blue: "#24a0ed",
    cadet_blue_crayola: "#a9b2c3",
    cadet_grey: "#91a3b0",
    carolina_blue: "#56a0d3",
    celestial_blue: "#4997d0",
    celtic_blue: "#246bce",
    cerulean_frost: "#6d9bc3",
    charcoal: "#36454f",
    cool_black: "#002e63",
    cornflowerblue: "#6495ed",
    cyan_azure: "#4e82b4",
    cyan_blue_azure: "#4682bf",
    cyan_cobalt_blue: "#28589c",
    dark_cerulean: "#08457e",
    dark_cyan_blue: "#08415c",
    dark_electric_blue: "#536878",
    dark_gunmetal: "#1f262a",
    dark_imperial_blue_green: "#00416a",
    dark_midnight_blue: "#003366",
    dark_powder_blue: "#003399",
    dark_teal: "#073b4c",
    deep_sky_blue: "#0099cc",
    denim: "#1560bd",
    dodger_blue: "#0066cc",
    dodgerblue: "#1e90ff",
    flickr_blue: "#216bd6",
    french_blue: "#0072bb",
    french_sky_blue: "#77b5fe",
    glaucous: "#6082b6",
    google_chrome_blue: "#4c8bf5",
    green_blue: "#1164b4",
    green_blue_crayola: "#2887c8",
    greenblue: "#003153",
    greengrey: "#264653",
    honolulu_blue: "#006db0",
    iceberg: "#71a6d2",
    jordy_blue: "#8ab9f1",
    lapis_lazuli: "#26619c",
    lapis_lazuli_japan: "#1f4788",
    light_azure: "#66ccff",
    light_cobalt_blue: "#88ace0",
    light_sky_blue: "#33ccff",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    linkedin_blue: "#0072b1",
    little_boy_blue: "#6ca0dc",
    maya_blue: "#73c2fb",
    medium_electric_blue: "#035096",
    medium_persian_blue: "#0067a5",
    medium_teal: "#006666",
    metallic_blue: "#32527b",
    microsoft_edge_blue: "#0078d7",
    midnight_blue2: "#00468c",
    ocean_boat_blue: "#0077be",
    oxford_blue: "#002147",
    pale_blue: "#98b4d4",
    pale_cerulean: "#9bc4e2",
    pale_cornflower_blue: "#abcdef",
    pale_sky_blue: "#99ccff",
    panasonic_blue: "#0040be",
    parakeet_blue: "#7eb6ff",
    philippine_blue: "#0038a7",
    prussian_blue_color_konjo_iro: "#003171",
    queen_blue: "#436b95",
    rain_blue: "#92a8d1",
    rich_black_fog: "#010b13",
    rich_black_fog2: "#010203",
    royal_azure: "#0038a8",
    royal_blue_dark: "#002366",
    sapphire: "#0f52ba",
    sea_bluegreen: "#006699",
    shadow_blue: "#778ba5",
    silver_lake_blue: "#5d89ba",
    sky_blue: "#42d4f4",
    slate_blue: "#6e81a0",
    slategray: "#708090",
    spanish_blue: "#0070b8",
    spring_sky: "#0099ff",
    steel_blue: "#347c98",
    steelblue: "#4682b4",
    storm_blue: "#5d8cae",
    tardis_blue: "#003b6f",
    true_blue: "#2d68c4",
    true_blue1: "#0073cf",
    tufts_blue: "#3e8ede",
    ucla_blue: "#536895",
    united_nations_blue: "#5b92e5",
    usafa_blue: "#004f98",
    very_light_azure: "#74bbfb",
    vista_blue: "#7c9ed9",
    weebly_blue: "#1f8eed",
    weldon_blue: "#7c98ab",
    yale_blue: "#0f4d92",
    yankees_blue: "#1c2841",
    yinmn_blue: "#2e5090"
  },
  green: {
    aloeswood_brown: "#5a6457",
    american_green: "#34b334",
    ao_english: "#008000",
    apple: "#66b447",
    asda_green: "#7dc242",
    ash_gray: "#b2beb5",
    asparagus: "#87a96b",
    axolotl: "#63775b",
    black_leather_jacket: "#253529",
    bright_green: "#66ff00",
    bud_green: "#7bb661",
    cambridge_blue: "#a3c1ad",
    camouflage_green: "#78866b",
    celadon: "#ace1af",
    chinese_white: "#e2e5de",
    chlorophyll_green: "#4aff00",
    dark_green: "#003300",
    dark_green_x11: "#006400",
    dark_lime: "#00cc00",
    dark_pastel_green: "#03c03c",
    darkolivegreen: "#556b2f",
    darkseagreen: "#8fbc8f",
    deep_green: "#056608",
    deep_moss_green: "#355e3b",
    dollar_bill: "#85bb65",
    dolphin_gray: "#828e84",
    douban_green: "#2e963d",
    ebony: "#555d50",
    electric_green: "#00ff00",
    emerald_green: "#046307",
    eton_blue: "#96c8a2",
    fern_green: "#4f7942",
    forest_green: "#339933",
    forest_green_crayola: "#5fa777",
    forestgreen: "#228b22",
    french_lime: "#9efd38",
    fresh_onion_moegi: "#5b8930",
    granny_smith_apple: "#a8e4a0",
    gray_asparagus: "#465945",
    green: "#008001",
    green_cola: "#4c721d",
    green_lizard: "#a7f432",
    green_midori: "#2a603b",
    green_ryb: "#66b032",
    green_slime: "#65ff00",
    greenyellow: "#adff2f",
    harbor_rat: "#757d75",
    harlequin: "#3fff00",
    harlequin_green: "#46cb18",
    honeydew: "#f0fff0",
    horsetail: "#3d5d42",
    iguana_green: "#71bc78",
    inchworm: "#b2ec5d",
    india_green: "#138808",
    indigo_codium: "#2e372e",
    islamic_green: "#009000",
    japanese_laurel: "#2f7532",
    jungle_green: "#009933",
    kelly_green: "#4cbb17",
    kiwi: "#8ee53f",
    kombu_green: "#354230",
    laurel_green: "#a9ba9d",
    lawngreen: "#7cfc00",
    lemon_lime_blue: "#5cff67",
    light_green: "#33cc33",
    light_moss_green: "#addfad",
    lightgreen: "#90ee90",
    limegreen: "#32cd32",
    lincoln_green: "#195905",
    malachite: "#0bda51",
    mango_green: "#96ff00",
    mantis: "#74c365",
    maximum_green: "#5e8c31",
    may_green: "#4c9141",
    menthol: "#c1f9a2",
    metallic_green: "#296e01",
    middle_green: "#4d8c57",
    mint_green: "#98ff98",
    mughal_green: "#306030",
    napier_green: "#2a8000",
    neon_green: "#39ff14",
    nickel: "#727472",
    north_texas_green: "#059033",
    nyanza: "#e9ffdb",
    olivine: "#9ab973",
    oxley: "#6d9a79",
    pakistan_green: "#006600",
    pale_blue_usuao: "#8c9c76",
    pale_emerald: "#50c878",
    pale_green: "#99ff99",
    pale_young_green_onion: "#8db255",
    palegreen: "#98fb98",
    palm_leaf: "#6f9940",
    pastel_green: "#77dd77",
    patina_rokusho: "#407a52",
    pine_tree: "#2a2f23",
    pistachio: "#93c572",
    pleasant_green: "#3cb44b",
    pomona_green: "#1e4d2b",
    rifle_green: "#444c38",
    royal_green: "#136207",
    russian_green: "#679267",
    rusty_storeroom: "#3a403b",
    sap_green: "#507d2a",
    screamin_green: "#66ff66",
    shiny_shamrock: "#5fa778",
    silver_foil: "#afb1ae",
    slimy_green: "#299617",
    smoke: "#738276",
    spring_frost: "#87ff2a",
    strong_green: "#009900",
    tea_green: "#d0f0c0",
    teal_deer: "#99e6b3",
    thousand_year_old_green: "#374231",
    verse_green: "#18880d",
    very_dark_olive: "#333300",
    very_light_malachite_green: "#64e986",
    very_pale_green: "#ccffcc",
    vine_green: "#38a32a",
    vivid_malachite: "#00cc33",
    wageningen_green: "#34b233",
    whitish_green: "#a5ba93",
    xanadu: "#738678",
    xbox_green: "#0e7a0d",
    yellow_green: "#30b21a",
    young_bamboo: "#6b9362",
    young_olive: "#336600"
  },
  greencyan: {
    aero_blue: "#c9ffe5",
    amazon: "#3b7a57",
    aquamarine: "#7fffd4",
    asda_green_1985: "#00dea4",
    asda_green_1994: "#80c197",
    asda_green_1999: "#66c992",
    asda_green_2002: "#32ad61",
    bangladesh_green: "#006a4e",
    blue_green_seiheki: "#3a6960",
    blue_lagoon: "#4cb7a5",
    bluegreen: "#064e40",
    british_racing_green: "#004225",
    brunswick_green: "#1b4d3e",
    cadmium_green: "#006b3c",
    caribbean_green: "#00cc99",
    castleton_green: "#00563f",
    celadon_seiji: "#819c8b",
    dark_jungle_green: "#1a2421",
    dark_spring_green: "#177245",
    dartmouth_green: "#00703c",
    deep_aquamarine: "#40826d",
    deep_green_cyan: "#0e7c61",
    emerald: "#013220",
    eucalyptus: "#44d7a8",
    feldgrau: "#4d5d53",
    forest_green_traditional: "#014421",
    generic_viridian: "#007f66",
    go_green: "#00ab66",
    google_chrome_green: "#1aa260",
    green_bamboo: "#006442",
    green_crayola: "#1cac78",
    green_cyan: "#009966",
    green_munsell: "#00a877",
    green_ncs: "#009f6b",
    green_pantone: "#00ad43",
    green_pigment: "#00a550",
    green_sheen: "#6eaea1",
    guppie_green: "#00ff7f",
    hookers_green: "#49796b",
    illuminating_emerald: "#319177",
    insect_screen: "#2d4436",
    iron_tetsu: "#2b3733",
    italian_ice: "#e9f6ef",
    jade: "#00a86b",
    jet_stream: "#bbd0c9",
    jungle_cyan: "#29ab87",
    light_emerald: "#48bf84",
    magic_mint: "#aaf0d1",
    medium_aquamarine: "#66ddaa",
    medium_jungle_green: "#1c352d",
    medium_spring_green: "#00cc66",
    mediumseagreen: "#3cb371",
    mediumspringgreen: "#00fa9a",
    middle_blue_green: "#8dd9cc",
    mint: "#3eb489",
    mintcream: "#f5fffa",
    morning_blue: "#8da399",
    mountain_meadow: "#30ba8f",
    msu_green: "#18453b",
    ocean_green: "#48bf91",
    opal: "#a8c3bc",
    pale_green_onion: "#749f8d",
    pale_mint: "#99ffcc",
    pale_robin_egg_blue: "#96ded1",
    paolo_veronese_green: "#009b7d",
    pearl_aqua: "#88d8c0",
    philippine_green: "#008543",
    phthalo_green: "#123524",
    poker_green: "#35654d",
    polished_pine: "#5da493",
    rusted_light_blue: "#6a7f7a",
    sacramento_state_green: "#043927",
    sea_foam_green: "#9fe2bf",
    sea_green: "#339966",
    sea_green_crayola: "#00ffcd",
    seagreen: "#2e8b57",
    sesame_street_green: "#00a870",
    shamrock_green: "#009e60",
    spanish_green: "#009150",
    spanish_viridian: "#007f5c",
    spearmint: "#66ff99",
    spring_green: "#00ff99",
    tropical_rain_forest: "#00755e",
    turquoise_green: "#a0d6b4",
    ufo_green: "#3cd070",
    velvet_birodo: "#224634",
    wintergreen_dream: "#56887d",
    zomp: "#39a78e"
  },
  magenta: {
    african_violet: "#b284be",
    american_purple: "#431c53",
    antique_fuchsia: "#915c83",
    bellflower: "#5d3f6a",
    berry_pink: "#c3447a",
    blue_violet: "#2b2028",
    blush: "#d65076",
    bright_lilac: "#d891ef",
    bright_orchid: "#cc33ff",
    bright_ube: "#d19fe8",
    brilliant_lavender: "#f4bbff",
    bubblegum: "#ff99ff",
    byzantine: "#bd33a4",
    byzantium: "#702963",
    cadmium_violet: "#7f3e98",
    chinese_purple: "#720b98",
    chinese_violet: "#856088",
    dark_byzantium: "#5d3954",
    dark_magenta: "#993399",
    dark_mauve: "#993366",
    dark_red_violet: "#990099",
    darkmagenta: "#8b008b",
    darkpurple: "#301934",
    darkviolet: "#9400d3",
    deep_amethyst: "#9c8aa4",
    deep_fuchsia: "#c154c1",
    deep_magenta: "#cc00cc",
    deep_mauve: "#d473d4",
    deep_pink: "#ff3399",
    deeppurple: "#3a243b",
    electric_purple: "#bf00ff",
    eminence: "#6c3082",
    english_violet: "#563c5c",
    fandango: "#b53389",
    fashion_fuchsia: "#f400a1",
    flirt: "#a2006d",
    french_lilac: "#86608e",
    fuchsia: "#ff00ff",
    fuchsia_pink: "#ff77ff",
    glossy_grape: "#ab92b3",
    half_hashita: "#8d608c",
    heliotrope: "#df73ff",
    heliotrope_gray: "#aa98a9",
    heliotrope_magenta: "#aa00bb",
    hot_magenta: "#ff1dce",
    hot_pink: "#ff0066",
    imperial: "#602f6b",
    iris_purple: "#763568",
    japanese_violet: "#5b3256",
    lavender_magenta: "#ee82ee",
    lavender_rose: "#fba0e3",
    lavenderblush: "#fff0f5",
    light_blush: "#ffb7b2",
    light_deep_pink: "#ff5ccd",
    light_fuchsia_pink: "#f984ef",
    light_grayish_magenta: "#cc99cc",
    light_magenta: "#ff80ff",
    light_medium_orchid: "#d39bcb",
    light_orchid: "#e6a8d7",
    light_pink: "#f7cac9",
    light_red_violet: "#ff6699",
    lightpink: "#ffb6c1",
    lilac: "#c8a2c8",
    lilac_luster: "#ae98aa",
    magentapink: "#ff66ff",
    mardi_gras: "#880085",
    mate_black: "#242124",
    maximum_purple: "#733380",
    medium_lavender_magenta: "#dda0dd",
    medium_orchid: "#cc66ff",
    medium_pink: "#cc6699",
    medium_red_violet: "#cc3399",
    mediumorchid: "#ba55d3",
    midnight: "#702670",
    old_lavender: "#796878",
    opera_mauve: "#b784a7",
    orchid: "#b565a7",
    orchid_crayola: "#e29cd2",
    orchid_pink: "#f49ac2",
    palatinate_purple: "#682860",
    pale_blush: "#f4b9b8",
    pale_blush_pink: "#ffd1dc",
    pale_magenta: "#f984e5",
    pale_pink: "#ffcccc",
    pale_purple_pantone: "#fae6fa",
    pastel_purple: "#b39eb5",
    pastel_violet: "#cb99c9",
    patriarch: "#800080",
    pearly_purple: "#b768a2",
    philippine_violet: "#81007f",
    phlox: "#df00ff",
    pink_flamingo: "#fc74fd",
    pink_lace: "#ffddf4",
    pink_lavender: "#d8b2d1",
    plum: "#8e4585",
    purple: "#660066",
    purple_munsell: "#9f00c5",
    purple_murasaki: "#4f284b",
    purple_pizzazz: "#fe4eda",
    purple_plum: "#9c51b6",
    purple_taupe: "#50404d",
    purpureus: "#9a4eae",
    quartz: "#51484f",
    rabbit_ear_iris: "#491e3c",
    raspberry: "#c21460",
    razzle_dazzle_rose: "#ff33cc",
    razzmic_berry: "#8d4e85",
    rich_brilliant_lavender: "#f1a7fe",
    rich_lilac: "#b666d2",
    rosa: "#ffccff",
    rose_pink: "#ff66cc",
    rose_quartz_pink: "#bd559c",
    rum: "#716675",
    shampoo: "#ffcff1",
    shocking_pink: "#fc0fc0",
    shocking_pink_crayola: "#ff6fff",
    sky_magenta: "#cf71af",
    steel_pink: "#cc33cc",
    strong_magenta: "#cc0099",
    tatarian_aster: "#976e9a",
    taupe_gray: "#8b8589",
    thin_usu: "#a87ca0",
    thistle: "#d8bfd8",
    thistle_crayola: "#ebb0d7",
    tropical_violet: "#cda4de",
    very_pale_pink: "#f2e2e0",
    violet_crayola: "#963d7f",
    violet_ryb: "#8601af",
    vivid_mulberry: "#b80ce3",
    vivid_orchid: "#cc00ff",
    vivid_raspberry: "#cc0066",
    wisteria: "#c9a0dc"
  },
  magentapink: {
    amaranth_deep_purple: "#9f2b68",
    barbie_pink: "#e94196",
    barbie_pink_1975: "#d3419d",
    barbie_pink_1999: "#f7238a",
    barbie_pink_pantone: "#e0218a",
    boysenberry: "#873260",
    bright_pink: "#ff007f",
    classic_rose: "#fbcce7",
    dark_liver: "#534b4f",
    dark_raspberry: "#872657",
    dark_red_kurobeni: "#23191e",
    deep_cerise: "#da3287",
    deeppink: "#ff1493",
    disappearing_purple: "#3f313a",
    eggplant: "#614051",
    flickr_pink: "#fb0081",
    french_plum: "#811453",
    frostbite: "#e936a7",
    halaya_pink: "#663854",
    hotpink: "#ff69b4",
    imperial_purple: "#66023c",
    jazzberry_jam: "#a50b5e",
    kobi: "#e79fc4",
    light_hot_pink: "#ffb3de",
    magenta_dye: "#ca1f7b",
    magenta_haze: "#9f4576",
    magenta_pink: "#cc338b",
    magenta_process: "#ff0090",
    maximum_red_purple: "#a63a79",
    mediumvioletred: "#c71585",
    mexican_pink: "#e4007c",
    middle_purple: "#d982b5",
    mountbatten_pink: "#997a8d",
    mulberry: "#c54b8c",
    mulberry_crayola: "#c8509b",
    mystic_maroon: "#ad4379",
    pale_magenta_pink: "#ff99cc",
    palevioletred: "#db7093",
    pansy_purple: "#78184a",
    persian_pink: "#f77fbe",
    persian_rose: "#fe28a2",
    philippine_pink: "#fa1a8e",
    pink: "#ffc0cb",
    pink_pantone: "#d74894",
    pink_pearl: "#e7accf",
    princess_perfume: "#ff85cf",
    raspberry_pink: "#e25098",
    red_magenta: "#bb3385",
    red_purple: "#e40078",
    red_violet_crayola: "#c0448f",
    rose_bonbon: "#f9429e",
    royal_fuchsia: "#ca2c92",
    royal_pink: "#e73895",
    smitten: "#c84186",
    spanish_purple: "#66033c",
    strong_boy_pink: "#e9399e",
    sugar_plum: "#914e75",
    sunset: "#ff007c",
    super_pink: "#cf6ba9",
    twilight_lavender: "#8a496b",
    vine_grape_ebizome: "#6d2b50",
    vivid_cerise: "#da1d81",
    wild_orchid: "#d470a2",
    wild_strawberry: "#ff43a4",
  },
  orange: {
    alloy_orange: "#c46210",
    almond: "#efdecd",
    aloewood: "#6a432d",
    amber_japan: "#ca6924",
    amber_saeece: "#ff7e00",
    american_bronze: "#391802",
    american_orange: "#ff8b00",
    antique_brass: "#cd9575",
    antiquewhite: "#faebd7",
    apricot: "#fbceb1",
    asda_orange: "#c86500",
    asda_orange_1968: "#ca7309",
    beaver: "#9f8170",
    beer: "#f28e1c",
    big_foot_feet: "#e88e5a",
    bisque: "#ffe4c4",
    bistre: "#3d2b1f",
    black_chestnut: "#252321",
    black_kokushoku: "#171412",
    blanchedalmond: "#ffebcd",
    bone: "#e3dac9",
    bright_yellow_crayola: "#ffaa1d",
    bronze: "#cd7f32",
    bronze1: "#88540b",
    bronze_metallic: "#b08d57",
    brown_nose: "#6b4423",
    brown_traditional: "#964b00",
    brown_yellow: "#cc9966",
    brushwood_dyed_fushizome: "#8c5939",
    burlywood: "#deb887",
    burnt_orange: "#cc5500",
    cadmium_orange: "#ed872d",
    cafe_au_lait: "#a67b5b",
    cafe_noir: "#4b3621",
    camel: "#c19a6b",
    cape_jasmine: "#ffb95a",
    caramel_creme: "#ffd59a",
    carrot_orange: "#ed9121",
    chamoisee: "#a0785a",
    champagne: "#f7e7ce",
    champagne_pink: "#f1ddcf",
    cheese: "#ffa600",
    chickadee: "#ffc34d",
    chinese_bronze: "#cd8032",
    chinese_yellow_tea: "#b7702d",
    chocolate_traditional: "#7b3f00",
    chrome_yellow: "#ffa700",
    cinnamon: "#d2691e",
    classic_orange: "#ff6600",
    clove_dyed_chojizome: "#a96232",
    coffee: "#6f4e37",
    cola: "#3c3024",
    color_of_an_undried_wall: "#785e49",
    contemplation: "#665343",
    copper_brown: "#a65f46",
    corn_japan: "#faa945",
    coyote_brown: "#81613c",
    dark_bronze: "#804a00",
    dark_brown: "#5e3d26",
    dark_brown_tangelo: "#88654e",
    dark_copper: "#b87333",
    dark_gold: "#aa6c39",
    dark_golden_yellow: "#ffa400",
    dark_lava: "#483c32",
    dark_ochre: "#be7f51",
    dark_silver: "#71706e",
    dark_tangerine: "#ffa812",
    dark_taupe: "#423629",
    dark_vanilla: "#d1bea8",
    darkbrown: "#663300",
    darkorange: "#ff8c00",
    daylily: "#ff8936",
    decaying_leaves: "#d57835",
    deep_champagne: "#fad6a5",
    deep_peach: "#ffcba4",
    deep_saffron: "#ff9933",
    deer: "#ba8759",
    desert_sand: "#edc9af",
    dirt: "#9b7653",
    dirty_brown: "#b5651e",
    douban_light_yellow: "#f7c58e",
    dull_blue_aonibi: "#4f4944",
    durian: "#b07939",
    durian_white: "#e6d0ab",
    earth_yellow: "#e1a95f",
    earthtone: "#5d3a1a",
    egg: "#ffa631",
    eggshell_paper: "#e2be9f",
    faded_rikyus_tea: "#b0927a",
    fawn: "#e5aa70",
    feldspar: "#fdd5b1",
    flesh: "#ffe9d1",
    floral_leaf: "#ffb94e",
    floralwhite: "#fffaf0",
    fox: "#985629",
    french_bistre: "#856d4d",
    fulvous: "#e48400",
    gamboge: "#e49b0f",
    gamboge_orange_brown: "#996600",
    gamboge_bright: "#ffb61e",
    gold_brown_yamabukicha: "#cb7e1f",
    gold_crayola: "#e6be8a",
    golden_brown: "#996515",
    golden_fallen_leaves: "#e29c45",
    golden_grey_bamboo: "#7d4e2d",
    golden_oak: "#bb8141",
    grullo: "#a99a86",
    harvest_gold: "#da9100",
    heat_wave: "#ff7a00",
    iced_tea: "#923c01",
    indian_yellow: "#e3a857",
    ink_color_sumi_iro: "#27221f",
    isabelline: "#f4f0ec",
    italian_leather: "#635a52",
    iwai_brown_iwaicha: "#5e5545",
    jacko_bean: "#413628",
    japanese_iris: "#7f5d3b",
    jasper_orange: "#de8f4e",
    kumquat: "#fb9912",
    light_brown: "#b5651d",
    light_french_beige: "#c8ad7f",
    light_golden_brown: "#c66b27",
    light_taupe: "#b38b6d",
    light_yellow_asagi: "#f7bb7d",
    linen: "#faf0e6",
    liver_chestnut: "#987456",
    liver_dogs: "#b86d29",
    loquat_tree_brown: "#ab6134",
    lumber: "#ffe4cd",
    lye: "#7f6b5d",
    macaroni_and_cheese: "#ffbd88",
    manila: "#e7c9a9",
    maple_syrup: "#bb9351",
    marigold: "#eaa221",
    maximum_orange: "#ff5b00",
    maximum_yellow_red: "#f2ba49",
    medium_brown: "#996633",
    mellow_apricot: "#f8b878",
    metallic_bronze: "#a97142",
    metallic_orange: "#da680f",
    metallic_sunburst: "#9c7c38",
    middle_grey: "#8b8680",
    middle_yellow_red: "#ecb176",
    milk_chocolate: "#84563c",
    mocha: "#bea493",
    mousy_indigo: "#5c544e",
    mud: "#70543e",
    mulberry_orange: "#c57f2e",
    mustard_brown: "#cd7a00",
    navajowhite: "#ffdead",
    neon_carrot: "#ffa343",
    nightingale_brown: "#5c4827",
    ochre1: "#cc7722",
    oldlace: "#fdf5e6",
    orange: "#f58231",
    orange_brown: "#cc6600",
    orange_color_wheel: "#ff7f00",
    orange_peel: "#ff9f00",
    orange_ryb: "#fb9902",
    pale_brown: "#987654",
    pale_incense_usuko: "#ffa565",
    pale_peach: "#ffe5b4",
    pale_persimmon: "#fca474",
    pale_silver: "#c9c0bb",
    pale_taupe: "#bc987e",
    papayawhip: "#ffefd5",
    pastel_brown: "#836953",
    pastel_orange: "#ffb347",
    peach_cream: "#fed8b1",
    peach_orange: "#ffcc99",
    peach_yellow: "#fadfad",
    peachpuff: "#ffdab9",
    penguin_white: "#f5f3ef",
    persian_orange: "#d99058",
    persimmon: "#ec5800",
    peru: "#cd853f",
    philippine_bronze: "#6e3a07",
    philippine_gold: "#b17304",
    philippine_orange: "#ff7300",
    pineapple: "#563c0d",
    platinum: "#e5e4e2",
    plum_dyed_umezome: "#fa9258",
    princeton_orange: "#f58025",
    pullman_brown_ups_brown: "#644117",
    pumpkin: "#ff7518",
    quincy: "#6a5445",
    rajah: "#fbab60",
    raw_sienna: "#d68a59",
    raw_umber: "#826644",
    red_bronze: "#fb8136",
    royal_orange: "#f99245",
    ruddy_brown: "#bb6528",
    russet: "#80461b",
    saddlebrown: "#8b4513",
    safety_orange: "#ff7800",
    safety_orange_blaze: "#ff6700",
    sand: "#d99559",
    sandy_tan: "#fdd9b5",
    sandybrown: "#f4a460",
    satsuma: "#f28500",
    seashell: "#fff5ee",
    sen_no_rikyus_tea_rikyucha: "#826b58",
    sepia: "#704214",
    shadow: "#8a795d",
    silver_grey_ginnezumi: "#97867c",
    simmered_seaweed_mirucha: "#4c3d30",
    smoky_black: "#100c08",
    spanish_orange: "#e86100",
    steamed_chestnut: "#d3b17d",
    stone_terrace: "#a09484",
    stylish_persimmon: "#ffa26b",
    sumac_dyed_hajizome: "#e08a1e",
    sunray: "#e3ab57",
    tan: "#d2b48c",
    tan_crayola: "#d99a6c",
    tangerine: "#fc600a",
    tenne_tawny: "#cd5700",
    thousand_year_old_brown: "#3b3429",
    tigers_eye: "#e08d3c",
    timberwolf: "#dbd7d2",
    topaz: "#ffc87c",
    tumbleweed: "#deaa88",
    turmeric: "#e69b3a",
    umber: "#635147",
    unbleached_silk: "#ffddca",
    university_of_california_gold: "#b78727",
    university_of_tennessee_orange: "#f77f00",
    van_dyke_brown: "#664228",
    very_light_tangelo: "#ffb077",
    very_pale_orange: "#ffdfbf",
    violin_brown: "#674403",
    vivid_gamboge: "#ff9900",
    vivid_orange: "#ff5f00",
    vivid_orange_peel: "#ffa000",
    vivid_tangelo: "#f07427",
    weathered_bamboo: "#593a27",
    weebly_orange: "#ff9a00",
    wheat: "#f5deb3",
    white_coffee: "#e6e0d4",
    white_mouse: "#b9a193",
    white_oak: "#ce9f6f",
    white_tea: "#c48e69",
    windsor_tan: "#a75502",
    yellow_orange: "#ffae42",
    yellow_orange_wheel: "#ff9505",
    yellow_sea_pine_brown: "#896c39",
    zinnwaldite_brown: "#2c1608"
  },
  orangered: {
    acajou: "#4c2f27",
    atomic_tangerine: "#ff9966",
    betel_nut: "#352925",
    birch_brown_kabacha: "#b14a30",
    blast_off_bronze: "#a57164",
    boiled_red_bean_brown: "#542d24",
    brave_orange: "#ff631c",
    brewed_mustard_brown: "#e68364",
    bright_orange_red: "#fb5607",
    brown: "#993300",
    brown_crayola: "#af593e",
    brown_sugar: "#af6e4d",
    burnt_sienna: "#e97451",
    carrot: "#cc3300",
    cattail_color: "#b64925",
    cherry_blossom: "#fcc9b9",
    chinese_orange: "#f37042",
    chinese_red: "#aa381e",
    cinereous: "#98817b",
    citrine_brown: "#933709",
    clove_brown: "#8f583c",
    coconut: "#965a3e",
    copper: "#da8a67",
    copper_red: "#cb6d51",
    coquelicot: "#ff3800",
    coral: "#ff7f50",
    dark_liver_horses: "#543d37",
    darksalmon: "#e9967a",
    deep_carrot_orange: "#e9692c",
    deep_dumpling: "#9b351b",
    deep_orange: "#f3722c",
    electric_orange: "#ff3503",
    faded_spicy_red_brown: "#9b533f",
    flame: "#e25822",
    french_puce: "#4e1609",
    giants_orange: "#fe5a1d",
    green_tea: "#824b35",
    halloween_orange: "#eb6123",
    indigo_ink_brown: "#393432",
    international_orange: "#ff4f00",
    italian_roast: "#906652",
    kenyan_copper: "#7c1c05",
    kobe: "#882d17",
    legal_dye: "#2e211b",
    lemon_iced_tea: "#bd3000",
    light_coral: "#ff968a",
    lightsalmon: "#ffa07a",
    liver_organ: "#6c2e1f",
    mahogany: "#c04000",
    mandarin: "#f37a48",
    mango_tango: "#ff8243",
    meat_color: "#f9906f",
    medium_vermilion: "#d9603b",
    metallic_brown: "#ac4313",
    microsoft_red: "#f04e1f",
    middle_red: "#e58e73",
    muddy_brown: "#cb6649",
    mystic_red: "#ff5500",
    ochre: "#ff4e20",
    ora_orange: "#ffa500",
    orange1: "#ff5800",
    orange_red: "#ff681f",
    orioles_orange: "#fb4f14",
    outrageous_orange: "#ff6e4a",
    pale_red: "#ef476f",
    papaya: "#ff7538",
    plain_mouse: "#6e5f57",
    polished_brown: "#985538",
    poppy_petal: "#f6a08c",
    red_incense: "#f07f5e",
    red_ochre: "#9f5233",
    red_orange: "#ff3300",
    red_orange_color_wheel: "#ff4500",
    refreshed_red_brown: "#e35c38",
    rich_gardenia: "#f57f4f",
    rinsed_out_red: "#ff7952",
    root_beer: "#290e05",
    royal_brown: "#523b35",
    rust: "#b7410e",
    rust_red: "#dd4124",
    salmon_pink: "#ff4057",
    sawtooth_oak: "#ec956c",
    scorched_brown: "#351f19",
    seal_brown: "#59260b",
    sinopia: "#cb410b",
    smashed_pumpkin: "#ff6d3a",
    smokey_topaz: "#832a0d",
    sparrow_brown: "#8c4736",
    spicy_mix: "#8b5f4d",
    spicy_red_brown: "#b35c44",
    sumac_dyed_korozen: "#592b1f",
    tangelo: "#f94d00",
    taobao_orange: "#ff4200",
    terracotta: "#e15d44",
    vivid_red_tangelo: "#df6124",
    vivid_tangerine: "#ffa089",
    vivid_vermilion: "#e56024",
    walnut_dyed: "#9f7462",
    washed_out_persimmon: "#ec8254",
    watermelon: "#ff6f61",
    willpower_orange: "#fd5800",
    xiaomi_orange: "#fd4900",
    zinnwaldite: "#ebc2af"
  },
  orangeyellow: {
    alabaster: "#f2f0e6",
    amber: "#ffbf00",
    american_gold: "#d3af37",
    american_yellow: "#f2b400",
    amur_cork_tree: "#f3c13a",
    arylide_yellow: "#e9d66b",
    baiko_brown: "#857c55",
    banana: "#ffd662",
    banana_mania: "#fae7b5",
    bistre_brown: "#967117",
    black_chocolate: "#1b1811",
    blond: "#faf0be",
    bright_yellow_orange: "#ffbe0b",
    buff: "#f0dc82",
    chinese_gold: "#cc9900",
    chinese_yellow: "#ffb200",
    codium_fragile_seaweed: "#524b2a",
    cookies_and_cream: "#eee0b1",
    cornsilk: "#fff8dc",
    cosmic_latte: "#fff8e7",
    cyber_yellow: "#ffd300",
    dandelion_crayola: "#fddb6d",
    dark_bronze_coin: "#514100",
    dark_olive_drab: "#3c341f",
    dark_tan: "#918151",
    darkgoldenrod: "#b8860b",
    deep_lemon: "#f5c71a",
    durian_yellow: "#e1bd27",
    dutch_white: "#efdfbb",
    ecru: "#c2b280",
    eggshell: "#f0ead6",
    field_drab: "#6c541e",
    finch_brown: "#957b38",
    flax: "#eedc82",
    flirtatious_indigo_tea: "#473f2d",
    gargoyle_gas: "#ffdf46",
    gold: "#a57c00",
    gold_foil: "#bd9b16",
    gold_fusion: "#85754e",
    gold_metallic: "#d4af37",
    golden: "#ffd700",
    golden_poppy: "#fcc200",
    goldenrod: "#efc050",
    google_chrome_yellow: "#ffce44",
    greyish_dark_green: "#656255",
    inside_of_a_bottle: "#c6c2b6",
    iron: "#a19d94",
    japanese_triandra_grass: "#e2b13c",
    jasmine: "#f8de7e",
    jonquil: "#f4ca16",
    lanzones: "#e0bc5b",
    lemon_curry: "#cca01d",
    lemon_meringue: "#f6eabe",
    light_gold: "#b29700",
    light_orange: "#ffcc66",
    lotion: "#fefdfa",
    maize_crayola: "#f2c649",
    mango: "#fdbe02",
    meat_brown: "#e5b73b",
    medium_champagne: "#f3e5ab",
    metallic_yellow: "#fdcc0d",
    microsoft_yellow: "#fdb900",
    mikado_yellow: "#ffc40c",
    moss_color: "#8b7d3a",
    mustard: "#ffdb58",
    mustard_yellow: "#e1ad01",
    naples_yellow: "#fada5e",
    old_gold: "#cfb53b",
    orange_yellow: "#f5bd1f",
    orange_yellow_crayola: "#f8d568",
    pale_fallen_leaves: "#aa8736",
    pale_oak: "#bba46d",
    patrinia_flowers: "#d9b611",
    peach: "#ffd8b1",
    peach_puff: "#ffdac1",
    pearl: "#eae0c8",
    philippine_yellow: "#fecb00",
    porcupine: "#936900",
    pullman_green: "#3b331c",
    rape_blossom_brown: "#e3b130",
    rapeseed_oil: "#a17917",
    rikan_brown_rikancha: "#534a32",
    ripe_mango: "#ffc324",
    saffron: "#f4c430",
    satin_sheen_gold: "#cba135",
    school_bus_yellow: "#ffd800",
    selective_yellow: "#ffba00",
    shandy: "#ffe670",
    sienna: "#a0522d",
    spanish_yellow: "#f6b511",
    sunflower_yellow: "#daa520",
    sunglow: "#ffcc33",
    sunset_yellow: "#ffc922",
    tangerine_yellow: "#ffcc00",
    titanium: "#878681",
    ucla_gold: "#ffb300",
    urobilin: "#e1ad21",
    vegas_gold: "#c5b358",
    white_chocolate: "#ede6d6",
    willow_grey: "#817b69",
    willow_tea: "#9c8a4d",
    yellow_crayola: "#fce883"
  },
  red: {
    amaranth_red: "#d3212d",
    american_brown: "#804040",
    american_pink: "#ff9899",
    auburn: "#a52a2a",
    baby_pink: "#f4c2c2",
    barn_red: "#7c0a02",
    begonia: "#fa6e79",
    bittersweet: "#fe6f5e",
    bittersweet_shimmer: "#bf4f51",
    black_bean: "#3d0c02",
    black_coffee: "#3b2f2f",
    black_kite: "#351e1c",
    blood: "#a41313",
    blood1: "#8a0303",
    blood_organ: "#630f0f",
    blood_red: "#f35336",
    blood_red1: "#660000",
    bole: "#79443b",
    brandy: "#87413f",
    brown_coffee: "#4a2c2a",
    brown_rat_grey: "#4b3c39",
    bulgarian_rose: "#480607",
    burnished_brown: "#a17a74",
    burnt_umber: "#8a3324",
    candy_apple_red: "#ff0800",
    candy_pink: "#e4717a",
    caput_mortuum: "#592720",
    carmine: "#9b2335",
    carmine_pink: "#eb4c42",
    carnelian: "#b31b1b",
    cedar_chest: "#c95a49",
    cg_red: "#e03c31",
    cherry_blossom_mouse: "#ac8181",
    chestnut: "#954535",
    chestnut_leather_brown: "#60281e",
    chinese_brown: "#ab381f",
    cinnabar: "#e34234",
    congo_pink: "#f88379",
    copper_penny: "#ad6f69",
    copper_rose: "#996666",
    coral_color: "#f8674f",
    coral_red: "#ff4040",
    coral_reef: "#f6a494",
    coral_reef1: "#fd7c6e",
    crimson: "#dc143c",
    crimson_red: "#990000",
    cypress_bark_color: "#752e23",
    cypress_bark_red: "#6f3028",
    dark_candy_apple_red: "#a40000",
    dark_chestnut: "#986960",
    dark_chocolate: "#490206",
    dark_coral: "#cd5b45",
    dark_crimson: "#990033",
    dark_international_orange: "#c0362c",
    dark_maroon: "#540b0e",
    dark_pastel_red: "#c23b22",
    dark_red: "#660033",
    dark_salmon: "#ff6666",
    dark_sienna: "#3c1414",
    darkred: "#8b0000",
    dawn_color: "#fa7b62",
    deep_carmine_pink: "#ef3038",
    deep_chestnut: "#b94e48",
    deep_coffee: "#704241",
    deep_maroon: "#820000",
    deep_raspberry: "#e6194b",
    deep_red: "#850101",
    deep_scarlet: "#7b3b3a",
    deep_taupe: "#7e5e60",
    dove_feather_grey: "#755d5b",
    dust_storm: "#e5ccc9",
    dyestalk_red: "#913225",
    electric_brown: "#b56257",
    electric_red: "#e60000",
    english_red: "#ab4b52",
    english_vermillion: "#cc474b",
    falu_red: "#801818",
    ferrari_red: "#ff2800",
    fire_engine_red: "#ce2029",
    fire_opal: "#e95c4b",
    firebrick: "#b22222",
    fuzzy_wuzzy: "#cc6666",
    garnet: "#733635",
    giants_club: "#b05c52",
    glazed_persimmon: "#d34e36",
    google_chrome_red: "#de5246",
    greyed_red: "#bc2d29",
    huawei_red: "#ed1c24",
    ibis_wing_color: "#f58f84",
    indian_red: "#993333",
    indianred: "#cd5c5c",
    international_orange1: "#ba160c",
    jasper: "#d73b3e",
    jelly_bean: "#da614e",
    jolly_red: "#cc0000",
    ku_crimson: "#e8000d",
    licorice: "#1a1110",
    light_red: "#ffcccb",
    light_salmon_pink: "#ff9999",
    lightcoral: "#f08080",
    liver: "#674c47",
    long_spring: "#b95754",
    lotion_pink: "#eccfcf",
    lust: "#e62020",
    lychee: "#dc5349",
    madder_lake: "#cc3336",
    maroon: "#5e2824",
    maximum_red: "#d92121",
    medium_carmine: "#af4035",
    melancholy: "#fdbcb4",
    melon: "#febaad",
    metallic_red: "#a62c2b",
    middle_red_purple: "#a55353",
    mistyrose: "#ffe4e1",
    mordant_red_19: "#ae0c00",
    mulberry_dye: "#59292c",
    new_york_pink: "#d7837f",
    nintendo_red: "#e4000f",
    ogre_odor: "#fd5240",
    old_burgundy: "#43302e",
    old_rose: "#c08081",
    one_kin: "#f08f90",
    orange_red_brown: "#ff5349",
    orange_soda: "#fa5b3d",
    orange_soda1: "#eb593d",
    orangered: "#dc3023",
    ou_crimson_red: "#841617",
    painite: "#6b4947",
    pale_chestnut: "#ddadaf",
    pastel_pink: "#dea5a4",
    pastel_red: "#ff6961",
    peach_burst: "#f39998",
    permanent_geranium_lake: "#e12c2c",
    persian_plum: "#701c1c",
    persian_red: "#cc3333",
    persimmon_juice_color: "#934337",
    philippine_brown: "#5d1916",
    plum_blossom_mouse: "#97645a",
    portland_orange: "#ff5a36",
    primary_red: "#ff0000",
    pure_crimson: "#c3272b",
    rambutan_red: "#a72127",
    red: "#bc243c",
    red_bean_color: "#672422",
    red_birch: "#9d2b22",
    red_brown: "#a13d2d",
    red_brown1: "#8b352d",
    red_cola: "#b62020",
    red_kite: "#913228",
    red_maroon: "#800000",
    red_ryb: "#fe2712",
    redwood: "#a45a52",
    rose_ebony: "#674846",
    rose_taupe: "#905d5d",
    rose_vale: "#ab4e52",
    rosewood: "#955251",
    rosso_corsa: "#d40000",
    rosybrown: "#bc8f8f",
    rufous: "#a81c07",
    salmon: "#fa8072",
    salmon_rose: "#e7968b",
    sangria: "#92000a",
    sappanwood_incense: "#a24f46",
    chili_red: "#ff2400",
    scarlet1: "#cf3a24",
    silver_pink: "#c4aead",
    smoky_topaz: "#933d41",
    snow: "#fffafa",
    spanish_pink: "#f7bfbe",
    spartan_crimson: "#9e1316",
    strawberry: "#ff5050",
    strawberry_daiquiri: "#d9463e",
    strawberry_jam: "#8b171a",
    strawberry_red: "#c83f49",
    strong_red: "#f94144",
    sunburnt_cyclops: "#ff404c",
    sunset_orange: "#fd5e53",
    sweet_brown: "#a83731",
    tart_orange: "#fb4d46",
    terra_cotta: "#e2725b",
    thrice_dyed_crimson: "#f7665a",
    tomato: "#ff6347",
    tomato_sauce: "#b21807",
    true_red: "#8f1d21",
    tulip: "#ff878d",
    tuscan_red: "#7c4848",
    tuscany: "#c09999",
    ue_red: "#ba0001",
    up_maroon: "#7b1113",
    upsdell_red: "#ae2029",
    venetian_red: "#c80815",
    verizon_red: "#ec1c24",
    verizon_red1: "#cd040b",
    vermilion: "#d9381e",
    vivaldi_red: "#ef3939",
    vivid_auburn: "#922724",
    vivid_red: "#f70d1a",
    washed_out_crimson: "#ffb3a7",
    water_persimmon: "#b56c60",
    wenge: "#645452",
    wilted_brown: "#ab4c3d",
    wisteria_and_burnt_bamboo: "#4d3b3c"
  },
  yellow: {
    antique_bronze: "#665d1e",
    aureolin: "#fdee00",
    baby_powder: "#fefefa",
    banana_yellow: "#ffe135",
    battleship_grey: "#848482",
    beige: "#f5f5dc",
    beige_grey: "#dfcfbe",
    brass: "#b5a642",
    bright_yellow: "#fccc1a",
    bronze_yellow: "#737000",
    buttercup_yellow: "#fff620",
    cadmium_yellow: "#fff600",
    canary: "#ffff99",
    canary_yellow: "#ffef00",
    caramel: "#c68e17",
    citrine: "#e4d00a",
    conditioner: "#ffffcc",
    corn: "#fbec5d",
    cream: "#fffdd0",
    daffodil: "#ffff31",
    dandelion: "#f0e130",
    dark_yellow: "#9b870c",
    darkkhaki: "#bdb76b",
    dirty_white: "#e8e4c9",
    dodie_yellow: "#fef65b",
    electric_yellow: "#ffff33",
    flavescent: "#f7e98e",
    golden_yellow: "#ffdf00",
    green_yellow_crayola: "#f0e891",
    greenfinch: "#bda928",
    heart_gold: "#808000",
    icterine: "#fcf75e",
    ivory: "#fffff0",
    laser_lemon: "#ffff66",
    lemon: "#fff700",
    lemon_glacier: "#fdff00",
    lemon_yellow: "#fff44f",
    lemon_yellow_crayola: "#ffff9f",
    lemonchiffon: "#fffacd",
    light_khaki: "#f0e68c",
    lightgoldenrodyellow: "#fafad2",
    lightyellow: "#ffffe0",
    margarine: "#f2d930",
    maximum_yellow: "#fafa37",
    middle_yellow: "#ffeb00",
    minion_yellow: "#f5e050",
    misty_moss: "#bbb477",
    moccasin: "#ffe4b5",
    mustard_green: "#6e6e30",
    old_moss_green: "#867e36",
    olive_green: "#b5b35c",
    pale_spring_bud: "#ecebbd",
    pale_tan: "#d2c29d",
    palegoldenrod: "#eee8aa",
    pastel_gray: "#cfcfc4",
    pastel_yellow: "#fdfd96",
    peridot: "#e6e200",
    pomelo_olive: "#bfbd70",
    safety_yellow: "#eed202",
    sage: "#bcb88a",
    sandstorm: "#ecd540",
    sizzling_sunrise: "#ffdb00",
    sooty_willow_bamboo: "#4d4b3a",
    spanish_bistre: "#807532",
    sponge: "#fdfe03",
    sprint_yellow: "#ffdd05",
    straw: "#e4d96f",
    sunny: "#f2f27a",
    sunshine_yellow: "#ffe119",
    titanium_yellow: "#eee600",
    underside_of_willow_leaves: "#bcb58c",
    very_pale_yellow: "#ffffbf",
    vivid_yellow: "#ffe302",
    yellow: "#ffff00",
    yellow_munsell: "#efcc00",
    yellow_pantone: "#fedf00",
    yellow_rose: "#fff000",
    yellow_ryb: "#fefe33"
  },
  yellowgreen: {
    acid_green: "#b0bf1a",
    apple_green: "#afff45",
    arctic_lime: "#d0ff14",
    army_green: "#4b5320",
    artichoke: "#8f9779",
    avocado: "#568203",
    bitter_lemon: "#cae00d",
    bitter_lime: "#bfff00",
    black_olive: "#3b3c36",
    blue_black_crayfish: "#52593b",
    bored_accent_green: "#dde26a",
    calamansi: "#fcffa4",
    chartreuse: "#7fff00",
    chartreuse_traditional: "#dfff00",
    chinese_green: "#d0db61",
    citron: "#9fa91f",
    dark_lemon_lime: "#8bbe1b",
    dark_moss_green: "#4a5d23",
    dark_olive: "#283618",
    dark_olive_green: "#666633",
    deep_apple_green: "#8db600",
    electric_lime: "#ccff00",
    gin: "#d8e4bc",
    guacamole: "#88b04b",
    june_bud: "#bdda57",
    key_lime: "#e8f48c",
    lawn_green: "#58a813",
    lemon_lime: "#e3ff00",
    light_chartreuse: "#99ff33",
    light_lime: "#99ff66",
    light_lime_green: "#ccff33",
    light_olive_green: "#90be6d",
    lime: "#99cc00",
    lime_green: "#b2d732",
    lime_pulp: "#d1e189",
    limerick: "#9dc209",
    margarita: "#b0c24a",
    maximum_green_yellow: "#d9e650",
    medium_spring_bud: "#c9dc87",
    microsoft_green: "#7db700",
    middle_green_yellow: "#acbf60",
    military_green: "#5a7247",
    milk: "#fdfff5",
    mindaro: "#e3f988",
    moss_green: "#8a9a5b",
    neon_yellow: "#efff04", //"#ffff33",
    old_bamboo: "#5e644f",
    khaki: "#8d9440",
    olive_drab: "#669900",
    olivedrab: "#6b8e23",
    pale_olive: "#999966",
    pale_spring: "#e2f0cb",
    pale_yellow_green: "#ccff66",
    pear: "#d1e231",
    pine_needle: "#454d32",
    pomelo: "#96a53c",
    pomelo_white: "#f9ffe3",
    rusty_celadon: "#898a74",
    sage_green: "#a4b086",
    sheen_green: "#8fd400",
    siskin_sprout_yellow: "#7a942e",
    soldier_green: "#545a2c",
    spring_bud: "#a7fc00",
    spring_leaf: "#66ff33",
    storeroom_brown: "#3d4035",
    very_light_green: "#ccff99",
    vivid_lime_green: "#a6d608",
    volt: "#ceff00",
    watermelon_yellow: "#eeff1b",
    willow_dye: "#8c9e5e",
    yellow_green_crayola: "#c5e384",
    yellowgreen: "#9acd32"
  },
  childrenRoomColors: {
    child_banana: "#FDDB3A",
    child_dark_purple: "#966FD6",
    child_gold: "#FFD700",
    child_gray: "#CFCFC4",
    child_green: "#03C03C",
    child_lilac: "#B39EB5",
    child_melon: "#FDBCB4",
    child_mint: "#B5EAD7",
    child_orange: "#FFB347",
    child_paleblue: "#AEC6CF",
    child_palegreen: "#77DD77",
    child_palepink: "#F49AC2",
    child_palered: "#DEA5A4",
    child_periwinkle: "#C7CEEA",
    child_pink: "#FFB7B2",
    child_purple: "#A23BEC",
    child_red: "#C23B22",
    child_salmon: "#FF6961",
    child_sky: "#77B5FE",
    child_sky_blue: "#87CEFA",
    child_slate_blue: "#779ECB",
    child_violet: "#CB99C9",
    child_yellow: "#FDFD96",
    greentea: "#E2F0CB",
    soft_coral: "#FF9AA2",
    peach_crayola: "#FFDAC1",
    bright_gold: "#FFD700",
    light_slate_blue: "#836FFF",
    piggy_pink: "#FFD1DC",
  },
  deepRichColors: {
    burgundy_velvet: "#450920",
    charcoal_blue: "#2B2D42",
    dark_burgundy: "#540B0E",
    dark_walnut: "#423629",
    deep_black: "#101820",
    deep_charleston_green: "#264653",
    deep_indigo: "#3C1874",
    deep_onyx: "#353535",
    deep_rich_purple: "#10002B",
    deep_royal_purple: "#462255",
    deep_russian_violet: "#240046",
    deepviolet: "#6622CC",
    hunter_green: "#283618",
    teal_deep: "#004346",
    midnight_blue: "#1B263B",
    blue_black: "#0B132B",
    deep_sea_blue: "#08415C",
    claret_red: "#650D1B",
    deep_cyan: "#005F73",
    eclipse: "#1A1423",
    independence_blue: "#4A4E69",
    red_oxide: "#6A040F",
    blackcurrant: "#230C33",
    vivid_blue_violet: "#3A0CA3",
  },
  modernColors: {
    brass_yellow: "#83781B",
    deep_aqua: "#009B77",
    deep_brown: "#5E3D26",
    earthy_gold: "#D2C29D",
    fiery_red: "#DD4124",
    leafy_green: "#88B04B",
    majestic_purple: "#5B5EA6",
    modern_blue: "#45B8AC",
    modern_bright_pink: "#D65076",
    modern_coral: "#F4B9B8",
    modern_cyan: "#7FCDCD",
    modern_deep_pink: "#C3447A",
    modern_green: "#5A7247",
    modern_light_blue: "#98B4D4",
    modern_mint: "#E1EDE9",
    modern_olive: "#8D9440",
    modern_orange: "#E15D44",
    modern_pink: "#F7CAC9",
    modern_purple: "#774D8E",
    modern_red: "#9B2335",
    modern_seagreen: "#A4B086",
    modern_yellow: "#FFD662",
    muted_lilac: "#B565A7",
    neutral_beige: "#DFCFBE",
    off_white: "#F2E2E0",
    powerful_red: "#BC243C",
    smoky_blue: "#6E81A0",
    soft_blue: "#92A8D1",
    soft_red: "#FF968A",
    soft_turquoise: "#55B4B0",
    subdued_purple: "#6B5B95",
    sunny_yellow: "#EFC050",
    vibrant_coral: "#FF6F61",
    warm_terra_cotta: "#955251",
  },
  playerColors: {
    pl_red: '#D01013',
    pl_blue: '#003399',
    pl_green: '#58A813',
    pl_orange: '#FF6600',
    pl_yellow: '#FAD302',
    pl_violet: '#55038C',
    pl_pink: '#ED527A',
    pl_beige: '#D99559',
    pl_sky: '#049DD9',
    pl_brown: '#A65F46',
    pl_white: '#FFFFFF',
  },
  vibrantColors: {
    bright_cyan: "#00F5D4",
    bright_red: "#FF4057",
    byzantine_purple: "#7209B7",
    neon_pink: "#FF006E",
    pistachio_green: "#90BE6D",
    strong_carmine: "#E71D36",
    tango_orange: "#FB5607",
    vermilion_red: "#F94144",
    vibrant_blue: "#118AB2",
    vibrant_blue_yonder: "#577590",
    vibrant_bright_yellow: "#FFD32D",
    vibrant_cobalt: "#26547C",
    vibrant_dark_cyan: "#073B4C",
    vibrant_electric_yellow: "#FEE440",
    vibrant_green: "#06D6A0",
    vibrant_lavender: "#9B5DE5",
    vibrant_lemon: "#FFBE0B",
    vibrant_light_magenta: "#F15BB5",
    vibrant_magenta: "#FF006E",
    vibrant_mint_green: "#48BF84",
    vibrant_orange: "#FF9F1C",
    vibrant_orange_red: "#F3722C",
    vibrant_orangered: "#F46036",
    vibrant_pink: "#EF476F",
    vibrant_purple: "#8338EC",
    vibrant_sunny_yellow: "#FFD166",
    vivid_teal: "#00B8A9",
    vibrant_turquoise: "#2EC4B6",
    vibrant_sky_blue: "#00BBF9",
    vivid_blue: "#3A86FF",
  }
};
