/* Shared behaviour: theme toggle, copy helper, year. */
(function(){
  var root = document.documentElement;
  try { var t = localStorage.getItem('tb-theme'); if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); } catch(e){}
  function isDark(){
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function label(btn){ btn.textContent = isDark() ? 'Light mode' : 'Dark mode'; }
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('themeBtn'), lamp = document.getElementById('lampBtn');
    function toggle(){
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tb-theme', next); } catch(e){}
      if (btn) label(btn);
    }
    if (btn){ label(btn); btn.addEventListener('click', toggle); }
    if (lamp) lamp.addEventListener('click', toggle);
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    /* "insert cartridge" before opening a tool */
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('a.cart.live').forEach(function(c){
      c.addEventListener('click', function(e){
        if (still || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault(); c.classList.add('inserting');
        setTimeout(function(){ location.href = c.href; }, 320);
      });
    });
  });
  window.TB = {
    /* ₹ in the Indian grouping: 12,34,567 */
    inr: function(n, dp){ if (!isFinite(n)) return '—'; dp = dp || 0; return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp }); },
    num: function(n, dp){ if (!isFinite(n)) return '—'; return Number(n).toLocaleString('en-IN', { maximumFractionDigits: dp == null ? 2 : dp }); },
    /* short form: 1.2 Cr, 45.6 L, 12.3 K */
    short: function(n){ var a = Math.abs(n); return a >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : a >= 1e5 ? '₹' + (n / 1e5).toFixed(2) + ' L' : '₹' + Math.round(n).toLocaleString('en-IN'); },
    save: function(key, obj){ try { localStorage.setItem(key, JSON.stringify(obj)); } catch(e){} },
    load: function(key){ try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(e){ return null; } },
    download: function(blob, name){ var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 800); },
    /* links a number box to a slider so they move together */
    pair: function(numId, rangeId, onChange){
      var n = document.getElementById(numId), r = document.getElementById(rangeId);
      n.addEventListener('input', function(){ if (n.value !== '' && +n.value >= +r.min && +n.value <= +r.max) r.value = n.value; onChange(); });
      r.addEventListener('input', function(){ n.value = r.value; onChange(); });
    },
    copy: function(text){
      if (navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).then(function(){ return true; }, function(){ return false; });
      }
      return Promise.resolve(false);
    }
  };
})();
