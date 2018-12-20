'use strict';

var EscapeSequences = require('xterm/lib/common/data/EscapeSequences');

var BACKSPACE = 8;
var PAGE_UP = 33;
var PAGE_DOWN = 34;
var END = 35;
var HOME = 36;
var INSERT = 45;
var DEL = 46;
var F1 = 112;
var F2 = 113;
var F3 = 114;
var F4 = 115;
var F5 = 116;
var F6 = 117;
var F7 = 118;
var F8 = 119;
var F9 = 120;
var F10 = 121;
var F11 = 122;
var F12 = 123;

function customVT100PlusKey(ev, term) {
  var modifiers = (ev.shiftKey ? 1 : 0) | (ev.altKey ? 2 : 0) |
      (ev.ctrlKey ? 4 : 0) | (ev.metaKey ? 8 : 0);
  if (((modifiers) && (ev.keyCode != BACKSPACE)) || (ev.type != 'keydown')) {
    return true;
  }
  switch (ev.keyCode) {
    case BACKSPACE:
      if (ev.altKey) {
        return true;
      } else if (!ev.shiftKey) {
        term.handler(EscapeSequences.C0.BS);  // Backspace
      } else {
        term.handler(EscapeSequences.C0.DEL);  // Delete
      }
      break;
    case PAGE_UP:
      term.handler(EscapeSequences.C0.ESC + '?');
      break;
    case PAGE_DOWN:
      term.handler(EscapeSequences.C0.ESC + '/');
      break;
    case END:
      term.handler(EscapeSequences.C0.ESC + 'k');
      break;
    case HOME:
      term.handler(EscapeSequences.C0.ESC + 'h');
      break;
    case INSERT:
      term.handler(EscapeSequences.C0.ESC + '+');
      break;
    case DEL:
      term.handler(EscapeSequences.C0.ESC + '-');
      break;
    case F1:
    case F2:
    case F3:
    case F4:
    case F5:
    case F6:
    case F7:
    case F8:
    case F9:
      term.handler(EscapeSequences.C0.ESC + ((ev.keyCode - F1 + 1) + ''));
      break;
    case F10:
      term.handler(EscapeSequences.C0.ESC + '0');
      break;
    case F11:
      term.handler(EscapeSequences.C0.ESC + '!');
      break;
    case F12:
      term.handler(EscapeSequences.C0.ESC + '@');
      break;
    default:
      return true;
  }
  return false;
}
exports.customVT100PlusKey = customVT100PlusKey;
