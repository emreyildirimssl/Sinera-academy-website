/* sinerasaleslab.academy — runtime for the generated page.
   Renders the dynamic regions from Claude Design templates and handles the form. */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lznuccgxjjonbjbhdzup.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oHrQgz8SfAD3eJuW8q9fRg_VQJK1hcX';

  // ---- minimal DCLogic shim ----
  var pending = false;
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, p);
    if (!pending) { pending = true; Promise.resolve().then(function () { pending = false; render(); }); }
  };

  var Component = window.DC_COMPONENT(DCLogic);
  var comp = new Component({ accent: '#E3000E' });

  // ---- string template renderer ----
  var fns = [];
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lookup(expr, scope) {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    var parts = expr.split('.');
    var v = scope[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function blockEnd(s, tag, start) {
    var re = new RegExp('<' + tag + '\\b|</' + tag + '>', 'g');
    re.lastIndex = start; var depth = 0, m;
    while ((m = re.exec(s))) {
      depth += m[0].charAt(1) === '/' ? -1 : 1;
      if (depth === 0) return re.lastIndex;
    }
    throw new Error('unbalanced ' + tag);
  }
  function fill(tpl, scope) {
    var out = '', i = 0, re = /<(sc-for|sc-if)\b([^>]*)>/g, m;
    while ((m = re.exec(tpl))) {
      var end = blockEnd(tpl, m[1], m.index);
      out += holes(tpl.slice(i, m.index), scope);
      var inner = tpl.slice(m.index + m[0].length, end - ('</' + m[1] + '>').length);
      if (m[1] === 'sc-for') {
        var list = lookup(/list="\{\{([^}]*)\}\}"/.exec(m[2])[1], scope) || [];
        var as = /as="([^"]+)"/.exec(m[2])[1];
        for (var k = 0; k < list.length; k++) {
          var sc = Object.create(scope); sc[as] = list[k]; out += fill(inner, sc);
        }
      } else if (lookup(/value="\{\{([^}]*)\}\}"/.exec(m[2])[1], scope)) {
        out += fill(inner, scope);
      }
      i = end; re.lastIndex = end;
    }
    return out + holes(tpl.slice(i), scope);
  }
  function holes(s, scope) {
    return s
      .replace(/onClick="\{\{([^}]*)\}\}"/g, function (_, e) {
        var f = lookup(e, scope); fns.push(f); return 'data-fn="' + (fns.length - 1) + '"';
      })
      .replace(/disabled="\{\{([^}]*)\}\}"/g, function (_, e) { return lookup(e, scope) ? 'disabled' : ''; })
      .replace(/\{\{([^}]*)\}\}/g, function (_, e) { return esc(lookup(e, scope)); });
  }

  // ---- render ----
  var regions = Array.prototype.slice.call(document.querySelectorAll('dc-region'));
  var last = [];
  function render() {
    var vals = comp.renderVals();
    fns = [];
    regions.forEach(function (el) {
      var r = +el.getAttribute('data-r');
      var html = fill(window.DC_REGIONS[r], vals);
      var key = html.replace(/data-fn="\d+"/g, '');
      if (key !== last[r]) { el.innerHTML = html; last[r] = key; }
      else { // keep DOM (focus); just renumber handlers
        var n = 0, ids = (html.match(/data-fn="\d+"/g) || []);
        el.querySelectorAll('[data-fn]').forEach(function (b) { b.setAttribute('data-fn', ids[n++].slice(9, -1)); });
      }
    });
    var slide = comp.state.slide;
    document.querySelectorAll('[data-panel]').forEach(function (p) {
      var on = +p.getAttribute('data-panel') === slide;
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      p.style.opacity = on ? '1' : '0';
      p.style.visibility = on ? 'visible' : 'hidden';
    });
    var no = document.querySelector('[data-slide-no]');
    if (no) no.textContent = String(slide + 1);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-fn]');
    if (!t || t.disabled) return;
    var f = fns[+t.getAttribute('data-fn')];
    if (typeof f === 'function') f(e);
  });

  render();
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && comp.componentDidMount) comp.componentDidMount();

  // ---- application form ----
  var form = document.getElementById('application-form');
  if (!form) return;
  var errBox = form.querySelector('[data-form-error]');
  var btn = form.querySelector('button[type="submit"]');
  function showError(msg) { errBox.textContent = msg; errBox.hidden = false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var fd = new FormData(form);
    if ((fd.get('website') || '').trim()) { done(); return; } // honeypot
    var note = (fd.get('note') || '').trim();
    var payload = {
      name: fd.get('name').trim(),
      company: fd.get('company').trim(),
      role: fd.get('role').trim(),
      team_size: fd.get('team_size'),
      sector: fd.get('sector'),
      email: fd.get('email').trim(),
      phone: fd.get('phone').trim(),
      note: note || null,
      privacy_ack: !!fd.get('privacy'),
      followup_consent: !!fd.get('followup_consent')
    };
    btn.disabled = true; var label = btn.textContent; btn.textContent = 'Gönderiliyor…';
    fetch(SUPABASE_URL + '/rest/v1/site_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      done();
    }).catch(function () {
      btn.disabled = false; btn.textContent = label;
      showError('Başvurunuz gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin ya da iletisim@sinerasaleslab.academy adresine yazın.');
    });
  });

  function done() {
    document.querySelector('[data-form-wrap]').hidden = true;
    var ok = document.querySelector('[data-form-ok]');
    ok.hidden = false;
    ok.setAttribute('tabindex', '-1'); ok.focus();
  }
})();
