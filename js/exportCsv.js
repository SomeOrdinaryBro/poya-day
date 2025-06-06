export function exportCSV(country, year, fetchData) {
  fetchData(year, country).then(days => {
    const out = ['Month,Date,Day,Holiday'];
    days.forEach(h => {
      const dt = new Date(h.date);
      const monthName = dt.toLocaleString('default', { month: 'long' });
      out.push(`${monthName},${dt.toLocaleDateString()},${dt.toLocaleString('default',{weekday:'short'})},"${h.name}"`);
    });
    const blob = new Blob([out.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `holidays_${country}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
