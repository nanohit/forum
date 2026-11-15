(function () {
  var F = window.FORUM, root = document.getElementById('app'), CACHE = 'forum:content:v1';
  var PAGE = document.body.getAttribute('data-page') || 'main';
  var HOME = PAGE === 'main' ? './' : '../', SPK = HOME + 'speakers/';
  var A = (window.__assets && window.__assets.cdn) || 'assets/';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function list(a) { return Array.isArray(a) ? a : []; }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function on(b) { return b && !b.hidden; }
  function head(t, extra) {
    return t ? '<h2 class="h2">' + esc(t) + (extra ? ' <span class="h2-sub">' + esc(extra) + '</span>' : '') + '</h2>' : '';
  }
  function slug(s) { return 's-' + String(s || '').toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, ''); }
  function initials(n) { return String(n || '').split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase(); }
  function avatar(p, cls) {
    return '<span class="' + cls + '">' + (p.photo
      ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<i>' + esc(initials(p.name)) + '</i>') + '</span>';
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

  function nav(d) {
    var h = d.hero || {}, sp = d.speakers || {};
    return '<nav class="nav"><div class="wrap nav-in">' +
      '<a class="brand" href="' + HOME + '"><img src="' + A + 'mark.webp" alt="" width="34" height="34">' + esc(h.title) + '</a>' +
      '<span class="links"><a href="' + HOME + '"' + (PAGE === 'main' ? ' class="on"' : '') + '>Программа</a>' +
      (on(sp) && list(sp.items).length ? '<a href="' + SPK + '"' + (PAGE === 'speakers' ? ' class="on"' : '') + '>' + esc(sp.title || 'Спикеры') + '</a>' : '') +
      '</span></div></nav>';
  }

  function footer(ft) {
    if (!on(ft)) return '';
    return '<footer class="foot"><div class="wrap">' +
      '<ul class="metas">' + meta('date', ft.date) + meta('time', ft.time) + meta('place', ft.address, ft.city) + '</ul>' +
      (ft.year ? '<p class="year">' + esc(ft.year) + '</p>' : '') + '</div></footer>';
  }

  function mainPage(d) {
    var h = d.hero || {}, ab = d.about || {}, sc = d.schedule || {}, au = d.audience || {},
      se = d.sections || {}, be = d.benefits || {}, pr = d.price || {}, sp = d.speakers || {};
    var known = {};
    if (on(sp)) list(sp.items).forEach(function (p) { if (p.name) known[p.name.trim()] = 1; });
    var html = '';

    if (on(h)) {
      html += '<header class="hero"><div class="wrap hero-grid"><div>' +
        (h.kicker ? '<p class="kicker">' + esc(h.kicker) + '</p>' : '') +
        '<h1 class="h1">' + esc(h.title) + '</h1>' +
        (h.lead ? '<p class="lead">' + nl(h.lead) + '</p>' : '') +
        (h.text ? '<p class="text">' + nl(h.text) + '</p>' : '') +
        '<ul class="metas">' + meta('date', h.date) + meta('time', h.time) + meta('place', h.address, h.venue) + '</ul></div>' +
        '<img class="hero-logo" src="' + A + 'logo.webp" alt="' + esc(h.title) + '" width="240" height="267"></div>' +
        (list(h.organizers).length ? '<div class="wrap"><ul class="orgs">' + list(h.organizers).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>' : '') +
        '</header>';
    }

    if (on(ab) && (ab.text || ab.title)) {
      html += '<section class="sec about"><div class="wrap about-grid">' +
        '<div class="about-tag"><span class="about-title">' + esc(ab.title) + '</span>' +
        '<span>' + esc(ab.city) + '</span><span>' + esc(ab.date) + '</span></div>' +
        '<p class="about-text">' + nl(ab.text) + '</p></div></section>';
    }

    if (on(sc) && list(sc.items).length) {
      html += '<section class="sec" id="schedule"><div class="wrap">' + head(sc.title, sc.day) +
        '<ol class="timeline">' + list(sc.items).map(function (i) {
          return '<li><span class="t">' + esc(i.time) + '</span><span class="w"><b>' + esc(i.title) + '</b>' +
            (i.note ? '<small>' + esc(i.note) + '</small>' : '') + '</span></li>';
        }).join('') + '</ol></div></section>';
    }

    if (on(se) && list(se.lines).length) {
      html += '<section class="sec alt" id="sections"><div class="wrap">' + head(se.title) +
        list(se.lines).map(function (l) {
          return '<div class="line"><div class="line-head"><h3>' + esc(l.name) + '</h3>' +
            (l.time ? '<span class="pill">' + esc(l.time) + '</span>' : '') + '</div>' +
            '<div class="groups">' + list(l.groups).map(function (g) {
              return '<article class="card"><h4>' + esc(g.title) + '</h4><ul>' +
                list(g.people).map(function (p) {
                  return '<li>' + (known[p.trim()] ? '<a href="' + SPK + '#' + slug(p) + '">' + esc(p) + '</a>' : esc(p)) + '</li>';
                }).join('') + '</ul></article>';
            }).join('') + '</div></div>';
        }).join('') + '</div></section>';
    }

    if (on(sp) && list(sp.items).length) {
      html += '<section class="sec" id="speakers"><div class="wrap">' + head(sp.title) +
        (sp.intro ? '<p class="intro">' + nl(sp.intro) + '</p>' : '') +
        '<a class="faces" href="' + SPK + '">' + list(sp.items).slice(0, 10).map(function (p) { return avatar(p, 'face'); }).join('') +
        (sp.items.length > 10 ? '<span class="face more"><i>+' + (sp.items.length - 10) + '</i></span>' : '') + '</a>' +
        '<a class="btn" href="' + SPK + '">Все спикеры и темы докладов →</a></div></section>';
    }

    var twin = [au, be].filter(function (b) { return on(b) && list(b.items).length; });
    if (twin.length) {
      html += '<section class="sec' + (on(sp) && list(sp.items).length ? ' alt' : '') + '"><div class="wrap twin">' + twin.map(function (b) {
        return '<div>' + head(b.title) + '<ul class="ticks">' + list(b.items).map(function (i) {
          return '<li>' + esc(i) + '</li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div></section>';
    }

    list(d.extra).filter(on).forEach(function (x) {
      html += '<section class="sec"><div class="wrap">' + head(x.title) +
        (x.text ? '<p class="about-text extra-text">' + nl(x.text) + '</p>' : '') +
        (list(x.items).length ? '<ul class="ticks">' + list(x.items).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : '') +
        '</div></section>';
    });

    if (on(pr) && list(pr.items).length) {
      html += '<section class="sec alt" id="price"><div class="wrap">' + head(pr.title) +
        '<div class="prices">' + list(pr.items).map(function (p) {
          return '<div class="price"><b>' + esc(p.value) + '</b>' + (p.note ? '<span>' + nl(p.note) + '</span>' : '') + '</div>';
        }).join('') + '</div></div></section>';
    }
    return html;
  }

  function speakersPage(d) {
    var sp = d.speakers || {}, h = d.hero || {};
    document.title = (sp.title || 'Спикеры') + ' — ' + (h.title || '');
    return '<header class="page-head"><div class="wrap"><p class="kicker">' + esc(h.title) + ' · ' + esc(h.date) + '</p>' +
      '<h1 class="h1 sm">' + esc(sp.title || 'Спикеры') + '</h1>' +
      (sp.intro ? '<p class="text">' + nl(sp.intro) + '</p>' : '') + '</div></header>' +
      '<section class="sec"><div class="wrap speakers">' + list(sp.items).map(function (p) {
        return '<article class="spk" id="' + slug(p.name) + '">' + avatar(p, 'spk-photo') + '<div class="spk-body">' +
          (p.section ? '<span class="pill">' + esc(p.section) + '</span>' : '') +
          '<h3>' + esc(p.name) + '</h3>' +
          (p.role ? '<p class="spk-role">' + nl(p.role) + '</p>' : '') +
          (p.topic ? '<div class="spk-topic"><small>Тема доклада</small>' + nl(p.topic) + '</div>' : '') +
          '</div></article>';
      }).join('') + '</div></section>';
  }

  function render(d) {
    var h = d.hero || {};
    if (PAGE === 'main' && h.title) document.title = h.title + (h.kicker ? ' — ' + h.kicker : '');
    root.innerHTML = nav(d) + (PAGE === 'speakers' ? speakersPage(d) : mainPage(d)) + footer(d.footer || {});
    root.classList.add('ready');
    if (location.hash && !render.jumped) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) {
        render.jumped = true; t.classList.add('hl');
        setTimeout(function () { t.scrollIntoView({ block: 'center' }); }, 60);
      }
    }
  }

  var fav = document.createElement('link');
  fav.rel = 'icon'; fav.href = A + 'favicon.png';
  document.head.appendChild(fav);

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
