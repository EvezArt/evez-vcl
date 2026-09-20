# EVEZ Runtime Demo

This directory contains browser-runnable EVEZ runtime artifacts.

## ChatGPT Runtime

Open `evez-chatgpt-runtime.html` directly in a modern browser. It is dependency-free and runs locally.

The runtime records a local append-only event chain using Web Crypto SHA-256. It does not claim to call an external model.

## Local HTTP

From the repository root:

```bash
python3 -m http.server 8787
```

Then open:

```
http://127.0.0.1:8787/demos/evez-chatgpt-runtime.html
```

## Android / Termux

```bash
pkg install python -y
cd ~/evez-vcl
python3 -m http.server 8787 --bind 0.0.0.0
```

The browser runtime remains usable without the HTTP server; the server is only useful when browser security or installable-PWA behavior benefits from localhost.
