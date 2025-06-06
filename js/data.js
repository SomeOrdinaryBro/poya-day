export async function fetchData(year, country) {
  const cache = fetchData._cache || (fetchData._cache = {});
  const cacheKey = `${country}-${year}`;
  if (cache[cacheKey]) return cache[cacheKey];

  let raw = [];
  try {
    if (country === 'SL') {
      const res = await fetch(
        `https://raw.githubusercontent.com/Dilshan-H/srilanka-holidays/main/json/${year}.json`
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      raw = data
        .filter(h => /Poya/i.test(h.summary))
        .map(h => ({ date: h.start, name: h.summary }));

    } else if (country === 'CA') {
      if (year !== 2025) {
        alert('Canadian holidays available for 2025 only');
        raw = [];
      } else {
        const res = await fetch('assets/ca-holidays-2025.json');
        if (!res.ok) throw new Error('Network response was not ok');
        raw = await res.json();
      }

    } else if (country === 'US') {
      if (year !== 2025) {
        alert('US holidays available for 2025 only');
        raw = [];
      } else {
        const res = await fetch('assets/us-holidays-2025.json');
        if (!res.ok) throw new Error('Network response was not ok');
        raw = await res.json();
      }

    } else if (country === 'AU') {
      if (year !== 2025) {
        alert('Australian holidays available for 2025 only');
        raw = [];
      } else {
        const res = await fetch('assets/au-holidays-2025.json');
        if (!res.ok) throw new Error('Network response was not ok');
        raw = await res.json();
      }

    } else if (country === 'GB') {
      const res = await fetch('assets/gb-bank-holidays-2025-27.json');
      if (!res.ok) throw new Error('Network response was not ok');
      raw = await res.json();
    }
  } catch (err) {
    console.error(err);
    alert('Failed to fetch holiday data. Please try again later.');
  }

  cache[cacheKey] = raw;
  return raw;
}
