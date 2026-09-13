window.USH = window.USH || {};

USH.JOIN_URL = "https://whop.com/upskill-hub/";
USH.CREATOR_URL = "https://whop.com/@yeboahnan/";

USH.products = [
  {
    id: "overqualified",
    title: "The Overqualified Problem",
    price: 48.99,
    original: 61.24,
    save: "20%",
    tag: "Career",
    cta: "Buy now",
    image: "assets/overqualified.png",
    url: "https://whop.com/upskill-hub/products/the-overqualified-problem/",
    digital: true,
    featured: true,
    tagline: "A job-search playbook for people over fifty — and anyone told they are “too much.”",
    skill: "Position overqualification as an asset in the next interview.",
    deliverable: "A rewritten résumé, interview script, and salary talking points you can use this week.",
    time: "First usable draft in one sitting.",
    notFor: "Entry-level job seekers without a track record to reframe.",
    blurb:
      "You’ve climbed the ladder, earned the credentials, and built expertise — but now you’re stuck. Overqualification is a real career obstacle most resources ignore. This guide walks you through rejection, underemployment, and roles that don’t match your ability — then gives you the next move without settling.",
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
  {
    id: "send",
    title: "Send Smarter",
    price: 49,
    original: 61.25,
    save: "20%",
    tag: "Finance",
    cta: "Order now",
    image: "assets/send.png",
    url: "https://whop.com/upskill-hub/products/send-smarter-5c/",
    digital: true,
    featured: true,
    tagline: "Stop paying to send money home.",
    skill: "Cut remittance costs and route money into family assets — not fees.",
    deliverable: "A corridor cost sheet, scam-prevention scripts, and a 30-day transfer plan.",
    time: "Start the 30-day plan the day you download.",
    notFor: "People who never send money across borders.",
    blurb:
      "A 58-page playbook for anyone supporting family abroad. Cheapest, safest ways to transfer funds, protect relatives from common scams, and turn monthly remittances into something that actually compounds. Ready-to-use scripts, fill-in worksheets, and a structured 30-day action plan.",
    includes: [
      "58-page playbook with step-by-step transfer methods",
      "Scam-prevention scripts to protect your family",
      "Cost comparison worksheets for every major corridor",
      "30-day implementation plan with daily checkpoints",
      "Ready-to-share templates for family conversations",
    ],
  },
  {
    id: "appetite",
    title: "The Tiny Appetite Protocol",
    price: 90,
    original: 112.5,
    save: "20%",
    tag: "Health",
    cta: "Buy now",
    image: "assets/appetite.png",
    url: "https://whop.com/upskill-hub/products/the-tiny-appetite-protocol/",
    digital: true,
    tagline: "Eating, symptoms, and strength on GLP-1 medication.",
    skill: "Keep nutrition and strength when medication flattens appetite.",
    deliverable: "A dose-week meal plan, symptom log, and doctor-conversation script.",
    time: "Use it on your next dose day.",
    notFor: "Anyone looking for a weight-loss hack or a substitute for clinical care.",
    blurb:
      "You started this medication to feel better. Generic nutrition advice fails when portions feel impossible. A practical manual — 40 chapters, 12 printable tools, 33,000 words — built for the dose week, the symptoms, and the strength work. Medication-aware. Not cheerful calorie counts.",
    includes: [
      "40-chapter day-by-day manual",
      "12 printable tools",
      "Appetite-loss strategies for specific medication classes",
      "Meal planning when normal portions feel overwhelming",
      "High-calorie, low-effort recipes and food hacks",
      "How to talk to your doctor about side effects",
    ],
  },
  {
    id: "disaster",
    title: "The Disaster Survival Playbook",
    price: 35,
    tag: "Readiness",
    cta: "Purchase",
    image: "assets/disaster.png",
    url: "https://whop.com/upskill-hub/products/the-disaster-survival-playbook/",
    digital: true,
    tagline: "Practical readiness and recovery for the first 72 hours.",
    skill: "Run a household through the first 72 hours of a disaster without improvising.",
    deliverable: "A completed hazard audit, 72-hour go-bag list, and evacuation contact sheet.",
    time: "Household setup in an afternoon.",
    notFor: "People looking for wilderness survival or conspiracy “prepper” content.",
    blurb:
      "A household field manual: hazard audit, 72-hour go-bag, evacuation contacts, and concrete rules for fire, earthquake, flood, severe weather, and shelter-in-place. Instant digital access. Boring on purpose — because panic is not a plan.",
    includes: [
      "Home hazard audit worksheet",
      "72-hour go-bag packing list",
      "Evacuation contact sheet",
      "Rules for fire, earthquake, flood, severe weather",
      "Shelter-in-place protocol",
    ],
  },
  {
    id: "light",
    title: "Finding Light in the Dark",
    price: 30,
    tag: "Health",
    cta: "Get access",
    image: "assets/light.png",
    url: "https://whop.com/upskill-hub/products/finding-light-in-the-dark-a1/",
    digital: true,
    tagline: "A practical and spiritual survival guide for depression and emotional distress.",
    skill: "Name what is happening, run a crisis protocol, and take one next clinical step.",
    deliverable: "Completed worksheets plus a written crisis plan you can hand to a safe adult.",
    time: "Worksheets in one sitting; the plan stays with you.",
    notFor: "Anyone seeking how-tos for harm. This guide refuses that. It is not a substitute for 988, emergency services, or a licensed clinician.",
    blurb:
      "A structured eBook for youth, adults, and caregivers: what clinical depression is, teen-specific help, breaking negative thought loops, crisis and self-harm safety (no how-tos), professional care, and faith-based resilience. Educational — not a treatment plan, and faith does not replace a clinician.",
    includes: [
      "Structured guide for youth, adults, and caregivers",
      "Worksheets for thought loops and next steps",
      "Crisis protocol and emergency resources",
      "Teen-specific signs (irritability, withdrawal)",
      "Faith-based resilience that does not replace medical care",
    ],
    caution:
      "If you want to die or hurt yourself, treat that as an emergency — 988 in the US — not a secret. Stay. Tell a human.",
  },
];

USH.formatPrice = function (n) {
  return "$" + Number(n).toFixed(2);
};

USH.getProduct = function (id) {
  if (!id) return undefined;
  return USH.products.find((p) => p.id === id || p.slug === id);
};

USH.loadProducts = async function () {
  try {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    if (data && Array.isArray(data.products) && data.products.length) {
      USH.products = data.products;
      USH.catalogSource = data.source;
    }
  } catch (e) {
    USH.catalogSource = "local";
  }
  return USH.products;
};

USH.productCard = function (p) {
  const save = p.save ? `<span class="badge-save">Save ${p.save}</span>` : "";
  const original = p.original
    ? `<span class="price-old">${USH.formatPrice(p.original)}</span>`
    : "";
  return `
    <article class="product-card reveal">
      <a class="card-media" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <span class="chip">${p.tag}</span>
        ${save}
        <span class="chip chip-digital">Digital · Instant</span>
      </a>
      <div class="card-body">
        <h3><a href="product.html?id=${p.id}">${p.title}</a></h3>
        <p>${p.tagline}</p>
        <div class="card-foot">
          <div class="price">
            ${original}
            <strong>${USH.formatPrice(p.price)}</strong>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-gold" type="button" data-add="${p.id}">Add to cart</button>
          <a class="btn btn-sm btn-ghost" href="product.html?id=${p.id}">View</a>
        </div>
      </div>
    </article>`;
};
