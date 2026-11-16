## Umiji Frontend

The web panel of [Umiji](https://github.com/therewasluna/umiji): the owner dashboard and the brokers' panel, in English
and Persian (Russian and Chinese are partly translated).

```bash
cp .env.sample .env   # DOMAIN_BACKEND points at a local API on :3003
npm ci
npm run start:dev     # http://127.0.0.1:3333
```

The panel image, `ghcr.io/therewasluna/umiji-panel`, is built by GitHub Actions in
[umiji-backend](https://github.com/therewasluna/umiji-backend), which builds this frontend's `main` into it. After a
frontend-only change, run its **Panel image** workflow by hand. To build the image locally, see `tools/build-image.sh`
there.

## License

AGPL-3.0, see [LICENCE](LICENCE). Umiji is a modified version of Remnawave.
