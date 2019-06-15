'use strict';

const EscapeSequences = require('xterm/lib/common/data/EscapeSequences');

const BACKSPACE = 8;
const PAGE_UP = 33;
const PAGE_DOWN = 34;
const END = 35;
const HOME = 36;
const INSERT = 45;
const DEL = 46;
const F1 = 112;
const F2 = 113;
const F3 = 114;
const F4 = 115;
const F5 = 116;
const F6 = 117;
const F7 = 118;
const F8 = 119;
const F9 = 120;
const F10 = 121;
const F11 = 122;
const F12 = 123;

/*
VT100+ Character and Key Extensions

Character or key  | Character sequence
---------------------------------------
HOME key          | <ESC>h
END key           | <ESC>k
INSERT key        | <ESC>+
DELETE key        | <ESC>-
PAGE UP key       | <ESC>?
PAGE DOWN key     | <ESC>/
F1 key            | <ESC>1
F2 key            | <ESC>2
F3 key            | <ESC>3
F4 key            | <ESC>4
F5 key            | <ESC>5
F6 key            | <ESC>6
F7 key            | <ESC>7
F8 key            | <ESC>8
F9 key            | <ESC>9
F10 key           | <ESC>0
F11 key           | <ESC>!
F12 key           | <ESC>@

*/

function customVT100PlusKey(ev, term) {
  const modifiers =
    (ev.shiftKey ? 1 : 0) |
    (ev.altKey ? 2 : 0) |
    (ev.ctrlKey ? 4 : 0) |
    (ev.metaKey ? 8 : 0);
  if ((modifiers && ev.keyCode != BACKSPACE) || ev.type != 'keydown') {
    return true;
  }
  switch (ev.keyCode) {
    case BACKSPACE:
      if (ev.altKey) {
        return true;
      } else if (!ev.shiftKey) {
        term.handler(EscapeSequences.C0.BS); // Backspace
      } else {
        term.handler(EscapeSequences.C0.DEL); // Delete
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
      term.handler(EscapeSequences.C0.ESC + '1');
      break;
    case F2:
      term.handler(EscapeSequences.C0.ESC + '2');
      break;
    case F3:
      term.handler(EscapeSequences.C0.ESC + '3');
      break;
    case F4:
      term.handler(EscapeSequences.C0.ESC + '4');
      break;
    case F5:
      term.handler(EscapeSequences.C0.ESC + '5');
      break;
    case F6:
      term.handler(EscapeSequences.C0.ESC + '6');
      break;
    case F7:
      term.handler(EscapeSequences.C0.ESC + '7');
      break;
    case F8:
      term.handler(EscapeSequences.C0.ESC + '8');
      break;
    case F9:
      term.handler(EscapeSequences.C0.ESC + '9');
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
