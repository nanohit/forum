(function () {
  var F = window.FORUM, root = document.getElementById('app'), CACHE = 'forum:content:v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function list(a) { return Array.isArray(a) ? a : []; }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function head(t, extra) {
    return t ? '<h2 class="h2">' + esc(t) + (extra ? ' <span class="h2-sub">' + esc(extra) + '</span>' : '') + '</h2>' : '';
  }

  var ICON = {
    date: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    time: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    place: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>'
  };
  function meta(icon, a, b) {
    if (!a && !b) return '';
    return '<li class="meta"><span class="ic">' + ICON[icon] + '</span><span><b>' + esc(a) + '</b>' +
      (b ? '<small>' + esc(b) + '</small>' : '') + '</span></li>';
  }

  function render(d) {
    var h = d.hero || {}, ab = d.about || {}, sc = d.schedule || {}, au = d.audience || {},
      se = d.sections || {}, be = d.benefits || {}, pr = d.price || {}, ft = d.footer || {};
    if (h.title) document.title = h.title + (h.kicker ? ' — ' + h.kicker : '');

    var html = '';
    html += '<header class="hero"><div class="wrap">' +
      (h.kicker ? '<p class="kicker">' + esc(h.kicker) + '</p>' : '') +
      '<h1 class="h1">' + esc(h.title) + '</h1>' +
      (h.lead ? '<p class="lead">' + nl(h.lead) + '</p>' : '') +
      (h.text ? '<p class="text">' + nl(h.text) + '</p>' : '') +
      '<ul class="metas">' + meta('date', h.date) + meta('time', h.time) + meta('place', h.address, h.venue) + '</ul>' +
      (list(h.organizers).length ? '<ul class="orgs">' + list(h.organizers).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' : '') +
      '</div></header>';

    if (ab.text || ab.title) {
      html += '<section class="sec about"><div class="wrap about-grid">' +
        '<div class="about-tag"><span class="about-title">' + esc(ab.title) + '</span>' +
        '<span>' + esc(ab.city) + '</span><span>' + esc(ab.date) + '</span></div>' +
        '<p class="about-text">' + nl(ab.text) + '</p></div></section>';
    }

    if (list(sc.items).length) {
      html += '<section class="sec" id="schedule"><div class="wrap">' + head(sc.title, sc.day) +
        '<ol class="timeline">' + list(sc.items).map(function (i) {
          return '<li><span class="t">' + esc(i.time) + '</span><span class="w"><b>' + esc(i.title) + '</b>' +
            (i.note ? '<small>' + esc(i.note) + '</small>' : '') + '</span></li>';
        }).join('') + '</ol></div></section>';
    }

    if (list(se.lines).length) {
      html += '<section class="sec alt" id="sections"><div class="wrap">' + head(se.title) +
        list(se.lines).map(function (l) {
          return '<div class="line"><div class="line-head"><h3>' + esc(l.name) + '</h3>' +
            (l.time ? '<span class="pill">' + esc(l.time) + '</span>' : '') + '</div>' +
            '<div class="groups">' + list(l.groups).map(function (g) {
              return '<article class="card"><h4>' + esc(g.title) + '</h4><ul>' +
                list(g.people).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></article>';
            }).join('') + '</div></div>';
        }).join('') + '</div></section>';
    }

    var twin = [au, be].filter(function (b) { return list(b.items).length; });
    if (twin.length) {
      html += '<section class="sec"><div class="wrap twin">' + twin.map(function (b) {
        return '<div>' + head(b.title) + '<ul class="ticks">' + list(b.items).map(function (i) {
          return '<li>' + esc(i) + '</li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div></section>';
    }

    if (list(pr.items).length) {
      html += '<section class="sec alt" id="price"><div class="wrap">' + head(pr.title) +
        '<div class="prices">' + list(pr.items).map(function (p) {
          return '<div class="price"><b>' + esc(p.value) + '</b>' + (p.note ? '<span>' + nl(p.note) + '</span>' : '') + '</div>';
        }).join('') + '</div></div></section>';
    }

    html += '<footer class="foot"><div class="wrap">' +
      '<ul class="metas">' + meta('date', ft.date) + meta('time', ft.time) + meta('place', ft.address, ft.city) + '</ul>' +
      (ft.year ? '<p class="year">' + esc(ft.year) + '</p>' : '') + '</div></footer>';

    root.innerHTML = html;
    root.classList.add('ready');
  }

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE)); } catch (e) {}
  if (cached) render(cached);

  F.get().then(function (d) {
    d = d || F.defaults;
    var s = JSON.stringify(d);
    if (!cached || JSON.stringify(cached) !== s) render(d);
    try { localStorage.setItem(CACHE, s); } catch (e) {}
  }).catch(function () { if (!cached) render(F.defaults); });
})();
