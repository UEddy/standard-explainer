/* Regenerates the question bank section of CONTENT.md from js/quiz.js.
   Generation is ONE WAY. js/quiz.js is the source; CONTENT.md is output.
   Editing the bank in CONTENT.md does nothing and is overwritten by the next
   run of this script.

   Usage:  node tools/bank-to-content.js
*/
'use strict';
const fs = require('fs');

const START = '<!-- BEGIN GENERATED BANK -->';
const END   = '<!-- END GENERATED BANK -->';

function readBank(){
  const src = fs.readFileSync('js/quiz.js', 'utf8');
  const at = src.indexOf('var BANK = {');
  if(at < 0) throw new Error('could not find BANK in js/quiz.js');
  const open = src.indexOf('{', at);
  let depth = 0, i = open;
  for(; i < src.length; i++){
    if(src[i] === '{') depth++;
    else if(src[i] === '}'){ depth--; if(depth === 0){ i++; break; } }
  }
  return eval('(' + src.slice(open, i) + ')');
}

const SLOTS = [
  ['a', 'Slot 1: the locked money (scene 10)'],
  ['b', 'Slot 2: the delay (scene 11)'],
  ['c', 'Slot 3: the overhang (scene 12)']
];

const bank = readBank();
const pos = [0, 0, 0, 0];
let out = '';

for(const [key, title] of SLOTS){
  out += '### ' + title + '\n\n';
  bank[key].forEach(function(v, n){
    pos[v.c]++;
    out += '**' + key.toUpperCase() + (n + 1) + '.** ' + v.q + '\n\n';
    v.o.forEach(function(t, j){ out += '- ' + (j === v.c ? '**(correct)** ' : '') + t + '\n'; });
    out += '\n*Why:* ' + v.why + '\n\n';
  });
}
out += 'Authored position of the correct answer across the bank: ' + pos.join(' / ') +
       ' for positions 1, 2, 3 and 4. Options are shuffled again at run time, so this is the floor rather than what any reader sees.\n';

const content = fs.readFileSync('CONTENT.md', 'utf8');
const a = content.indexOf(START), b = content.indexOf(END);
if(a < 0 || b < 0) throw new Error('markers missing from CONTENT.md');
fs.writeFileSync('CONTENT.md',
  content.slice(0, a + START.length) + '\n\n' + out + '\n' + content.slice(b), 'utf8');

const total = Object.values(bank).reduce(function(n, list){ return n + list.length; }, 0);
console.log('wrote ' + total + ' questions, authored positions ' + pos.join('/'));
