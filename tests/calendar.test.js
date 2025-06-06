const { JSDOM } = require('jsdom');
const { createCalendar } = require('../script.js');

test('createCalendar returns grid with 42 day cells', () => {
  const html = createCalendar(0, 2025, []);
  const dom = new JSDOM(html);
  const dayCells = dom.window.document.querySelectorAll('div.relative');
  expect(dayCells.length).toBe(42);
});
