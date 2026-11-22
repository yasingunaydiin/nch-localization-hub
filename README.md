# NCH Localization Hub

One page that puts your tools, to-do list, video tutorials, web page translations and program status in one place. Plain HTML, CSS and JavaScript. No build step.

## Run it

```
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080.

## Your data stays yours

- `data.example.js` holds generic starter content and is what everyone sees after cloning.
- `data.local.js` holds your own tools, tasks and notes. It is listed in `.gitignore`, so it is never committed or pushed.
- To use your own data, copy `data.example.js` to `data.local.js` and fill it in. If `data.local.js` exists the page uses it, otherwise it falls back to the example.

Changes you make with the on-page **Edit** buttons are saved in your browser (localStorage) only.
