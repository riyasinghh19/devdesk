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
    copy: function(text){
      if (navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).then(function(){ return true; }, function(){ return false; });
      }
      return Promise.resolve(false);
    }
  };
})();
