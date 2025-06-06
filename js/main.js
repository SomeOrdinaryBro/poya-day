import { fetchData } from './data.js';
import { createCalendar, createList, updateNextHoliday } from './renderer.js';
import { exportCSV } from './exportCsv.js';

const countrySelect = document.getElementById('countrySelect');
const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const calendarBtn = document.getElementById('calendarViewBtn');
const listBtn = document.getElementById('holidayViewBtn');
const allBtn = document.getElementById('allViewBtn');
const exportBtn = document.getElementById('exportCsvBtn');
const calContainer = document.getElementById('calendarContainer');
const listContainer = document.getElementById('holidayTableContainer');
const nextHolidayEl = document.getElementById('nextHolidayText');
const nextContainer = document.getElementById('nextHolidayContainer');
const themeToggle = document.getElementById('themeToggle');

let view = 'calendar', all = false;

function fadeIn(el) {
  el.classList.remove('hidden');
  el.classList.add('opacity-0');
  requestAnimationFrame(() => el.classList.remove('opacity-0'));
}

function hide(el) {
  el.classList.add('hidden');
}

async function render() {
  const y = +yearSelect.value, m = +monthSelect.value;
  const days = await fetchData(y, countrySelect.value);
  calContainer.innerHTML = '';
  listContainer.innerHTML = '';

  if (all) {
    listContainer.innerHTML = createList(days);
    fadeIn(listContainer);
    hide(calContainer);
  } else {
    if (view === 'list') {
      const filtered = days.filter(h => new Date(h.date).getMonth() === m);
      listContainer.innerHTML = createList(filtered);
      fadeIn(listContainer);
      hide(calContainer);
    } else {
      calContainer.innerHTML = createCalendar(m, y, days);
      fadeIn(calContainer);
      hide(listContainer);
    }
  }

  updateNextHoliday(days, nextHolidayEl);
  fadeIn(nextContainer);
}

function updateButtons() {
  [calendarBtn, listBtn, allBtn].forEach(b => {
    b.classList.replace('bg-yellow-500', 'bg-gray-700');
    b.classList.replace('text-gray-900', 'text-gray-200');
  });
  const active = all ? allBtn : (view === 'calendar' ? calendarBtn : listBtn);
  active.classList.replace('bg-gray-700', 'bg-yellow-500');
  active.classList.replace('text-gray-200', 'text-gray-900');
}

function toggleView(v, isAll = false) {
  view = v;
  all = isAll;
  updateButtons();
  render();
}

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefers);
}

function init() {
  initTheme();
  themeToggle.addEventListener('click', () =>
    applyTheme(!document.documentElement.classList.contains('dark')));

  const y = new Date().getFullYear();
  for (let i = y - 1; i <= y + 1; i++) yearSelect.add(new Option(i, i));
  for (let m = 0; m < 12; m++)
    monthSelect.add(new Option(new Date(0, m).toLocaleString('default', { month: 'long' }), m));
  yearSelect.value = y;
  monthSelect.value = new Date().getMonth();

  countrySelect.addEventListener('change', () => toggleView(view, false));
  yearSelect.addEventListener('change', () => toggleView(view, false));
  monthSelect.addEventListener('change', () => toggleView(view, false));

  calendarBtn.addEventListener('click', () => toggleView('calendar', false));
  listBtn.addEventListener('click', () => toggleView('list', false));
  allBtn.addEventListener('click', () => toggleView('list', true));
  exportBtn.addEventListener('click', () => exportCSV(countrySelect.value, +yearSelect.value, fetchData));

  updateButtons();
  render();
  addJsonLdEvents(y);
}

function addJsonLdEvents(year) {
  fetchData(year, countrySelect.value).then(days => {
    const events = days.map(h => ({
      '@type': 'Event',
      name: h.name,
      startDate: h.date,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: countrySelect.value === 'SL' ? 'Sri Lanka'
          : countrySelect.value === 'CA' ? 'Canada'
          : countrySelect.value === 'US' ? 'United States'
          : countrySelect.value === 'AU' ? 'Australia'
          : 'United Kingdom',
      }
    }));
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': events }, null, 2);
    document.head.appendChild(tag);
  });
}

init();
