const WHOP = "https://api.whop.com/api/v1";
const HEADERS = () => ({
  Authorization: "Bearer " + process.env.WHOP_API_KEY,
  "Content-Type": "application/json",
  "Api-Version-Date": "2026-08-21-1",
});

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function whop(path, opts) {
  const res = await fetch(WHOP + path, {
    ...opts,
    headers: { ...HEADERS(), ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = (json.error && json.error.message) || text || res.status;
    throw new Error(msg);
  }
  return json;
}

async function uploadFile(buffer, filename, mime) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mime }), filename);
  const res = await fetch(WHOP + "/files", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.WHOP_API_KEY,
      "Api-Version-Date": "2026-08-21-1",
    },
    body: form,
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method === "GET") {
    res.status(200).json({
      connected: Boolean(process.env.WHOP_API_KEY),
      publishReady: Boolean(process.env.WHOP_API_KEY && process.env.PUBLISH_SECRET),
    });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  if (!process.env.WHOP_API_KEY) {
    res.status(503).json({
      error:
        "Whop is not connected yet. Create an Account API key at whop.com/dashboard → Developer → Account API Keys, then add WHOP_API_KEY in Vercel.",
    });
    return;
  }
  if (!process.env.PUBLISH_SECRET || req.headers["x-admin-secret"] !== process.env.PUBLISH_SECRET) {
    res.status(401).json({ error: "Admin secret required to publish." });
    return;
  }

  try {
    const body = await readBody(req);
    const title = String(body.title || "").trim().slice(0, 80);
    const price = Number(body.price);
    if (!title || !price || price <= 0) {
      res.status(400).json({ error: "Title and a price above 0 are required." });
      return;
    }
    const headline = String(body.headline || title).trim().slice(0, 140);
    const description = String(body.description || body.body || "").trim();
    const accountId = process.env.WHOP_COMPANY_ID || "biz_OXpbrvD7qkRVHf";
    const product = await whop("/products", {
      method: "POST",
      body: JSON.stringify({
        account_id: accountId,
        title,
        headline,
        description,
        visibility: "visible",
        route: slugify(title) || undefined,
        plan_options: {
          plan_type: "one_time",
          initial_price: price,
          base_currency: "usd",
          visibility: "visible",
          release_method: "buy_now",
        },
      }),
    });
    const route = product.route || slugify(title);
    const attach = [];

    async function tryUpload(b64, filename, mime) {
      if (!b64) return;
      const buf = Buffer.from(String(b64), "base64");
      const up = await uploadFile(buf, filename, mime);
      attach.push({ filename, upload: up.status, id: up.json && up.json.id, error: up.ok ? undefined : up.json });
      const fid = up.json && up.json.id;
      if (!fid) return;
      for (const expId of ["exp_SkdXIiqKpTTUhJ", "exp_fMIgnszTZVrcd8"]) {
        try {
          const post = await fetch(WHOP + "/forum_posts", {
            method: "POST",
            headers: HEADERS(),
            body: JSON.stringify({
              experience_id: "exp_u87t3zg7ToEpNZ",
              content: filename + " attached for " + title,
              attachments: [{ id: fid }],
            }),
          });
          const t = await post.text();
          attach.push({ forum: post.status, body: t.slice(0, 240) });
          break;
        } catch (e) {
          attach.push({ forumError: String(e.message || e) });
        }
      }
    }

    await tryUpload(
      body.fileBase64,
      body.fileName || slugify(title) + ".docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    await tryUpload(body.coverBase64, "cover.jpg", "image/jpeg");

    res.status(200).json({
      ok: true,
      productId: product.id,
      title: product.title,
      url: "https://whop.com/upskill-hub/products/" + route + "/",
      attach,
      note: "Listing is live on Whop. If attach is empty, drop the ebook into the product Files app in the Whop dashboard.",
    });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
