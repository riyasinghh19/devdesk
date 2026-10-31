/* DevDesk ATS scoring. ONE source for the browser (instant, free) and the server (AI review).
   Rule-based: keyword match, sections, impact, action verbs, length, clarity. */
var ATS = (function(){
function clip(s, n) { return typeof s === "string" ? s.slice(0, n) : ""; }
function wordCount(s) { return (s.match(/[A-Za-z0-9][A-Za-z0-9'+#.\-]*/g) || []).length; }

const STOP = new Set(("a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each else etc ever every few for from further get got had has have having he her here hers him his how i if in into is it its itself just may me might more most must my no nor not of off on once only or other our ours out over own per please same shall she should so some such than that the their them then there these they this those through to too under until up upon us very via was we were what when where which while who whom why will with within without would you your yours " +
  "senior junior principal lead staff ability able across activities additional apply applicant applicants candidate candidates company role roles position job jobs team teams work working works year years experience experienced plus preferred required requirements responsibilities responsibility qualification qualifications skills skill strong excellent good great knowledge understanding including include includes new using use used various looking join opportunity environment based level well within related relevant must-have nice-to-have day days week month months help helps ensure ensuring support supporting provide providing make making across both least minimum ideal ideally etc. e.g. i.e. will be").split(/\s+/));

const PHRASES = ["power bi", "azure data factory", "data factory", "data lake", "data warehouse", "data warehousing", "data modeling", "data modelling", "data pipeline", "data pipelines", "data engineering", "data analysis", "data analytics", "data science", "data quality", "data governance", "machine learning", "deep learning", "natural language processing", "computer vision", "project management", "product management", "stakeholder management", "change management", "agile", "scrum", "ci/cd", "unit testing", "test automation", "rest api", "rest apis", "web services", "cloud computing", "google cloud", "amazon web services", "azure synapse", "azure functions", "logic apps", "key vault", "star schema", "slowly changing dimensions", "etl", "elt", "big data", "spark sql", "stored procedures", "query optimization", "performance tuning", "version control", "customer service", "sales", "business development", "digital marketing", "content marketing", "social media", "search engine optimization", "financial analysis", "financial modeling", "accounts payable", "accounts receivable", "supply chain", "user experience", "user interface", "front end", "back end", "full stack", "react native", "node.js", "next.js", "vue.js", "spring boot", "ruby on rails", "microsoft excel", "google analytics", "a/b testing", "problem solving", "team leadership", "people management", "github actions", "delta lake", "unity catalog", "infrastructure as code", "dimensional modeling", "dimensional modelling", "azure devops", "data mesh", "event streaming", "real-time", "data visualization", "data visualisation", "llm", "generative ai", "prompt engineering", "docker", "kubernetes", "terraform", "airflow", "kafka"];

const VERBS = new Set(("accelerated achieved administered analysed analyzed architected automated boosted built championed coached collaborated completed configured consolidated created cut decreased defined delivered deployed designed developed directed doubled drove eliminated enabled engineered enhanced established executed expanded generated grew guided handled identified implemented improved increased initiated integrated introduced launched led maintained managed mentored migrated modernised modernized monitored negotiated optimised optimized orchestrated organised organized oversaw owned partnered pioneered planned presented produced programmed published raised reduced redesigned refactored resolved restructured revamped saved scaled secured shipped simplified spearheaded standardised standardized streamlined strengthened supervised trained transformed tripled upgraded wrote").split(/\s+/));

const WEAK = [[/\bresponsible for\b/i, "responsible for"], [/\bworked on\b/i, "worked on"], [/\bhelped\b/i, "helped"], [/\bduties (included|include)\b/i, "duties included"], [/\bin charge of\b/i, "in charge of"], [/\bparticipated in\b/i, "participated in"], [/\bassisted (with|in)\b/i, "assisted with"], [/\bvarious\b/i, "various"]];

function norm(s) { return " " + s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9+#./\- ]+/g, " ").replace(/\s+/g, " ") + " "; }
function hasTerm(text, term) {
  const t = term.toLowerCase();
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(^|[^a-z0-9+#])" + esc + "(s|es)?(?=[^a-z0-9+#]|$)");
  if (re.test(text)) return true;
  if (t.endsWith("s") && t.length > 4) return hasTerm(text, t.slice(0, -1));
  return false;
}

function extractKeywords(jd) {
  const text = norm(jd);
  const found = new Map();
  for (const ph of PHRASES) if (hasTerm(text, ph)) found.set(ph, 3);
  const tokens = text.trim().split(" ").map(t => t.replace(/^[.\-/]+|[.\-/]+$/g, "")).filter(Boolean);
  const counts = new Map();
  const bigrams = new Map();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (STOP.has(t) || t.length < 2 || /^\d+\+?$/.test(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
    const n = tokens[i + 1];
    if (n && !STOP.has(n) && n.length > 1 && !/^\d+\+?$/.test(n)) bigrams.set(t + " " + n, (bigrams.get(t + " " + n) || 0) + 1);
  }
  for (const [b, c] of bigrams) if (c >= 2 && !found.has(b)) found.set(b, c + 1);
  const covered = w => [...found.keys()].some(k => k.split(" ").includes(w));
  const singles = [...counts].filter(([w, c]) => !covered(w) && (c >= 2 || /[+#.]|^[a-z]{1,4}\d|^[A-Z]{2,}$/.test(w) || jdHasCaps(jd, w)))
    .sort((a, b) => b[1] - a[1]);
  for (const [w, c] of singles) found.set(w, c);
  const keys = [...found.keys()];
  for (const k of keys) {
    if (keys.some(o => o !== k && o.length > k.length && (" " + o + " ").includes(" " + k + " "))) found.delete(k);
    else if (k.endsWith("s") && found.has(k.slice(0, -1))) found.delete(k);
  }
  return [...found].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k]) => k);
}
function jdHasCaps(jd, w) { // tool names are often Capitalised or ALLCAPS mid-sentence (Snowflake, SQL, Kafka)
  const re = new RegExp("[a-z,;:] (" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "i");
  const m = jd.match(re);
  return !!(m && /^[A-Z]/.test(m[1]));
}

function scoreResume(resume, jd) {
  const text = norm(resume);
  const raw = resume.replace(/\r/g, "");
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const words = wordCount(raw);

  // bullets: explicit bullet characters, else medium-length lines
  let bullets = lines.filter(l => /^([•●▪◦‣\-–*]|\d+[.)])\s*/.test(l)).map(l => l.replace(/^([•●▪◦‣\-–*]|\d+[.)])\s*/, ""));
  if (bullets.length < 3) bullets = lines.filter(l => { const n = wordCount(l); return n >= 8 && n <= 45; });
  const quantified = bullets.filter(b => /\d|%|₹|\$|£|€/.test(b));
  const actionLed = bullets.filter(b => VERBS.has((b.match(/^[A-Za-z]+/) || [""])[0].toLowerCase()));
  const longBullets = bullets.filter(b => wordCount(b) > 40);
  const weakHits = WEAK.filter(([re]) => re.test(raw)).map(([, label]) => `"${label}"`);
  const firstPerson = (raw.match(/\b(I|my|me)\b/g) || []).length;

  const parts = [];
  const tips = [];

  // keywords
  let matched = [], missing = [];
  if (jd && wordCount(jd) >= 20) {
    const kws = extractKeywords(jd);
    matched = kws.filter(k => hasTerm(text, k));
    missing = kws.filter(k => !hasTerm(text, k));
    const pct = kws.length ? matched.length / kws.length : 0;
    parts.push({ name: "Keyword match", score: Math.round(pct * 40), max: 40, note: `${matched.length} of ${kws.length} key terms from the job description appear in your resume.` });
    if (missing.length) tips.push(`Add the missing terms you genuinely have experience with, using the job description's exact wording: ${missing.slice(0, 8).join(", ")}.`);
  } else {
    tips.push("Paste the job description to see which keywords you're missing. Keyword match is the biggest factor in most ATS rankings.");
  }

  // sections
  const sec = {
    contact: /@[a-z0-9-]+\.[a-z]/i.test(raw) && /(\+?\d[\d\s\-()]{8,})/.test(raw),
    summary: /\b(summary|profile|objective|about me)\b/i.test(raw),
    experience: /\b(experience|employment|work history)\b/i.test(raw),
    education: /\b(education|academic|qualification|degree|university|college|b\.?tech|b\.?e\.?|bachelor|master)\b/i.test(raw),
    skills: /\b(skills|technical skills|core competencies|technologies|tools)\b/i.test(raw),
  };
  const secScore = Object.values(sec).filter(Boolean).length * 3;
  const missingSec = Object.entries(sec).filter(([, v]) => !v).map(([k]) => k);
  parts.push({ name: "Sections", score: secScore, max: 15, note: missingSec.length ? `Missing or unclear: ${missingSec.join(", ")}.` : "Contact details, summary, experience, education and skills are all there." });
  if (missingSec.length) tips.push(`Add clear headings for: ${missingSec.join(", ")}. ATS software looks for standard section names.`);

  // impact
  const qRatio = bullets.length ? quantified.length / bullets.length : 0;
  parts.push({ name: "Measurable impact", score: Math.round(Math.min(1, qRatio / 0.4) * 15), max: 15, note: `${quantified.length} of ${bullets.length} bullet points include a number, percentage or amount.` });
  if (qRatio < 0.4) tips.push("Add numbers to more bullets: time saved, records processed, cost cut, users served. Aim for at least 4 in every 10 bullets.");

  // action verbs
  const vRatio = bullets.length ? actionLed.length / bullets.length : 0;
  parts.push({ name: "Action verbs", score: Math.round(Math.min(1, vRatio / 0.6) * 10), max: 10, note: `${actionLed.length} of ${bullets.length} bullets start with a strong action verb.` });
  if (vRatio < 0.6) tips.push("Start each bullet with a strong verb such as Built, Led, Reduced, Automated or Delivered.");

  // length
  let lenScore = 10, lenNote = `${words} words, a good length.`;
  if (words < 250) { lenScore = 3; lenNote = `${words} words. That's thin; most strong resumes have 400 to 800.`; tips.push("Add more detail on your recent roles and results. The resume is quite short."); }
  else if (words < 350) { lenScore = 6; lenNote = `${words} words, a little short.`; }
  else if (words > 1300) { lenScore = 4; lenNote = `${words} words. That's long; trim older roles.`; tips.push("Cut older or less relevant points. Two pages at most is the norm."); }
  else if (words > 1000) { lenScore = 7; lenNote = `${words} words, slightly long.`; }
  parts.push({ name: "Length", score: lenScore, max: 10, note: lenNote });

  // clarity
  let clar = 10;
  clar -= Math.min(5, weakHits.length * 2);
  clar -= firstPerson > 3 ? 3 : 0;
  clar -= Math.min(2, longBullets.length);
  clar = Math.max(0, clar);
  const clarNotes = [];
  if (weakHits.length) { clarNotes.push(`weak phrases: ${weakHits.join(", ")}`); tips.push(`Replace weak phrases (${weakHits.join(", ")}) with what you achieved.`); }
  if (firstPerson > 3) { clarNotes.push("uses I/my/me often"); tips.push("Drop 'I', 'my' and 'me'. Resume bullets read better without them."); }
  if (longBullets.length) { clarNotes.push(`${longBullets.length} very long bullet${longBullets.length > 1 ? "s" : ""}`); tips.push("Split bullets longer than about 30 words into two."); }
  parts.push({ name: "Clarity", score: clar, max: 10, note: clarNotes.length ? "Watch out for " + clarNotes.join("; ") + "." : "Clear, direct wording." });

  const got = parts.reduce((s, p) => s + p.score, 0), max = parts.reduce((s, p) => s + p.max, 0);
  const score = Math.round(got / max * 100);
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Fair" : "Needs work";
  return { score, grade, parts, matched, missing, tips: tips.slice(0, 7), stats: { words, bullets: bullets.length, quantified: quantified.length }, hasJd: !!(jd && wordCount(jd) >= 20), bulletsText: bullets.slice(0, 40) };
}

return { score: scoreResume, wordCount: wordCount, clip: clip };
})();
