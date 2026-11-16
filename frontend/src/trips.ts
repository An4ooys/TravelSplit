export type Member = {
  name: string;
  role: string;
  initials: string;
  color: string;
  duty: string;
};

export type Expense = {
  id: string;
  title: string;
  paidBy: string;
  date: string;
  amount: number;
  category: string;
};

export type Settlement = {
  from: string;
  to: string;
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

export const defaultTrips: Trip[] = [
  {
    id: 'altai',
    place: 'Алтай',
    destination: 'Республика Алтай, Россия',
    dates: '14–20 июня 2027',
    duration: '7 дней в пути',
    description: 'Неделя с палатками среди хвойных лесов, бурных рек и перевалов. Едем одной машиной, останавливаемся где красиво, варим кофе на горелке.',
    image: '/images/cover-altai.png',
    next: 'Выход на Мультинские озера',
    nextWhen: 'Завтра · 09:00',
    budget: 120_000,
    members: [
      {
        name: 'Аня',
        role: 'Маршруты и вдохновение',
        initials: 'АН',
        color: '#8052ff',
        duty: 'Выбирает видовые тропы и держит карту',
      },
      {
        name: 'Маша',
        role: 'Логистика и билеты',
        initials: 'МР',
        color: '#ffb829',
        duty: 'Следит за поездами, паромами и таймингом',
      },
      {
        name: 'Дима',
        role: 'Костер, палатки и авто',
        initials: 'ДМ',
        color: '#15846e',
        duty: 'Внедорожник, снаряжение и стоянки',
      },
      {
        name: 'Ваня',
        role: 'Закупки и общий котел',
        initials: 'ИВ',
        color: '#d946ef',
        duty: 'Полевая кухня, продукты и общий чек',
      },
    ],
    expenses: [
      { id: 'e1', title: 'Уютный деревянный дом на берегу', paidBy: 'Аня', date: '10 июня', amount: 36_000, category: 'Жилье' },
      { id: 'e2', title: 'Билеты на поезд и трансфер', paidBy: 'Маша', date: '8 июня', amount: 28_400, category: 'Транспорт' },
      { id: 'e3', title: 'Аренда 4х4 и бензин на всю дорогу', paidBy: 'Дима', date: '12 июня', amount: 24_600, category: 'Авто' },
      { id: 'e4', title: 'Мясо, сыр и провиант на неделю', paidBy: 'Ваня', date: '13 июня', amount: 15_200, category: 'Еда' },
    ],
  },
  {
    id: 'norway',
    place: 'Норвегия',
    destination: 'Лофотенские острова, Норвегия',
    dates: '4–11 сентября 2027',
    duration: '8 дней в пути',
    description: 'Северная дорога вдоль фьордов, уютные красные домики у воды и ночевки под северным сиянием.',
    image: '/images/cover-norway.png',
    next: 'Подъем на мыс Рейнебринген',
    nextWhen: '5 сентября · 10:00',
    budget: 180_000,
    members: [
      {
        name: 'Аня',
        role: 'Маршруты и вдохновение',
        initials: 'АН',
        color: '#8052ff',
        duty: 'Смотровые площадки и маяки',
      },
      {
        name: 'Ваня',
        role: 'Закупки и общий котел',
        initials: 'ИВ',
        color: '#d946ef',
        duty: 'Рыбный рынок и продукты',
      },
      {
        name: 'Маша',
        role: 'Логистика и билеты',
        initials: 'МР',
        color: '#ffb829',
        duty: 'Паромы через фьорды',
      },
    ],
    expenses: [
      { id: 'en1', title: 'Традиционный рорбу у фьорда', paidBy: 'Ваня', date: '22 авг', amount: 64_000, category: 'Жилье' },
      { id: 'en2', title: 'Паромная переправа', paidBy: 'Аня', date: '28 авг', amount: 22_400, category: 'Транспорт' },
      { id: 'en3', title: 'Аренда универсала 4x4', paidBy: 'Маша', date: '1 сен', amount: 48_000, category: 'Авто' },
    ],
  },
  {
    id: 'switzerland',
    place: 'Швейцария',
    destination: 'Бернский Оберланд, Швейцария',
    dates: '6–13 декабря 2027',
    duration: '8 дней в пути',
    description: 'Зимние шале, хрустящий снег под ногами, вечернее фондю и панорамы заснеженных альпийских пиков.',
    image: '/images/cover-switzerland.png',
    next: 'Панорамный поезд до Гриндельвальда',
    nextWhen: '7 декабря · 08:30',
    budget: 220_000,
    members: [
      {
        name: 'Аня',
        role: 'Маршруты и вдохновение',
        initials: 'АН',
        color: '#8052ff',
        duty: 'Горные тропы и шале',
      },
      {
        name: 'Дима',
        role: 'Снаряжение и лыжи',
        initials: 'ДМ',
        color: '#15846e',
        duty: 'Экипировка и ски-пассы',
      },
      {
        name: 'Ваня',
        role: 'Закупки и общий котел',
        initials: 'ИВ',
        color: '#d946ef',
        duty: 'Ужины и продукты',
      },
    ],
    expenses: [
      { id: 'es1', title: 'Шале в горах на всю компанию', paidBy: 'Аня', date: '18 ноя', amount: 88_000, category: 'Жилье' },
      { id: 'es2', title: 'Поездные билеты Swiss Pass', paidBy: 'Дима', date: '24 ноя', amount: 45_600, category: 'Транспорт' },
      { id: 'es3', title: 'Ски-пассы и экипировка', paidBy: 'Ваня', date: '28 ноя', amount: 32_000, category: 'Активности' },
    ],
  },
];

export const trips = defaultTrips;

export function formatRubles(amount: number) {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))} ₽`;
}

/**
 * Calculates optimal debt settlement transfers with minimum transactions
 */
export function calculateSettlements(trip: Trip): {
  spent: number;
  perPerson: number;
  balances: { member: string; paid: number; net: number }[];
  settlements: Settlement[];
} {
  const memberNames = trip.members.map((m) => m.name);
  const totalSpent = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const count = memberNames.length;
  const perPerson = count > 0 ? totalSpent / count : 0;

  const paidMap: Record<string, number> = {};
  memberNames.forEach((name) => {
    paidMap[name] = 0;
  });

  trip.expenses.forEach((exp) => {
    if (paidMap[exp.paidBy] !== undefined) {
      paidMap[exp.paidBy] += exp.amount;
    } else {
      paidMap[exp.paidBy] = exp.amount;
    }
  });

  const balances = memberNames.map((name) => {
    const paid = paidMap[name] || 0;
    const net = paid - perPerson;
    return { member: name, paid, net };
  });

  // Debt minimization algorithm
  const debtors = balances.filter((b) => b.net < -0.5).map((b) => ({ name: b.member, amount: -b.net }));
  const creditors = balances.filter((b) => b.net > 0.5).map((b) => ({ name: b.member, amount: b.net }));

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const transfer = Math.min(debtor.amount, creditor.amount);

    if (transfer > 1) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(transfer),
      });
    }

    debtor.amount -= transfer;
    creditor.amount -= transfer;

    if (debtor.amount < 0.5) dIdx++;
    if (creditor.amount < 0.5) cIdx++;
  }

  return {
    spent: totalSpent,
    perPerson,
    balances,
    settlements,
  };
}
