const countrySelect = document.getElementById("countrySelect");
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const calendarBtn = document.getElementById("calendarViewBtn");
const listBtn = document.getElementById("holidayViewBtn");
const allBtn = document.getElementById("allViewBtn");
const exportBtn = document.getElementById("exportCsvBtn");
const calContainer = document.getElementById("calendarContainer");
const listContainer = document.getElementById("holidayTableContainer");

let cache = {}, view = "calendar", all = false;

async function fetchData(year) {
  const country = countrySelect.value;
  const cacheKey = `${country}-${year}`;
  if (cache[cacheKey]) return cache[cacheKey];

  let raw;
  if (country === "SL") {
    raw = await fetch(
      `https://raw.githubusercontent.com/Dilshan-H/srilanka-holidays/main/json/${year}.json`
    ).then(r => r.json());
    raw = raw
      .filter(h => /Poya/i.test(h.summary))
      .map(h => ({ date: h.start, name: h.summary }));
  } else {
    raw = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
    ).then(r => r.json());
    raw = raw.map(h => ({ date: h.date, name: h.localName }));
  }
  return (cache[cacheKey] = raw);
}

function createCalendar(m, y, days) {
  const first = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  let d = 1, cells = "";
  for (let i = 0; i < 42; i++) {
    const day = (i >= first && d <= total) ? d++ : "";
    const id = day
      ? `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
      : null;
    const hol = day && days.find(x => x.date === id);
    cells += `
      <div class="relative bg-gray-800 p-2 h-16 flex flex-col items-center justify-center text-sm ${
        hol ? "before:absolute before:inset-0 before:bg-yellow-600 before:bg-opacity-75 before:rounded-lg" : ""
      }">
        <span class="${hol ? "relative text-white font-semibold" : ""}">${day}</span>
        ${hol ? `<span class="relative text-2xs mt-1 text-white">${hol.name}</span>` : ""}
      </div>`;
  }
  const hdr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    .map(d => `<div class="bg-gray-800 p-2 text-center text-xs font-semibold text-gray-400">${d}</div>`)
    .join("");
  return `<div class="grid grid-cols-7 gap-px bg-gray-700 rounded-lg overflow-hidden">${hdr}${cells}</div>`;
}

function createList(days) {
  // Build rows with an extra Month column
  const rows = days.map(h => {
    const dt = new Date(h.date);
    const monthName = dt.toLocaleString("default", { month: "long" });
    return `
      <tr class="odd:bg-gray-800 even:bg-gray-700 hover:bg-gray-600">
        <td class="px-3 py-2 text-sm">${monthName}</td>
        <td class="px-3 py-2 text-sm">${dt.toLocaleDateString()}</td>
        <td class="px-3 py-2 text-sm">${dt.toLocaleString("default",{ weekday:"short" })}</td>
        <td class="px-3 py-2 text-sm">${h.name}</td>
      </tr>`;
  }).join("");

  // Prepend a header row with the new Month column
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

async function render() {
  const y = +yearSelect.value, m = +monthSelect.value;
  const days = await fetchData(y);
  calContainer.innerHTML = "";
  listContainer.innerHTML = "";

  if (all) {
    if (view === "list") {
      listContainer.innerHTML = createList(days);
      listContainer.classList.remove("hidden");
    } else {
      for (let i = 0; i < 12; i++) {
        calContainer.innerHTML += `
          <h2 class="mt-4 mb-2 text-xl font-medium">
            ${new Date(0,i).toLocaleString("default",{month:"long"})} ${y}
          </h2>` + createCalendar(i, y, days);
      }
    }
  } else {
    if (view === "list") {
      const filtered = days.filter(h => new Date(h.date).getMonth() === m);
      listContainer.innerHTML = createList(filtered);
      listContainer.classList.remove("hidden");
    } else {
      calContainer.innerHTML = createCalendar(m, y, days);
    }
  }
}

function updateButtons() {
  [calendarBtn, listBtn, allBtn].forEach(b => {
    b.classList.replace("bg-yellow-500","bg-gray-700");
    b.classList.replace("text-gray-900","text-gray-200");
  });
  const active = all
    ? allBtn
    : (view === "calendar" ? calendarBtn : listBtn);
  active.classList.replace("bg-gray-700","bg-yellow-500");
  active.classList.replace("text-gray-200","text-gray-900");
}

function toggleView(v, isAll = false) {
  view = v; all = isAll;
  updateButtons(); render();
}

function exportCSV() {
  const y = +yearSelect.value;
  fetchData(y).then(days => {
    const out = ["Date,Day,Holiday"];
    days.forEach(h => {
      const dt = new Date(h.date);
      out.push(
        `${dt.toLocaleDateString()},` +
        `${dt.toLocaleString("default",{weekday:"short"})}` +
        `,"${h.name}"`
      );
    });
    const blob = new Blob([out.join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `holidays_${countrySelect.value}_${y}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

async function addJsonLdEvents(year) {
  const days = await fetchData(year);
  const events = days.map(h => ({
    "@type":"Event",
    name:h.name,
    startDate:h.date,
    eventAttendanceMode:"https://schema.org/OfflineEventAttendanceMode",
    eventStatus:"https://schema.org/EventScheduled",
    location:{
      "@type":"Place",
      name: countrySelect.value==="SL"?
        "Sri Lanka":countrySelect.value==="US"?
        "United States":"Australia"
    }
  }));
  const tag=document.createElement("script");
  tag.type="application/ld+json";
  tag.text=JSON.stringify({"@context":"https://schema.org","@graph":events},null,2);
  document.head.appendChild(tag);
}

function init() {
  const y=new Date().getFullYear();
  for(let i=y-1;i<=y+1;i++) yearSelect.add(new Option(i,i));
  for(let m=0;m<12;m++) monthSelect.add(
    new Option(new Date(0,m).toLocaleString("default",{month:"long"}), m)
  );
  yearSelect.value=y;
  monthSelect.value=new Date().getMonth();

  [countrySelect,yearSelect,monthSelect].forEach(el=>
    el.addEventListener("change",()=>{
      cache={}; render(); addJsonLdEvents(+yearSelect.value);
    })
  );
  calendarBtn.addEventListener("click",()=>toggleView("calendar"));
  listBtn.addEventListener("click",()=>toggleView("list"));
  allBtn.addEventListener("click",()=>toggleView(view,true));
  exportBtn.addEventListener("click",exportCSV);

  updateButtons(); render(); addJsonLdEvents(y);
}

init();
