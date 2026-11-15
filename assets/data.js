/* Конфигурация и исходный контент сайта.
   Публичный токен — только чтение ключей forum:* (ACL-пользователь forum_read).
   Токен записи и ключ imgbb зашифрованы логином/паролем админа (AES-GCM + PBKDF2). */
window.FORUM = {
  url: 'https://devoted-viper-201621.upstash.io',
  readToken: 'gwAAAAAAAxOVAAIKQHAyZm9ydW1fcmVhZDSN8rtKzk51KXXkAHXoml8Q6JtnJNnwHraYUAVDU96rKpcgCBrwJiPYyKjNF53Qty32Ajm2ykZwjsMXswA_zYk',
  secretsEnc: {"salt":"5F9Qs6ermamI404I90DsKw==","iv":"w52VN9r9HUvjtba6","ct":"ruJCQgWWNUZfaFVPCNiFQSsvK92SyBDkskJF6X7iknaViaClYdfv4svb22EDZ3XdCJK+WBln5yZieLrw0yyeCbI5NVWWTMtZqahZUx87VTS07e2DTpYmJ+rANXlkizDRIE0BR5FBJ7yx/CVdHcZmTAZM+hX0gt15EpbclVgMvEfuSWoQjxXdPmr20sj44tQ115PdFGzGPLA5ZiJ19fAkvyknly8LNzhdpbVpPGPNCkFm7PYL9Tixc5CeNMZgOWbsow=="},
  key: 'forum:content',

  get: function () {
    return fetch(this.url + '/get/' + this.key, {
      headers: { Authorization: 'Bearer ' + this.readToken }, cache: 'no-store'
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.error) throw new Error(j.error);
      return j.result ? JSON.parse(j.result) : null;
    });
  },

  defaults: {
    hero: {
      kicker: 'Городской Психологический Форум',
      title: 'Психосфера',
      lead: 'Создаём платформу для обмена опытом и обсуждения актуальных вопросов психологии',
      text: 'Объединяем психологов, психотерапевтов и других специалистов в области психологии для развития профессиональных навыков и компетенций',
      date: '22 ноября 2025 / Суббота',
      time: '09:00 – 16:30',
      address: 'Ленина, 26',
      venue: 'Институт гуманитарного образования',
      organizers: [
        'Кафедра психологии Института гуманитарного образования МГТУ им. Г.И. Носова',
        'Магнитогорское гештальт сообщество'
      ]
    },
    about: {
      title: 'Психосфера',
      city: 'Магнитогорск',
      date: '22 ноября 2025',
      text: 'Мы стремимся создать единую городскую площадку для профессионального общения психологов, свободное коллегиальное пространство для представителей разных психологических направлений'
    },
    schedule: {
      title: 'Расписание форума',
      day: '22 ноября / Суббота',
      items: [
        { time: '09:00 – 10:00', title: 'Регистрация', note: '' },
        { time: '10:00 – 10:30', title: 'Открытие форума', note: 'Пленарное заседание' },
        { time: '10:45 – 12:45', title: 'Работа секций', note: '' },
        { time: '12:45 – 13:30', title: 'Обед', note: '' },
        { time: '13:45 – 15:15', title: 'Работа секций', note: '' },
        { time: '15:30 – 16:30', title: 'Завершение форума', note: '' }
      ]
    },
    audience: {
      title: 'Кому будет интересен форум',
      items: [
        'Психологи различных направлений',
        'Психотерапевты',
        'Представители смежных областей',
        'Студенты Института гуманитарного образования'
      ]
    },
    sections: {
      title: 'Основные секции форума',
      lines: [
        {
          name: 'Первая линейка', time: '10:45 – 12:45',
          groups: [
            { title: 'Тело, мозг и психика', people: ['Овчинникова Татьяна', 'Нурисламов Денис', 'Потемкина Ольга'] },
            { title: 'Психология в бизнесе', people: ['Липай Наталья', 'Досаев Рустам', 'Ахмадеева Наталья', 'Ушачева Елена'] },
            { title: 'Психология искусства', people: ['Соловьева Инна', 'Тельнова Владислава', 'Гущанская Ольга'] },
            { title: 'Психология в спорте', people: ['Желнина Анна', 'Перелыгина Ирина', 'Гревцева Евгения'] },
            { title: 'Профессиональная поддержка психолога', people: ['Помазанова Анна', 'Куликова Светлана'] }
          ]
        },
        {
          name: 'Вторая линейка', time: '12:45 – 14:15',
          groups: [
            { title: 'Психоаналитический подход в терапии', people: ['Разумова Елена', 'Мельников Вадим'] },
            { title: 'Психология детско-родительских отношений', people: ['Колкатаева Наталья', 'Приемко Ирина'] },
            { title: 'Телесно-ориентированная терапия', people: ['Андреева Ольга', 'Жарова Ксения'] },
            { title: 'Психология в работе по проблемам отношений', people: ['Колобова Наташа', 'Миронова Ирина'] }
          ]
        }
      ]
    },
    benefits: {
      title: 'Что вы получите на форуме',
      items: [
        'Доклады и лекции практикующих психологов',
        'Знакомство с опытом коллег из различных направлений',
        'Возможности для профессионального сотрудничества',
        'Сертификат'
      ]
    },
    price: {
      title: 'Стоимость участия',
      items: [
        { value: '1200 руб.', note: '' },
        { value: 'бесплатно', note: 'для студентов дневных отделений Института гуманитарного образования' }
      ]
    },
    speakers: {
      title: 'Спикеры',
      intro: '',
      items: []
    },
    extra: [],
    footer: {
      date: '22 ноября / Суббота',
      time: '9:00 – 16:30',
      address: 'Ленина, 26',
      city: 'Магнитогорск',
      year: 'Магнитогорск 2026'
    }
  }
};

// Стартовый список спикеров — ведущие секций (фото, регалии и темы заполняются в админке)
(function (d) {
  d.sections.lines.forEach(function (l) {
    l.groups.forEach(function (g) {
      g.people.forEach(function (n) {
        d.speakers.items.push({ photo: '', name: n, role: '', topic: '', section: g.title });
      });
    });
  });
})(window.FORUM.defaults);
