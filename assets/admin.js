(function () {
  var F = window.FORUM, app = document.getElementById('app'), TK = 'forum:admin:token';

  // Схема редактора: [ключ, подпись, тип].
  // Тип: 'str' | 'text' | 'lines' | 'time' | 'check' | 'photo' | {list: [...поля], add: {...}, item: 'подпись'}
  var HIDE = ['hidden', 'Скрыть этот блок на сайте', 'check'];
  var SCHEMA = [
    ['hero', 'Шапка', [
      ['kicker', 'Надзаголовок'], ['title', 'Название'], ['lead', 'Подзаголовок', 'text'], ['text', 'Описание', 'text'],
      ['date', 'Дата'], ['time', 'Время'], ['address', 'Адрес'], ['venue', 'Место'],
      ['organizers', 'Организаторы — по одному на строку', 'lines']
    ]],
    ['about', 'О форуме', [['title', 'Заголовок'], ['city', 'Город'], ['date', 'Дата'], ['text', 'Текст', 'text']]],
    ['schedule', 'Расписание', [
      ['title', 'Заголовок'], ['day', 'День'],
      ['items', 'Пункты расписания', { item: 'Пункт', add: { time: '', title: '', note: '' },
        list: [['time', 'Время', 'time'], ['title', 'Событие'], ['note', 'Примечание']] }]
    ]],
    ['sections', 'Секции', [
      ['title', 'Заголовок'],
      ['lines', 'Линейки', { item: 'Линейка', add: { name: '', time: '', groups: [] }, list: [
        ['name', 'Название'], ['time', 'Время', 'time'],
        ['groups', 'Секции', { item: 'Секция', add: { title: '', people: [] }, list: [
          ['title', 'Название секции'], ['people', 'Ведущие — по одному на строку', 'lines']
        ] }]
      ] }]
    ]],
    ['audience', 'Кому интересен форум', [['title', 'Заголовок'], ['items', 'Пункты — по одному на строку', 'lines']]],
    ['benefits', 'Что вы получите', [['title', 'Заголовок'], ['items', 'Пункты — по одному на строку', 'lines']]],
    ['price', 'Стоимость', [
      ['title', 'Заголовок'],
      ['items', 'Варианты', { item: 'Вариант', add: { value: '', note: '' }, list: [['value', 'Цена'], ['note', 'Для кого', 'text']] }]
    ]],
    ['speakers', 'Спикеры', [
      ['title', 'Заголовок'], ['intro', 'Вступление (необязательно)', 'text'],
      ['items', 'Спикеры', { item: 'Спикер', add: { photo: '', name: '', role: '', topic: '', section: '' }, list: [
        ['photo', 'Фото', 'photo'], ['name', 'Фамилия Имя'], ['section', 'Секция'],
        ['role', 'Кто это: должность, регалии', 'text'], ['topic', 'Тема доклада', 'text']
      ] }]
    ]],
    ['', 'Дополнительные блоки', [
      ['extra', 'Свои блоки — появляются перед стоимостью', { item: 'Блок', add: { title: '', text: '', items: [] }, list: [
        HIDE, ['title', 'Заголовок'], ['text', 'Текст', 'text'], ['items', 'Пункты списка — по одному на строку', 'lines']
      ] }]
    ]],
    ['footer', 'Подвал', [['date', 'Дата'], ['time', 'Время'], ['address', 'Адрес'], ['city', 'Город'], ['year', 'Нижняя строка']]]
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }

  /* ---------- вход ---------- */
  function decrypt(login, pass) {
    var enc = F.secretsEnc, s = crypto.subtle;
    return s.importKey('raw', new TextEncoder().encode(login + ':' + pass), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return s.deriveKey({ name: 'PBKDF2', salt: b64(enc.salt), iterations: 250000, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) { return s.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, key, b64(enc.ct)); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }

  function loginView() {
    app.innerHTML = '';
    var f = el('form', 'login');
    f.innerHTML = '<h1>Психосфера</h1><p>Вход для администратора</p>' +
      '<label>Логин<input name="l" autocomplete="username" required></label>' +
      '<label>Пароль<input name="p" type="password" autocomplete="current-password" required></label>' +
      '<button class="btn primary" type="submit">Войти</button><p class="err"></p>';
    f.onsubmit = function (e) {
      e.preventDefault();
      var btn = f.querySelector('button'), err = f.querySelector('.err');
      btn.disabled = true; err.textContent = '';
      decrypt(f.l.value.trim(), f.p.value).then(function (keys) {
        sessionStorage.setItem(TK, JSON.stringify(keys));
        editorView(keys);
      }).catch(function () {
        err.textContent = 'Неверный логин или пароль';
        btn.disabled = false;
      });
    };
    app.appendChild(f);
    f.l.focus();
  }

  /* ---------- редактор ---------- */
  var data, keys, dirty = false, saveBtn, status;

  function touch() {
    dirty = true;
    saveBtn.disabled = false;
    status.textContent = 'Есть несохранённые изменения';
    status.className = 'status warn';
  }

  function field(obj, key, label, type) {
    if (type === 'check') {
      var c = el('label', 'check'), cb = el('input');
      cb.type = 'checkbox'; cb.checked = !!obj[key];
      cb.onchange = function () { obj[key] = cb.checked; touch(); };
      c.appendChild(cb); c.appendChild(el('span', null, label));
      return c;
    }
    if (type === 'photo') return photoField(obj, key);
    var w = el('label', 'field' + (type === 'time' ? ' narrow' : ''));
    w.appendChild(el('span', null, label));
    var input;
    if (type === 'text' || type === 'lines') {
      input = el('textarea');
      input.value = type === 'lines' ? (obj[key] || []).join('\n') : (obj[key] || '');
      autosize(input);
    } else {
      input = el('input');
      input.value = obj[key] || '';
      if (type === 'time') input.placeholder = '10:00 – 11:00';
    }
    input.oninput = function () {
      obj[key] = type === 'lines'
        ? input.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
        : input.value;
      if (input.tagName === 'TEXTAREA') fit(input);
      touch();
    };
    w.appendChild(input);
    return w;
  }
  /* фото: сжимаем в браузере и грузим на imgbb */
  function shrink(file, max) {
    return new Promise(function (ok, fail) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', 0.86).split(',')[1]);
      };
      img.onerror = function () { fail(new Error('не удалось прочитать файл')); };
      img.src = url;
    });
  }
  function photoField(obj, key) {
    var w = el('div', 'photo'), pic = el('div', 'photo-pic'), side = el('div', 'photo-side');
    var up = el('label', 'btn ghost small', 'Загрузить фото'), file = el('input'), del = el('button', 'btn ghost small', 'Убрать');
    var msg = el('span', 'photo-msg');
    file.type = 'file'; file.accept = 'image/*'; file.hidden = true; up.appendChild(file); del.type = 'button';
    function show() {
      pic.innerHTML = obj[key] ? '<img src="' + obj[key] + '" alt="">' : '<span>нет фото</span>';
      del.hidden = !obj[key];
    }
    file.onchange = function () {
      var f = file.files[0]; if (!f) return;
      msg.textContent = 'Загружаю…'; up.classList.add('busy');
      shrink(f, 900).then(function (b64) {
        var fd = new FormData(); fd.append('image', b64);
        return fetch('https://api.imgbb.com/1/upload?key=' + keys.imgbb, { method: 'POST', body: fd });
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.success) throw new Error((j.error && j.error.message) || 'ошибка imgbb');
        obj[key] = j.data.url; show(); touch(); msg.textContent = 'Готово — не забудьте сохранить';
      }).catch(function (e) { msg.textContent = 'Ошибка: ' + e.message; })
        .then(function () { up.classList.remove('busy'); file.value = ''; });
    };
    del.onclick = function () { obj[key] = ''; show(); touch(); msg.textContent = ''; };
    show();
    side.appendChild(up); side.appendChild(del); side.appendChild(msg);
    w.appendChild(pic); w.appendChild(side);
    return w;
  }

  function fit(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  function autosize(t) { t.rows = 2; requestAnimationFrame(function () { fit(t); }); }

  function fields(box, obj, spec) {
    var row = null;
    spec.forEach(function (f) {
      var type = f[2] || 'str';
      if (typeof type === 'object') { row = null; box.appendChild(listEditor(obj, f[0], f[1], type)); return; }
      // короткие поля складываем в строку по два
      if (type === 'str' || type === 'time') {
        if (!row || row.children.length >= 2) { row = el('div', 'row'); box.appendChild(row); }
        row.appendChild(field(obj, f[0], f[1], type));
      } else { row = null; box.appendChild(field(obj, f[0], f[1], type)); }
    });
  }

  function listEditor(obj, key, label, spec) {
    if (!Array.isArray(obj[key])) obj[key] = [];
    var arr = obj[key], wrap = el('div', 'list'), items = el('div', 'items');
    wrap.appendChild(el('div', 'list-label', label));
    wrap.appendChild(items);

    function draw() {
      items.innerHTML = '';
      arr.forEach(function (it, i) {
        var card = el('div', 'item'), bar = el('div', 'item-bar');
        var nm = it.name || it.title || it.value || '';
        bar.appendChild(el('span', 'item-n', spec.item + ' ' + (i + 1) + (nm ? ' · ' + nm : '')));
        var tools = el('span', 'tools');
        [['↑', 'Выше', i > 0, function () { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); }],
         ['↓', 'Ниже', i < arr.length - 1, function () { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); }],
         ['✕', 'Удалить', true, function () {
           if (!confirm('Удалить «' + (it.title || it.name || it.value || it.time || spec.item) + '»?')) return false;
           arr.splice(i, 1);
         }]
        ].forEach(function (t) {
          var b = el('button', 'icon', t[0]);
          b.type = 'button'; b.title = t[1]; b.disabled = !t[2];
          b.onclick = function () { if (t[3]() !== false) { draw(); touch(); } };
          tools.appendChild(b);
        });
        bar.appendChild(tools);
        card.appendChild(bar);
        fields(card, it, spec.list);
        items.appendChild(card);
      });
    }
    draw();

    var add = el('button', 'btn ghost', '+ Добавить: ' + spec.item.toLowerCase());
    add.type = 'button';
    add.onclick = function () {
      arr.push(JSON.parse(JSON.stringify(spec.add)));
      draw(); touch();
      var last = items.lastChild && items.lastChild.querySelector('input,textarea');
      if (last) last.focus();
    };
    wrap.appendChild(add);
    return wrap;
  }

  function save() {
    saveBtn.disabled = true;
    status.textContent = 'Сохраняю…'; status.className = 'status';
    fetch(F.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + keys.upstash },
      body: JSON.stringify(['SET', F.key, JSON.stringify(data)])
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.error) throw new Error(j.error);
      dirty = false;
      status.textContent = 'Сохранено ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + ' — уже на сайте';
      status.className = 'status ok';
    }).catch(function (e) {
      saveBtn.disabled = false;
      status.textContent = 'Ошибка сохранения: ' + e.message;
      status.className = 'status err';
    });
  }

  function editorView(k) {
    keys = k;
    app.innerHTML = '<p class="loading">Загрузка…</p>';
    F.get().then(function (d) {
      data = d || JSON.parse(JSON.stringify(F.defaults));
      app.innerHTML = '';

      var top = el('header', 'top');
      top.appendChild(el('b', null, 'Редактор сайта'));
      status = el('span', 'status', 'Все изменения сохранены');
      top.appendChild(status);
      var acts = el('span', 'acts');
      var view = el('a', 'btn ghost', 'Открыть сайт');
      view.href = '../'; view.target = '_blank';
      var out = el('button', 'btn ghost', 'Выйти');
      out.onclick = function () { sessionStorage.removeItem(TK); loginView(); };
      saveBtn = el('button', 'btn primary', 'Сохранить');
      saveBtn.disabled = true;
      saveBtn.onclick = save;
      acts.appendChild(view); acts.appendChild(out); acts.appendChild(saveBtn);
      top.appendChild(acts);
      app.appendChild(top);

      var main = el('main', 'blocks');
      SCHEMA.forEach(function (s, i) {
        var obj = s[0] ? (data[s[0]] = data[s[0]] || {}) : data;
        if (!s[0] && !data.extra) data.extra = [];
        var det = el('details', 'block');
        if (i === 0) det.open = true;
        det.appendChild(el('summary', null, s[1]));
        var body = el('div', 'block-body');
        fields(body, obj, s[0] ? [HIDE].concat(s[2]) : s[2]);
        det.appendChild(body);
        main.appendChild(det);
      });
      app.appendChild(main);
    }).catch(function (e) {
      app.innerHTML = '<p class="loading">Не удалось загрузить данные: ' + e.message + '</p>';
    });
  }

  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && saveBtn && !saveBtn.disabled) {
      e.preventDefault(); saveBtn.click();
    }
  });

  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(TK)); } catch (e) {}
  saved && saved.upstash ? editorView(saved) : loginView();
})();
