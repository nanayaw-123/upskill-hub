const STORE = "https://whop.com/upskill-hub";
const EXTRAS = {
  "the-disaster-survival-playbook": {
    id: "disaster",
    tag: "Readiness",
    skill: "Run a household through the first 72 hours of a disaster without improvising.",
    deliverable: "A completed hazard audit, 72-hour go-bag list, and evacuation contact sheet.",
    time: "Household setup in an afternoon.",
    notFor: "People looking for wilderness survival or conspiracy “prepper” content.",
    includes: [
      "Home hazard audit worksheet",
      "72-hour go-bag packing list",
      "Evacuation contact sheet",
      "Rules for fire, earthquake, flood, severe weather",
      "Shelter-in-place protocol",
    ],
  },
  "finding-light-in-the-dark-a1": {
    id: "light",
    tag: "Health",
    skill: "Name what is happening, run a crisis protocol, and take one next clinical step.",
    deliverable: "Completed worksheets plus a written crisis plan you can hand to a safe adult.",
    time: "Worksheets in one sitting; the plan stays with you.",
    notFor:
      "Anyone seeking how-tos for harm. This guide refuses that. It is not a substitute for 988, emergency services, or a licensed clinician.",
    caution:
      "If you want to die or hurt yourself, treat that as an emergency — 988 in the US — not a secret. Stay. Tell a human.",
    includes: [
      "Structured guide for youth, adults, and caregivers",
      "Worksheets for thought loops and next steps",
      "Crisis protocol and emergency resources",
      "Teen-specific signs (irritability, withdrawal)",
      "Faith-based resilience that does not replace medical care",
    ],
  },
  "send-smarter-5c": {
    id: "send",
    tag: "Finance",
    skill: "Cut remittance costs and route money into family assets — not fees.",
    deliverable: "A corridor cost sheet, scam-prevention scripts, and a 30-day transfer plan.",
    time: "Start the 30-day plan the day you download.",
    notFor: "People who never send money across borders.",
    includes: [
      "58-page playbook with step-by-step transfer methods",
      "Scam-prevention scripts to protect your family",
      "Cost comparison worksheets for every major corridor",
      "30-day implementation plan with daily checkpoints",
      "Ready-to-share templates for family conversations",
    ],
  },
  "the-tiny-appetite-protocol": {
    id: "appetite",
    tag: "Health",
    skill: "Keep nutrition and strength when medication flattens appetite.",
    deliverable: "A dose-week meal plan, symptom log, and doctor-conversation script.",
    time: "Use it on your next dose day.",
    notFor: "Anyone looking for a weight-loss hack or a substitute for clinical care.",
    includes: [
      "40-chapter day-by-day manual",
      "12 printable tools",
      "Appetite-loss strategies for specific medication classes",
      "Meal planning when normal portions feel overwhelming",
      "High-calorie, low-effort recipes and food hacks",
      "How to talk to your doctor about side effects",
    ],
  },
  "the-overqualified-problem": {
    id: "overqualified",
    tag: "Career",
    skill: "Position overqualification as an asset in the next interview.",
    deliverable: "A rewritten résumé, interview script, and salary talking points you can use this week.",
    time: "First usable draft in one sitting.",
    notFor: "Entry-level job seekers without a track record to reframe.",
    includes: [
      "Complete overqualification survival guide",
      "Résumé and interview strategies for qualified professionals",
      "Salary negotiation tactics and talking points",
      "How to position your background as an asset, not a liability",
      "Real-world case studies and scenario walkthroughs",
      "Action worksheets for your job search",
      "Access to community for peer support",
    ],
  },
};

function guessTag(title, blurb) {
  const t = `${title} ${blurb}`.toLowerCase();
  if (/(job|career|resume|résumé|interview|overqualif|hiring)/.test(t)) return "Career";
  if (/(send|remit|money|transfer|finance|wealth)/.test(t)) return "Finance";
  if (/(depress|appetite|glp|health|medication|mental|crisis)/.test(t)) return "Health";
  if (/(disaster|survival|72 hour|earthquake|flood|readiness)/.test(t)) return "Readiness";
  return "Playbook";
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function getHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "UpSkillHubStore/1.0",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error("fetch " + res.status);
  return res.text();
}

function parseCatalog(html) {
  const chunks = html.split('data-product-card="true"').slice(1);
  const seen = new Set();
  const out = [];
  for (const chunk of chunks) {
    const href = (chunk.match(/href="(\/upskill-hub\/products\/[^"]+)"/) || [])[1];
    if (!href) continue;
    const slug = href.replace(/^\/upskill-hub\/products\//, "").replace(/\/$/, "");
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const title = decode((chunk.match(/alt="([^"]+)"/) || [])[1] || slug);
    const image =
      (chunk.match(/src="(https:\/\/assets-2-prod\.whop\.com[^"]+)"/) || [])[1] ||
      (chunk.match(/src="(https:\/\/[^"]+\.(?:png|jpg|jpeg|webp)[^"]*)"/i) || [])[1] ||
      "";
    const prices = [...chunk.matchAll(/\$([0-9]+(?:\.[0-9]{1,2})?)/g)].map((m) => Number(m[1]));
    const price = prices.length ? prices[prices.length - 1] : 0;
    const original = prices.length > 1 ? prices[0] : undefined;
    out.push({
      slug,
      title,
      image,
      price,
      original: original && original > price ? original : undefined,
      url: STORE + "/products/" + slug + "/",
    });
  }
  return out;
}

async function liveFromWhop() {
  const html = await getHtml(STORE + "/products");
  const catalog = parseCatalog(html);
  return catalog.map((item) => {
    const extra = EXTRAS[item.slug] || {};
    const save =
      item.original && item.original > item.price
        ? Math.round((1 - item.price / item.original) * 100) + "%"
        : extra.save;
    const tagline = extra.tagline || extra.skill || item.title;
    return {
      id: extra.id || item.slug,
      slug: item.slug,
      title: item.title,
      price: item.price,
      original: item.original,
      save,
      tag: extra.tag || guessTag(item.title, tagline),
      cta: "Buy now",
      image: item.image,
      url: item.url,
      digital: true,
      tagline,
      blurb:
        extra.blurb ||
        extra.skill ||
        "Digital product from UpSkill Hub. Instant access after checkout on Whop.",
      skill: extra.skill || tagline,
      deliverable: extra.deliverable || "Instant digital files after Whop checkout.",
      time: extra.time || "Available immediately after purchase.",
      notFor: extra.notFor || "Anyone who does not need this specific outcome.",
      includes: extra.includes || [],
      caution: extra.caution,
    };
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
  try {
    if (process.env.WHOP_API_KEY) {
      const r = await fetch("https://api.whop.com/api/v1/products?visibilities=visible", {
        headers: { Authorization: "Bearer " + process.env.WHOP_API_KEY },
      });
      if (!r.ok) throw new Error("whop api " + r.status);
      const json = await r.json();
      const plansRes = await fetch("https://api.whop.com/api/v1/plans?visibilities=visible", {
        headers: { Authorization: "Bearer " + process.env.WHOP_API_KEY },
      });
      const plansJson = plansRes.ok ? await plansRes.json() : { data: [] };
      const planByProduct = {};
      for (const plan of plansJson.data || []) {
        const pid = plan.product && plan.product.id;
        if (!pid) continue;
        if (!planByProduct[pid]) planByProduct[pid] = plan;
      }
      const products = (json.data || [])
        .filter((p) => p.visibility === "visible")
        .map((p) => {
          const extra = EXTRAS[p.route] || {};
          const plan = planByProduct[p.id] || {};
          const price = Number(plan.renewal_price || plan.initial_price || 0);
          const original = plan.strike_through_initial_price || plan.strike_through_renewal_price;
          const img =
            (p.gallery_images && p.gallery_images[0] && p.gallery_images[0].url) ||
            (plan.image && plan.image.url) ||
            "";
          return {
            id: extra.id || p.route || p.id,
            slug: p.route,
            title: p.title,
            price,
            original: original && original > price ? original : undefined,
            tag: extra.tag || guessTag(p.title, p.headline || ""),
            cta: "Buy now",
            image: img,
            url: STORE + "/products/" + (p.route || "") + "/",
            digital: true,
            tagline: p.headline || extra.tagline || p.title,
            blurb: extra.blurb || p.headline || p.title,
            skill: extra.skill || p.headline || p.title,
            deliverable: extra.deliverable || "Instant digital files after Whop checkout.",
            time: extra.time || "Available immediately after purchase.",
            notFor: extra.notFor || "Anyone who does not need this specific outcome.",
            includes: extra.includes || [],
            caution: extra.caution,
          };
        });
      if (products.length) {
        res.status(200).json({ source: "whop-api", products });
        return;
      }
    }
    const products = await liveFromWhop();
    res.status(200).json({ source: "whop-public", products });
  } catch (err) {
    res.status(200).json({ source: "error", error: String(err.message || err), products: [] });
  }
};
