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

export type Trip = {
  id: string;
  place: string;
  destination: string;
  dates: string;
  duration: string;
  description: string;
  image: string;
  next: string;
  nextWhen: string;
  budget: number;
  members: Member[];
  expenses: Expense[];
};

export const trips: Trip[] = [
  {
    id: 'altai',
    place: 'Алтай',
    destination: 'Республика Алтай, Россия',
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
  },
  {
    id: 'norway',
    place: 'Норвегия',
    destination: 'Лофотенские острова, Норвегия',
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
  },
  {
    id: 'switzerland',
    place: 'Швейцария',
    destination: 'Бернский Оберланд, Швейцария',
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
  },
];

export function formatRubles(amount: number) {
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
}
