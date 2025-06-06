export function createCalendar(m, y, days) {
  const first = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  let d = 1, cells = '';
  for (let i = 0; i < 42; i++) {
    const day = (i >= first && d <= total) ? d++ : '';
    const id = day
      ? `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : null;
    const hol = day && days.find(x => x.date === id);
    cells += `
      <div class="relative bg-gray-800 p-2 h-16 flex flex-col items-center justify-center text-sm ${
        hol ? 'before:absolute before:inset-0 before:bg-yellow-600 before:bg-opacity-75 before:rounded-lg' : ''
      }">
        <span class="${hol ? 'relative text-white font-semibold' : ''}">${day}</span>
        ${hol ? `<span class="relative text-2xs mt-1 text-white">${hol.name}</span>` : ''}
      </div>`;
  }
  const hdr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    .map(d => `<div class="bg-gray-800 p-2 text-center text-xs font-semibold text-gray-400">${d}</div>`)
    .join("");
  return `<div class="grid grid-cols-7 gap-px bg-gray-700 rounded-lg overflow-hidden">${hdr}${cells}</div>`;
}

export function createList(days) {
  const rows = days.map(h => {
    const dt = new Date(h.date);
    const monthName = dt.toLocaleString('default', { month: 'long' });
    return `
      <tr class="odd:bg-gray-800 even:bg-gray-700 hover:bg-gray-600">
        <td class="px-3 py-2 text-sm">${monthName}</td>
        <td class="px-3 py-2 text-sm">${dt.toLocaleDateString()}</td>
        <td class="px-3 py-2 text-sm">${dt.toLocaleString('default',{weekday:'short'})}</td>
        <td class="px-3 py-2 text-sm">${h.name}</td>
      </tr>`;
  }).join('');

  return `
    <table class="w-full rounded-lg shadow-lg overflow-hidden">
      <thead>
        <tr class="bg-gray-800">
          <th class="px-3 py-2 text-sm text-left">Month</th>
          <th class="px-3 py-2 text-sm text-left">Date</th>
          <th class="px-3 py-2 text-sm text-left">Day</th>
          <th class="px-3 py-2 text-sm text-left">Holiday</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

export function updateNextHoliday(days, el) {
  const today = new Date().toISOString().slice(0,10);
  const sorted = [...days].sort((a,b) => a.date.localeCompare(b.date));
  const next = sorted.find(h => h.date >= today);
  if (!next) {
    el.textContent = 'None left this year';
  } else {
    const dt = new Date(next.date);
    el.textContent = `${dt.toLocaleDateString()} – ${next.name}`;
  }
}
