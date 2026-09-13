# UpSkill Hub

Storefront for [whop.com/upskill-hub](https://whop.com/upskill-hub/). Digital playbooks with cart; checkout completes on Whop.

The catalog is **live**. `/api/products` reads your public Whop store every few minutes. New ebooks and products you publish there show on the site automatically.

Optional: add `WHOP_API_KEY` in the Vercel project env vars to use Whop’s official API instead of the public storefront.

## Local

```bash
python3 -m http.server 3000
```

Open http://localhost:3000 (falls back to the built-in list until `/api/products` is running).
