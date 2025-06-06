# poya-calendar
Interactive, responsive holiday calendar supporting Sri Lanka, the US, Australia, Canada and the UK.

## Running Locally

Just open `index.html` in a modern browser. A small ES module setup is used, so a local server is recommended:

```bash
npx serve -s .
```

## Development

Run ESLint to check the JavaScript modules:

```bash
npx eslint js/*.js
```

## Data Sources

- Sri Lankan holidays from [Dilshan-H/srilanka-holidays](https://github.com/Dilshan-H/srilanka-holidays)
- Local JSON files for Canada, the US, Australia and the UK are included in the `assets` folder

