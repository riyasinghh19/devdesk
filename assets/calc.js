/* DevDesk shared calculator helpers */
(function(){
  function inr(n, dp){ if (!isFinite(n)) return '—'; return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: dp || 0, minimumFractionDigits: dp || 0 }); }
  function words(n){
    var a = Math.abs(n), s = n < 0 ? '−' : '';
    if (a >= 1e7) return s + '₹' + (a / 1e7).toFixed(a >= 1e9 ? 0 : 2).replace(/\.?0+$/, '') + ' crore';
    if (a >= 1e5) return s + '₹' + (a / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' lakh';
    return s + inr(a);
  }
  function num(id){ var el = document.getElementById(id); if (!el) return 0; var v = parseFloat(String(el.value).replace(/[,₹\s]/g, '')); return isFinite(v) ? v : 0; }
  function tiles(el, items){
    el.innerHTML = '';
    items.forEach(function(it){
      var d = document.createElement('div'); d.className = 'tile' + (it[2] ? ' ' + it[2] : '');
      var k = document.createElement('span'); k.className = 'tk'; k.textContent = it[0];
      var v = document.createElement('b'); v.textContent = it[1];
      d.appendChild(k); d.appendChild(v);
      if (it[3]) { var s = document.createElement('small'); s.textContent = it[3]; d.appendChild(s); }
      el.appendChild(d);
    });
  }
  function split(el, parts){
    var total = parts.reduce(function(s, p){ return s + Math.max(0, p[1]); }, 0) || 1;
    el.innerHTML = '';
    var bar = document.createElement('div'); bar.className = 'split-bar';
    var key = document.createElement('div'); key.className = 'split-key';
    parts.forEach(function(p, i){
      var seg = document.createElement('span'); seg.className = 's' + i; seg.style.width = (Math.max(0, p[1]) / total * 100) + '%'; bar.appendChild(seg);
      var k = document.createElement('span'); k.innerHTML = '<i class="s' + i + '"></i>'; k.appendChild(document.createTextNode(p[0] + ' · ' + Math.round(Math.max(0, p[1]) / total * 100) + '%')); key.appendChild(k);
    });
    el.appendChild(bar); el.appendChild(key);
  }
  function table(tbl, head, rows){
    var h = '<thead><tr>' + head.map(function(){ return '<th></th>'; }).join('') + '</tr></thead><tbody></tbody>';
    tbl.innerHTML = h;
    var ths = tbl.querySelectorAll('th'); head.forEach(function(x, i){ ths[i].textContent = x; });
    var tb = tbl.tBodies[0], frag = document.createDocumentFragment();
    rows.forEach(function(r){ var tr = document.createElement('tr'); r.forEach(function(c, i){ var td = document.createElement('td'); td.textContent = c; if (i > 0 && /^[₹−\-\d]/.test(String(c))) td.className = 'n'; tr.appendChild(td); }); frag.appendChild(tr); });
    tb.appendChild(frag);
  }
  function remember(key, ids, onLoad){
    try { var o = JSON.parse(localStorage.getItem(key) || '{}'); ids.forEach(function(id){ var el = document.getElementById(id); if (el && o[id] != null) { if (el.type === 'checkbox' || el.type === 'radio') el.checked = o[id]; else el.value = o[id]; } }); } catch(e){}
    function save(){ try { var o = {}; ids.forEach(function(id){ var el = document.getElementById(id); if (el) o[id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value; }); localStorage.setItem(key, JSON.stringify(o)); } catch(e){} }
    ids.forEach(function(id){ var el = document.getElementById(id); if (el) { el.addEventListener('input', function(){ save(); onLoad(); }); el.addEventListener('change', function(){ save(); onLoad(); }); } });
    onLoad();
  }
  function csv(name, head, rows){
    var esc = function(v){ v = String(v).replace(/[₹,]/g, ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var text = '﻿' + [head].concat(rows).map(function(r){ return r.map(esc).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* Income tax, FY 2026-27 (AY 2027-28). taxable = income after all deductions. */
  var SLABS = {
    'new': [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [Infinity, .30]],
    'old': [[250000, 0], [500000, .05], [1000000, .20], [Infinity, .30]],
    'old60': [[300000, 0], [500000, .05], [1000000, .20], [Infinity, .30]],
    'old80': [[500000, 0], [1000000, .20], [Infinity, .30]]
  };
  function slabTax(taxable, slabs){
    var tax = 0, prev = 0, rows = [];
    for (var i = 0; i < slabs.length; i++) {
      var top = slabs[i][0], part = Math.max(0, Math.min(taxable, top) - prev);
      if (part > 0 || i === 0) rows.push({ from: prev, to: top, rate: slabs[i][1], amount: part, tax: part * slabs[i][1] });
      tax += part * slabs[i][1]; prev = top; if (taxable <= top) break;
    }
    return { tax: tax, rows: rows };
  }
  function tax(taxable, regime, age){
    taxable = Math.max(0, Math.floor(taxable));
    var key = regime === 'new' ? 'new' : (age >= 80 ? 'old80' : age >= 60 ? 'old60' : 'old');
    var st = slabTax(taxable, SLABS[key]), base = st.tax, rebate = 0;
    if (regime === 'new') {
      if (taxable <= 1200000) rebate = base;
      else if (base > taxable - 1200000) rebate = base - (taxable - 1200000);   // marginal relief
    } else if (taxable <= 500000) rebate = Math.min(base, 12500);
    var after = base - rebate, sr = 0;
    if (taxable > 50000000) sr = regime === 'new' ? .25 : .37; else if (taxable > 20000000) sr = .25; else if (taxable > 10000000) sr = .15; else if (taxable > 5000000) sr = .10;
    var surcharge = after * sr, cess = (after + surcharge) * .04;
    return { taxable: taxable, slabs: st.rows, base: base, rebate: rebate, surcharge: surcharge, surchargeRate: sr, cess: cess, total: Math.round(after + surcharge + cess) };
  }
  window.DC = { inr: inr, words: words, num: num, tiles: tiles, split: split, table: table, remember: remember, csv: csv, tax: tax, STD: { 'new': 75000, 'old': 50000 } };
})();
