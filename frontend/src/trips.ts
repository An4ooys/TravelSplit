export type Member = {
  name: string;
  username: string;
  role: string;
  initials: string;
};

export type Expense = {
  title: string;
  paidBy: string;
  date: string;
  amount: number;
};

export type TripBooking = {
  id: string;
  kind: 'Транспорт' | 'Жильё';
  title: string;
  details: string;
  when: string;
};

export type TripItineraryItem = {
  id: string;
  title: string;
  details: string;
  when: string;
};

export type Trip = {
  id: string;
  place: string;
  destination: string;
  timeZone: string;
  dates: string;
  duration: string;
  description: string;
  image: string;
  next: string;
  nextWhen: string;
  budget: number;
  members: Member[];
  expenses: Expense[];
  bookings: TripBooking[];
  itinerary: TripItineraryItem[];
};

export const trips: Trip[] = [
  {
    id: 'altai',
    place: 'Алтай',
    destination: 'Республика Алтай, Россия',
    timeZone: 'Asia/Barnaul',
    dates: '14–20 июня 2027',
    duration: '7 дней',
    description: 'Неделя среди гор, хвойных лесов и озёр. Идём налегке, оставляя время для остановок и красивых видов.',
    image: '/images/cover-altai.png',
    next: 'Тропа к Мультинским озёрам',
    nextWhen: '15 июня · 09:00',
    budget: 120_000,
    members: [
      { name: 'Анна', username: 'anna', role: 'Организатор', initials: 'АН' },
      { name: 'Мария', username: 'maria', role: 'Участник', initials: 'МР' },
      { name: 'Дмитрий', username: 'dmitry', role: 'Участник', initials: 'ДМ' },
    ],
    expenses: [
      { title: 'Домик у озера', paidBy: 'Анна', date: '10 июня', amount: 18_900 },
      { title: 'Билеты на поезд', paidBy: 'Мария', date: '8 июня', amount: 14_600 },
      { title: 'Аренда автомобиля', paidBy: 'Дмитрий', date: '12 июня', amount: 15_100 },
    ],
    bookings: [
      { id: 'booking-altai-train', kind: 'Транспорт', title: 'Поезд до Барнаула', details: 'Казанский вокзал · Вагон 06, места 12–14', when: '14 июня · 07:40' },
      { id: 'booking-altai-hotel-checkin', kind: 'Жильё', title: 'Заселение в домик у озера', details: 'Заезд с 14:00, ключи у администратора', when: '14 июня · 14:00' },
      { id: 'booking-altai-hotel-checkout', kind: 'Жильё', title: 'Выселение из домика у озера', details: 'Сдача ключей до 12:00', when: '20 июня · 12:00' },
    ],
    itinerary: [
      { id: 'itin-altai-lakes', title: 'Тропа к Мультинским озёрам', details: 'Пеший выход на маршрут, взять трекинговые палки', when: '15 июня · 09:00' },
      { id: 'itin-altai-pass', title: 'Смотровая площадка на перевале', details: 'Остановка на фото и обед', when: '17 июня · 13:00' },
    ],
  },
  {
    id: 'norway',
    place: 'Норвегия',
    destination: 'Лофотенские острова, Норвегия',
    timeZone: 'Europe/Oslo',
    dates: '4–11 сентября 2027',
    duration: '8 дней',
    description: 'Дорога вдоль фьордов, рыбацкие деревни и прогулки к океану. Держим маршрут свободным для спонтанных остановок.',
    image: '/images/cover-norway.png',
    next: 'Прогулка к мысу Рейнебринген',
    nextWhen: '5 сентября · 10:00',
    budget: 180_000,
    members: [
      { name: 'Анна', username: 'anna', role: 'Организатор', initials: 'АН' },
      { name: 'Иван', username: 'ivan', role: 'Участник', initials: 'ИВ' },
      { name: 'Мария', username: 'maria', role: 'Участник', initials: 'МР' },
    ],
    expenses: [
      { title: 'Дом у фьорда', paidBy: 'Иван', date: '22 августа', amount: 42_000 },
      { title: 'Паром', paidBy: 'Анна', date: '28 августа', amount: 12_400 },
      { title: 'Аренда автомобиля', paidBy: 'Мария', date: '1 сентября', amount: 8_000 },
    ],
    bookings: [
      { id: 'booking-norway-ferry', kind: 'Транспорт', title: 'Паром Будё — Москенес', details: 'Причал 3, регистрация авто за 30 минут', when: '4 сентября · 11:30' },
      { id: 'booking-norway-lodge', kind: 'Жильё', title: 'Заселение в дом у фьорда', details: 'Чек-ин с 15:00 по коду кейбокса', when: '4 сентября · 15:00' },
      { id: 'booking-norway-checkout', kind: 'Жильё', title: 'Выселение из дома у фьорда', details: 'Чек-аут до 11:00', when: '11 сентября · 11:00' },
    ],
    itinerary: [
      { id: 'itin-norway-reine', title: 'Прогулка к мысу Рейнебринген', details: 'Подъём на смотровую площадку', when: '5 сентября · 10:00' },
      { id: 'itin-norway-village', title: 'Рыбацкая деревня О', details: 'Музей трески и прогулка вдоль берега', when: '7 сентября · 14:00' },
    ],
  },
  {
    id: 'switzerland',
    place: 'Швейцария',
    destination: 'Бернский Оберланд, Швейцария',
    timeZone: 'Europe/Zurich',
    dates: '6–13 декабря 2027',
    duration: '8 дней',
    description: 'Зимние тропы, тихие горные деревни и панорамы Альп. В планах поездки — несколько дней без спешки.',
    image: '/images/cover-switzerland.png',
    next: 'Поезд до Гриндельвальда',
    nextWhen: '7 декабря · 08:30',
    budget: 220_000,
    members: [
      { name: 'Анна', username: 'anna', role: 'Организатор', initials: 'АН' },
      { name: 'Дмитрий', username: 'dmitry', role: 'Участник', initials: 'ДМ' },
    ],
    expenses: [
      { title: 'Апартаменты в горах', paidBy: 'Анна', date: '18 ноября', amount: 58_000 },
      { title: 'Железнодорожные билеты', paidBy: 'Дмитрий', date: '24 ноября', amount: 26_800 },
    ],
    bookings: [
      { id: 'booking-swiss-train', kind: 'Транспорт', title: 'Поезд до Гриндельвальда', details: 'Платформа 4 · Панорамный экспресс', when: '7 декабря · 08:30' },
    ],
    itinerary: [
      { id: 'itin-swiss-trail', title: 'Прогулка по альпийской тропе', details: 'Маршрут Меннлихен — Клайне-Шайдегг', when: '8 декабря · 10:30' },
    ],
  },
];

export function formatRubles(amount: number) {
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
}
