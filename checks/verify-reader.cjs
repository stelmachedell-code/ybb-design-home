const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/assets/work-viewer.js', 'utf8');
const begin = source.indexOf("content.addEventListener('click'");
const end = source.indexOf('  function switchWork', begin);
let handler, zoomed = false;
const images = [{}, {}, {}];
const button = {setAttribute(k, v) { this[k] = v; }};
const anchor = {getBoundingClientRect: () => ({top: 100})};
const scroll = {clientWidth: 390, scrollLeft: 0, scrollTop: 200};
const content = {
  addEventListener(type, fn) { handler = fn; },
  classList: {toggle() { return zoomed = !zoomed; }},
  querySelector: q => q === '.work-zoom' ? button : anchor,
  querySelectorAll: () => images
};
vm.runInNewContext(source.slice(begin, end), {content, scroll, touch:{matches:true}, innerWidth:390, requestAnimationFrame:fn=>fn()});
const event = {target:{closest:q => q === '.work-zoom' ? button : null}};
handler(event);
assert.ok(zoomed);
assert.ok(images.every(img=>img.sizes==='780px'));
assert.equal(button['aria-pressed'], 'true');
assert.equal(scroll.scrollLeft, 195);
handler(event);
assert.equal(zoomed, false);
assert.ok(images.every(img=>img.sizes==='390px'));
assert.equal(scroll.scrollLeft, 0);
assert.equal(scroll.scrollTop, 200);
console.log('PASS: whole-work zoom, all image sizes, button state and scroll restoration');
