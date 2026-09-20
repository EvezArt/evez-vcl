# EVEZ Runtime Bus

This is the canonical routing contract for EVEZ web/runtime surfaces.

## Canonical endpoints
| Role | URL |
|---|---|
| EVEZ VCL Runtime source | https://github.com/EvezArt/evez-vcl |
| VCL browser runtime | https://github.com/EvezArt/evez-vcl/blob/main/demos/evez-chatgpt-runtime.html |
| VCL core production | https://evez-vcl-core-8123c7mc0-evezx.vercel.app |
| EVEZ-OS Vercel surface | https://evez-fh8dnmlf8-evezx.vercel.app |
| EVEZ-Claw Vercel surface | https://evez-claw-3gvtxb5cj-evezx.vercel.app |
| AGI pipeline Vercel surface | https://evez-agi-pipeline-v3-i5beclljo-evezx.vercel.app |

## Bus envelope
Use a JSON object with bus, source, target, kind, id, ts, trace, and payload fields.

## Rules
1. URLs are routing identifiers, not proof of health.
2. Health is established by an actual request and recorded separately.
3. Never treat a READY deployment as proof that every route works.
4. Every cross-platform invocation should carry a correlation ID.
5. Secrets never travel through the URL bus.
6. The browser runtime remains usable when the backend is unavailable.
7. Providers may change. Logical role names remain stable.

## Health probe convention
Where a service exposes health, use /health first. If unavailable, probe / and record the HTTP result as unknown-route rather than inventing a health response.

## Current verified state
As of 2026-09-20, the connected Vercel projects inspected for VCL Core, EVEZ-OS, OpenClaw, EVEZ-Claw and the AGI pipeline reported no grouped runtime errors in the previous seven days.

Historical GitHub Actions failures remain separate. The EVEZ-OS Bitbucket mirror workflow is currently failing and requires valid Bitbucket credentials/configuration that are not available through the connected GitHub write surface.

This contract deliberately separates deployment state, runtime health, and external backup health.