/* DevDesk Pro checkout: Razorpay on the page, verification on the payment server.
   API is the payment server's address. Leave it empty until the server is deployed;
   the pages then say payments are opening soon instead of failing. */
(function(){
  var API = "https://devdesk-pay.riyasingh10x.workers.dev";
  var PRICE = "₹169";
  var USES = 5;

  function store(product, value){
    try {
      if (value === undefined) return JSON.parse(sessionStorage.getItem('dd-pay-' + product) || 'null');
      if (value === null) sessionStorage.removeItem('dd-pay-' + product);
      else sessionStorage.setItem('dd-pay-' + product, JSON.stringify(value));
    } catch(e){ return null; }
  }

  function post(path, body){
    return fetch(API.replace(/\/$/, '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){
        if (!r.ok) { var e = new Error(j.error || 'Something went wrong. Please try again.'); e.status = r.status; throw e; }
        return j;
      }); }, function(){ throw new Error("Couldn't reach the payment server. Check your connection and try again."); });
  }

  var checkoutLoading = null;
  function loadCheckout(){
    if (window.Razorpay) return Promise.resolve();
    if (checkoutLoading) return checkoutLoading;
    checkoutLoading = new Promise(function(res, rej){
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = res; s.onerror = function(){ checkoutLoading = null; rej(new Error("Couldn't load the payment window. Check your connection and try again.")); };
      document.head.appendChild(s);
    });
    return checkoutLoading;
  }

  function buy(product, prefill){
    return post('/order', { product: product }).then(function(order){
      return loadCheckout().then(function(){
        return new Promise(function(resolve, reject){
          var rz = new window.Razorpay({
            key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.order_id,
            name: 'DevDesk', description: order.name + ' · ' + PRICE,
            prefill: prefill || {}, theme: { color: '#2F6BFF' },
            handler: function(resp){ store(product, resp); resolve(resp); },
            modal: { ondismiss: function(){ var e = new Error('Payment cancelled. You have not been charged.'); e.cancelled = true; reject(e); } }
          });
          rz.on('payment.failed', function(r){ reject(new Error((r && r.error && r.error.description) || 'The payment failed. You have not been charged.')); });
          rz.open();
        });
      });
    });
  }

  /* Run a paid action. Re-uses this tab's earlier payment while it still has uses left. */
  function run(product, path, body, prefill){
    var saved = store(product);
    var attempt = function(payment){ return post(path, Object.assign({ payment: payment }, body)); };
    if (saved) {
      return attempt(saved).catch(function(e){
        if (e.status === 402) { store(product, null); return buy(product, prefill).then(attempt); }
        throw e;
      });
    }
    return buy(product, prefill).then(attempt);
  }

  window.DDPay = {
    ready: function(){ return !!API; },
    price: PRICE, uses: USES,
    hasPaid: function(product){ return !!store(product); },
    run: run
  };
})();
