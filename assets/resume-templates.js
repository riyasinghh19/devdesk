/* DevDesk resume templates. ONE source for both the live preview (browser) and the paid PDF (payment server),
   so what people see is exactly what they get.
   "ats" templates: one column, one reading order, best for job portals.
   "designer" templates: sidebar + optional photo, best for emailing a PDF to a person. */
var RT = (function(){
  var ACCENTS = {
    blue: "#2457D6", teal: "#0F766E", green: "#1F7A3A", wine: "#9F1239", amber: "#D9A400", slate: "#334155", violet: "#6D28D9"
  };
  var FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Source+Sans+3:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Lato:wght@400;700;900&family=Manrope:wght@400;600;700;800&family=Oswald:wght@400;500;600&family=Raleway:wght@300;400;600;700&family=Montserrat:wght@400;600;700;800&display=swap";

  /* side: which sections sit in the sidebar (in order); the rest go in the main column */
  var T = {
    /* ---------- ATS-safe, one column ---------- */
    classic: { kind: "ats", label: "Classic", hint: "Clean and safe for any role", font: '"Source Sans 3",Calibri,Arial,sans-serif', css:
      "h1{font-size:25pt;font-weight:700;letter-spacing:-.01em}.title{font-size:12.5pt;color:#333;margin-top:1px}" +
      ".contact{margin-top:6px;color:#333}h2{font-size:10.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;border-bottom:1.3px solid #111;padding-bottom:3px;margin:15px 0 7px}" },
    modern: { kind: "ats", label: "Modern", hint: "A touch of colour for tech roles", font: 'Inter,Arial,sans-serif', css:
      "body{font-size:9.9pt}h1{font-size:26pt;font-weight:800;letter-spacing:-.03em;color:var(--ac)}.title{font-size:12pt;font-weight:600;color:#111;margin-top:2px}" +
      ".contact{margin-top:7px;color:#555}h2{font-size:11pt;font-weight:700;color:var(--ac);margin:17px 0 7px;display:flex;align-items:center;gap:10px}" +
      "h2::after{content:'';flex:1;height:1.5px;background:var(--ac);opacity:.25}.when{color:var(--ac);font-weight:600}" },
    executive: { kind: "ats", label: "Executive", hint: "Serif and centred, for senior roles", font: '"Source Serif 4",Georgia,serif', css:
      ".head{text-align:center;border-bottom:3px double var(--ac);padding-bottom:10px}h1{font-size:25pt;font-weight:600;letter-spacing:.06em;text-transform:uppercase}" +
      ".title{font-style:italic;font-size:12pt;color:#333;margin-top:3px}.contact{color:#444;margin-top:5px}" +
      "h2{text-align:center;font-weight:600;font-size:10.5pt;letter-spacing:.24em;text-transform:uppercase;color:var(--ac);margin:16px 0 8px}" +
      "h2::before,h2::after{content:'—';margin:0 10px;color:#bbb}" },
    minimal: { kind: "ats", label: "Minimal", hint: "Headings in the margin, lots of air", font: '"DM Sans",Arial,sans-serif', css:
      "body{font-size:9.8pt}h1{font-size:28pt;font-weight:500;letter-spacing:-.035em}.title{font-size:12pt;color:var(--ac);margin-top:2px}" +
      ".contact{margin-top:8px;color:#555}.head{padding-bottom:12px;border-bottom:1px solid #e3e3e3}" +
      ".sec{display:grid;grid-template-columns:118px 1fr;gap:18px;padding:13px 0;border-bottom:1px solid #eee}.sec:last-child{border-bottom:0}" +
      "h2{margin:2px 0 0;font-size:8.6pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ac)}" },
    banner: { kind: "ats", label: "Banner", hint: "Coloured header that stands out", font: 'Inter,Arial,sans-serif', css:
      "body{font-size:9.9pt}.head{background:var(--ac);color:#fff;margin:-14mm -15mm 14px;padding:12mm 15mm 9mm}" +
      "h1{font-size:27pt;font-weight:800;letter-spacing:-.02em;color:#fff}.title{font-size:12.5pt;opacity:.92;margin-top:2px}.contact{color:#fff;opacity:.9;margin-top:8px}" +
      "h2{font-size:11pt;font-weight:800;margin:16px 0 7px;padding-left:9px;border-left:4px solid var(--ac)}" +
      ".skills span{display:inline-block;border:1px solid #cfd5df;border-radius:99px;padding:1px 9px;margin:0 4px 5px 0}.skills .dot{display:none}" },
    compact: { kind: "ats", label: "Compact", hint: "Fits lots of experience on one page", font: 'Lato,Calibri,Arial,sans-serif', css:
      "body{font-size:9.4pt;line-height:1.3}.head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid var(--ac);padding-bottom:7px}" +
      "h1{font-size:20pt;font-weight:900;letter-spacing:-.01em}.title{font-size:11pt;color:var(--ac);font-weight:700}.contact{text-align:right;max-width:52%;color:#333}" +
      "h2{font-size:9.6pt;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--ac);margin:10px 0 4px}.item{margin-bottom:6px}li{margin:1px 0}" },
    timeline: { kind: "ats", label: "Timeline", hint: "Experience drawn as a career line", font: 'Manrope,Arial,sans-serif', css:
      "body{font-size:9.8pt}h1{font-size:26pt;font-weight:800;letter-spacing:-.03em}.title{font-size:12pt;font-weight:600;color:var(--ac)}.contact{margin-top:7px;color:#555}" +
      "h2{font-size:10.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin:17px 0 8px;color:#111}h2::before{content:'';display:inline-block;width:18px;height:3px;background:var(--ac);vertical-align:middle;margin-right:8px}" +
      ".sec-exp .item{position:relative;padding-left:18px;border-left:2px solid #e2e6ee;margin-left:4px;padding-bottom:4px;margin-bottom:6px}" +
      ".sec-exp .item::before{content:'';position:absolute;left:-6px;top:3px;width:10px;height:10px;border-radius:50%;background:#fff;border:2.5px solid var(--ac)}" +
      ".skills span{display:inline-block;background:#f1f4f9;border-radius:5px;padding:1px 8px;margin:0 4px 5px 0}.skills .dot{display:none}" },

    /* ---------- Designer: sidebar + photo ---------- */
    studio: { kind: "designer", label: "Studio", hint: "Dark sidebar, photo, bold name", font: 'Raleway,Arial,sans-serif', defaultAccent: "amber", photo: true,
      side: ["photo", "sum", "contact", "skills", "lang", "interests"], css:
      "html{background:linear-gradient(90deg,#2E3138 70mm,#fff 70mm)!important}body{background:transparent}.page{padding:0;display:grid;grid-template-columns:70mm 1fr;min-height:296mm;background:transparent}" +
      "aside{background:#2E3138;color:#E9EAEE;padding:0 0 12mm}aside .photo{display:block;width:100%;height:66mm;object-fit:cover}" +
      "aside .sec{padding:0 9mm}aside h2{color:#fff;font-size:11pt;font-weight:400;letter-spacing:.2em;text-transform:uppercase;margin:9mm 0 4mm;border-bottom:1px solid #6b6f78;padding-bottom:2mm}" +
      "aside p,aside li{color:#D3D6DC;font-size:9.2pt}aside .clist div{margin-bottom:5px;word-break:break-word}" +
      "aside .skills span{display:block;padding:3px 0;border-bottom:1px solid #4a4e57}aside .skills .dot{display:none}" +
      ".main{padding:16mm 13mm 12mm 12mm}.head{margin-bottom:6mm}" +
      "h1{display:inline;font-family:Oswald,Arial,sans-serif;font-weight:500;font-size:30pt;letter-spacing:.06em;text-transform:uppercase;line-height:1.25;background:linear-gradient(transparent 55%,var(--ac) 55%,var(--ac) 88%,transparent 88%);padding:0 3px}" +
      ".title{margin-top:8px;font-size:11pt;letter-spacing:.18em;text-transform:uppercase;color:#555}" +
      ".main h2{font-size:15pt;font-weight:300;letter-spacing:.14em;text-transform:uppercase;color:#2E3138;margin:7mm 0 3mm}" +
      ".main h3{text-transform:uppercase;letter-spacing:.04em;font-size:10pt}.main .when{color:#777}" },
    profile: { kind: "designer", label: "Profile", hint: "Dark header, round photo, side panel", font: 'Montserrat,Arial,sans-serif', defaultAccent: "slate", photo: true,
      side: ["contact", "skills", "lang", "cert", "interests"], css:
      "body{font-size:9.3pt;background:transparent}html{background:linear-gradient(90deg,#EEF0F3 66mm,#fff 66mm)!important}.page{padding:0;display:flex;flex-direction:column;background:transparent}" +
      ".head{display:flex;align-items:center;gap:9mm;background:#2F3542;color:#fff;padding:10mm 13mm;min-height:46mm}" +
      ".head .photo{width:34mm;height:34mm;border-radius:50%;object-fit:cover;border:3px solid #fff;flex:0 0 auto}" +
      "h1{font-size:25pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff}.title{margin-top:4px;font-size:10.5pt;letter-spacing:.2em;text-transform:uppercase;color:#C9CED8}" +
      ".cols{display:grid;grid-template-columns:66mm 1fr;flex:1}" +
      "aside{background:#EEF0F3;padding:8mm 8mm}.main{padding:8mm 12mm 10mm 10mm}" +
      "h2{font-size:10.5pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2F3542;margin:6mm 0 3mm;display:flex;align-items:center;gap:8px}" +
      ".main h2::before{content:'';width:16px;height:16px;border-radius:50%;background:#2F3542;box-shadow:inset 0 0 0 4px #fff,0 0 0 1.5px #2F3542;flex:0 0 auto}" +
      "aside h2{border-bottom:1.5px solid #c7ccd5;padding-bottom:2mm}aside .clist div{margin-bottom:5px;word-break:break-word}" +
      "aside .skills span{display:block;padding:2px 0 2px 12px;position:relative}aside .skills span::before{content:'';position:absolute;left:0;top:7px;width:5px;height:5px;border-radius:50%;background:var(--ac)}aside .skills .dot{display:none}" +
      ".main .sec{border-left:1.5px solid #d4d8df;margin-left:7px;padding-left:15px}.main h2{margin-left:-24px}.when{color:#555}" },
    evergreen: { kind: "designer", label: "Evergreen", hint: "Full colour sidebar with skill pills", font: 'Inter,Arial,sans-serif', defaultAccent: "green", photo: true,
      side: ["photo", "name", "contact", "skills", "lang", "interests"], css:
      "body{font-size:9.4pt}.page{padding:0;display:grid;grid-template-columns:68mm 1fr;min-height:296mm;background:transparent}html{background:linear-gradient(90deg,var(--ac) 68mm,#fff 68mm)!important}body{background:transparent}" +
      "aside{background:var(--ac);color:#fff;padding:10mm 8mm}aside .photo{display:block;width:34mm;height:34mm;object-fit:cover;border-radius:6px;border:3px solid rgba(255,255,255,.85);margin-bottom:6mm}" +
      "aside h1{font-size:21pt;font-weight:800;line-height:1.1;color:#fff}aside .title{font-size:10pt;color:rgba(255,255,255,.85);margin-top:4px}" +
      "aside h2{color:#fff;font-size:11pt;font-weight:700;margin:8mm 0 3mm}aside p,aside li,aside .clist{color:rgba(255,255,255,.92)}aside .clist div{margin-bottom:6px;word-break:break-word}aside .clist b{display:block;font-size:8.5pt;opacity:.75;font-weight:600}" +
      "aside .skills span{display:inline-block;border:1px solid rgba(255,255,255,.7);border-radius:99px;padding:2px 9px;margin:0 4px 6px 0}aside .skills .dot{display:none}" +
      ".main{padding:12mm 12mm 10mm 11mm}.main .head{display:none}" +
      ".main h2{font-size:12pt;font-weight:800;color:var(--ac);margin:6mm 0 3mm;padding-bottom:2mm;border-bottom:1.5px solid #e3e7ec}" +
      ".main .when{color:var(--ac);font-weight:600}" },
    split: { kind: "designer", label: "Split", hint: "Centred name, two tidy columns", font: '"Source Sans 3",Arial,sans-serif', defaultAccent: "slate", photo: false,
      side: ["contact", "edu", "skills", "cert", "lang", "interests"], css:
      "body{font-size:9.6pt}.head{text-align:center;padding-bottom:6mm;border-bottom:1px solid #d7dbe2;margin-bottom:6mm}" +
      "h1{font-size:30pt;font-weight:400;letter-spacing:.06em;text-transform:uppercase}.title{margin-top:4px;font-size:11pt;letter-spacing:.32em;text-transform:uppercase;color:#666}" +
      ".cols{display:grid;grid-template-columns:52mm 1fr;gap:9mm}aside{border-right:1px solid #d7dbe2;padding-right:7mm}" +
      "h2{font-size:10pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#111;margin:0 0 3mm;padding-bottom:2mm;border-bottom:2px solid var(--ac);display:inline-block}" +
      ".sec{margin-bottom:6mm}aside .clist div{margin-bottom:5px;word-break:break-word}aside .skills span{display:block}aside .skills .dot{display:none}" +
      ".main h3{text-transform:uppercase;font-size:9.8pt;letter-spacing:.04em}" },
    midnight: { kind: "designer", label: "Midnight", hint: "Navy header, photo, side column", font: 'Manrope,Arial,sans-serif', defaultAccent: "amber", photo: true,
      side: ["contact", "skills", "edu", "cert", "lang", "interests"], sideRight: true, css:
      "body{font-size:9.3pt}.page{padding:0;display:flex;flex-direction:column}" +
      ".head{display:flex;justify-content:space-between;align-items:center;gap:8mm;background:#1E2A44;color:#fff;padding:11mm 13mm;min-height:42mm}" +
      ".head .photo{width:30mm;height:30mm;border-radius:50%;object-fit:cover;border:3px solid var(--ac);flex:0 0 auto;order:2}" +
      "h1{font-size:24pt;font-weight:800;color:#fff}.title{margin-top:3px;font-size:10.5pt;color:var(--ac);font-weight:700}.head p{color:#C8D0E0;margin-top:6px;max-width:120mm;font-size:9pt}" +
      ".cols{display:grid;grid-template-columns:1fr 64mm;gap:8mm;padding:8mm 13mm 10mm}" +
      "h2{font-size:10.5pt;font-weight:800;color:#1E2A44;text-transform:uppercase;letter-spacing:.1em;margin:5mm 0 3mm;padding-bottom:1.5mm;border-bottom:2px solid var(--ac)}" +
      "aside{background:#F4F6FA;border-radius:8px;padding:2mm 6mm 6mm}aside .clist div{margin-bottom:5px;word-break:break-word}aside .clist b{display:block;font-size:8.3pt;color:#667;font-weight:700}" +
      "aside .skills span{display:inline-block;background:#fff;border:1px solid #d9dee8;border-radius:4px;padding:1px 7px;margin:0 4px 5px 0}aside .skills .dot{display:none}.when{color:#556}" }
  };

  function esc(s){ return String(s == null ? "" : s).slice(0, 2000).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function list(a, n){ return Array.isArray(a) ? a.slice(0, n) : []; }
  function okPhoto(p){ return typeof p === "string" && p.length < 160000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p); }

  function render(d, opts){
    d = d || {}; opts = opts || {};
    var key = T[d.template] ? d.template : "classic", t = T[key];
    var ac = ACCENTS[d.accent] || ACCENTS[t.defaultAccent] || ACCENTS.blue;
    var designer = t.kind === "designer";
    var photo = t.photo && okPhoto(d.photo) ? '<img class="photo" src="' + d.photo + '" alt="">' : "";

    function sec(cls, title, inner){ return inner ? '<section class="sec ' + cls + '"><h2>' + title + '</h2><div class="sec-body">' + inner + '</div></section>' : ""; }
    var links = list(d.links, 4).filter(Boolean);
    var contactLine = [d.email, d.phone, d.location].concat(links).filter(Boolean).map(esc).join("&nbsp;&nbsp;·&nbsp;&nbsp;");
    var cl = [["Email", d.email], ["Phone", d.phone], ["Location", d.location]].concat(links.map(function(l){ return ["Link", l]; }))
      .filter(function(x){ return x[1]; }).map(function(x){ return '<div><b>' + x[0] + '</b>' + esc(x[1]) + '</div>'; }).join("");
    var exp = list(d.experience, 12).filter(function(x){ return x && (x.role || x.company); }).map(function(x){
      var bl = list(x.bullets, 12).filter(function(b){ return String(b).trim(); });
      return '<div class="item"><div class="row"><h3>' + esc(x.role) + (x.company ? ', <span>' + esc(x.company) + '</span>' : '') + '</h3><div class="when">' + esc([x.start, x.end].filter(Boolean).join(" – ")) + '</div></div>' +
        (x.location ? '<div class="sub">' + esc(x.location) + '</div>' : '') + (bl.length ? '<ul>' + bl.map(function(b){ return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }).join("");
    var proj = list(d.projects, 8).filter(function(p){ return p && (p.name || p.detail); }).map(function(p){ return '<div class="item"><h3>' + esc(p.name) + '</h3>' + (p.detail ? '<p>' + esc(p.detail) + '</p>' : '') + '</div>'; }).join("");
    var edu = list(d.education, 6).filter(function(e){ return e && (e.degree || e.school); }).map(function(e){
      return '<div class="item"><div class="row"><h3>' + esc(e.degree) + (e.school ? ', <span>' + esc(e.school) + '</span>' : '') + '</h3><div class="when">' + esc(e.year) + '</div></div>' + (e.detail ? '<div class="sub">' + esc(e.detail) + '</div>' : '') + '</div>';
    }).join("");
    var certs = list(d.certifications, 12).filter(function(c){ return String(c).trim(); }).map(function(c){ return '<li>' + esc(c) + '</li>'; }).join("");
    var sk = String(d.skills || "").split(/[,\n]/).map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 40);
    var skills = sk.length ? '<p class="skills">' + sk.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('<i class="dot"> · </i>') + '</p>' : "";
    var langs = list(d.languages, 8).filter(function(l){ return String(l).trim(); }).map(function(l){ return '<li>' + esc(l) + '</li>'; }).join("");
    var interests = String(d.interests || "").trim();

    var S = {
      photo: photo,
      name: '<div class="side-name"><h1>' + esc(d.name || (opts.screen ? "Your Name" : "")) + '</h1>' + (d.title ? '<div class="title">' + esc(d.title) + '</div>' : '') + '</div>',
      sum: sec("sec-sum", designer && key === "studio" ? "About me" : (key === "profile" ? "Profile" : "Summary"), d.summary ? '<p>' + esc(d.summary) + '</p>' : ""),
      contact: sec("sec-contact", "Contact", cl ? '<div class="clist">' + cl + '</div>' : ""),
      exp: sec("sec-exp", key === "profile" || key === "studio" ? "Work experience" : "Experience", exp),
      proj: sec("sec-proj", "Projects", proj),
      skills: sec("sec-skills", "Skills", skills),
      edu: sec("sec-edu", "Education", edu),
      cert: sec("sec-cert", "Certifications", certs ? '<ul>' + certs + '</ul>' : ""),
      lang: sec("sec-lang", "Languages", langs ? '<ul class="plain">' + langs + '</ul>' : ""),
      interests: sec("sec-int", "Interests", interests ? '<p>' + esc(interests) + '</p>' : "")
    };
    var nameBlock = '<div><h1>' + esc(d.name || (opts.screen ? "Your Name" : "")) + '</h1>' + (d.title ? '<div class="title">' + esc(d.title) + '</div>' : '') + '</div>';

    var body;
    if (!designer) {
      body = '<header class="head">' + nameBlock + (contactLine ? '<div class="contact">' + contactLine + '</div>' : '') + '</header>' +
        S.sum + S.exp + S.proj + S.skills + S.edu + S.cert + S.lang + S.interests;
    } else {
      var sideKeys = t.side, mainOrder = ["sum", "exp", "proj", "edu", "skills", "cert", "lang", "interests"].filter(function(k){ return sideKeys.indexOf(k) < 0; });
      var aside = '<aside>' + sideKeys.map(function(k){ return S[k] || ""; }).join("") + '</aside>';
      var main = '<div class="main">' + mainOrder.map(function(k){ return S[k]; }).join("") + '</div>';
      if (key === "studio" || key === "evergreen") {
        var head = key === "studio" ? '<header class="head">' + nameBlock + '</header>' : '';
        body = aside + main.replace('<div class="main">', '<div class="main">' + head);
      } else {
        var summaryInHead = key === "midnight" && d.summary ? '<p>' + esc(d.summary) + '</p>' : '';
        if (key === "midnight") main = main.replace(S.sum, "");
        var hdr = '<header class="head">' + (key === "profile" ? photo : '') + '<div><h1>' + esc(d.name || (opts.screen ? "Your Name" : "")) + '</h1>' + (d.title ? '<div class="title">' + esc(d.title) + '</div>' : '') + summaryInHead + '</div>' + (key === "midnight" ? photo : '') + '</header>';
        body = hdr + '<div class="cols">' + (t.sideRight ? main + aside : aside + main) + '</div>';
      }
    }

    var css = "@page{size:A4;margin:0}*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact;--ac:" + ac + ";background:#fff}" +
      "body{margin:0;background:#fff;color:#16181d;font-family:" + t.font + ";font-size:10.2pt;line-height:1.42;--ac:" + ac + "}" +
      ".page{width:210mm;min-height:296mm;margin:0 auto;padding:14mm 15mm;background:#fff}" +
      "h1,h2,h3,p,ul{margin:0}h1{line-height:1.05}.contact{font-size:9pt}" +
      "h3{font-size:10.3pt;font-weight:700}h3 span{font-weight:400}.item{margin-bottom:9px;break-inside:avoid}" +
      ".row{display:flex;justify-content:space-between;gap:14px;align-items:baseline}.when{font-size:9pt;color:#444;white-space:nowrap}" +
      ".sub{font-size:9pt;color:#555}ul{padding-left:15px;margin-top:3px}li{margin:2px 0}ul.plain{list-style:none;padding-left:0}p{margin-top:2px}.skills{line-height:1.7}.dot{font-style:normal;color:#999}" +
      ".clist b{font-weight:700;margin-right:6px}aside .clist b{display:block;font-size:8.3pt;opacity:.7}" + t.css;
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(d.name || "Resume") + '</title>' +
      '<link rel="stylesheet" href="' + FONTS + '"><style>' + css + '</style></head><body><main class="page tpl-' + key + '">' + body + '</main></body></html>';
  }

  return { render: render, templates: T, accents: ACCENTS, okPhoto: okPhoto };
})();
