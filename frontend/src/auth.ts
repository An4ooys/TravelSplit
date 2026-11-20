export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  initials: string;
  avatarBg?: string;
  role: string;
  password?: string;
};

export const DEMO_USERS: User[] = [
  {
    id: 'usr-anna',
    username: 'anna',
    name: 'Анна Смирнова',
    email: 'anna@travelsplit.ru',
    initials: 'АН',
    role: 'Организатор поездок',
    avatarBg: '#3b6555',
  },
  {
    id: 'usr-ivan',
    username: 'ivan',
    name: 'Иван Ковалёв',
    email: 'ivan@travelsplit.ru',
    initials: 'ИВ',
    role: 'Участник',
    avatarBg: '#4a6572',
  },
  {
    id: 'usr-maria',
    username: 'maria',
    name: 'Мария Соколова',
    email: 'maria@travelsplit.ru',
    initials: 'МР',
    role: 'Участник',
    avatarBg: '#7c5866',
  },
  {
    id: 'usr-dmitry',
    username: 'dmitry',
    name: 'Дмитрий Белов',
    email: 'dmitry@travelsplit.ru',
    initials: 'ДМ',
    role: 'Участник',
    avatarBg: '#446e5c',
  },
];

export const AVATAR_PALETTE = [
  { id: 'forest', name: 'Хвойный лес', color: '#3b6555' },
  { id: 'ocean', name: 'Океан', color: '#3d6b7b' },
  { id: 'slate', name: 'Скалистый', color: '#4a6572' },
  { id: 'terracotta', name: 'Глина', color: '#8c5a47' },
  { id: 'berry', name: 'Вереск', color: '#7c5866' },
  { id: 'amber', name: 'Закат', color: '#8f6a36' },
];

const STORAGE_USERS_KEY = 'travelsplit-registered-users';
const STORAGE_CURRENT_USER_KEY = 'travelsplit-current-user';

export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    const single = parts[0];
    return (single.slice(0, 2) || single[0]).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getAllUsers(): User[] {
  const registeredRaw = localStorage.getItem(STORAGE_USERS_KEY);
  let registered: User[] = [];
  if (registeredRaw) {
    try {
      registered = JSON.parse(registeredRaw);
    } catch {
      registered = [];
    }
  }

  // Merge demo users with registered users, demo users are base
  const usersMap = new Map<string, User>();
  for (const user of DEMO_USERS) {
    usersMap.set(user.username.toLowerCase(), user);
  }
  for (const user of registered) {
    usersMap.set(user.username.toLowerCase(), user);
  }
  return Array.from(usersMap.values());
}

export function getInitialUser(): User | null {
  const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  if (saved === 'guest') return null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const all = getAllUsers();
      const existing = all.find((u) => u.username.toLowerCase() === parsed.username?.toLowerCase());
      if (existing) return existing;
      return parsed;
    } catch {
      // fallback
    }
  }
  // Default to Anna for backward compatibility with initial prototype state
  return DEMO_USERS[0];
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, 'guest');
  }
}

export function loginUser(identifier: string, password?: string): User {
  const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
  if (!cleanId) {
    throw new Error('Пожалуйста, укажите имя пользователя или email.');
  }

  const all = getAllUsers();
  const found = all.find(
    (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!found) {
    throw new Error('Пользователь с таким логином или почтой не найден.');
  }

  // If password was set on custom registered user, verify it
  if (found.password && password && found.password !== password) {
    throw new Error('Неверный пароль. Попробуйте ещё раз.');
  }

  setCurrentUser(found);
  return found;
}

export function registerUser(input: {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatarBg?: string;
}): User {
  const cleanName = input.name.trim();
  const cleanUsername = input.username.trim().toLowerCase().replace(/^@/, '');
  const cleanEmail = input.email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error('Укажите ваше имя.');
  }
  if (!cleanUsername) {
    throw new Error('Укажите имя пользователя.');
  }
  if (!/^[a-z0-9_.-]{3,24}$/.test(cleanUsername)) {
    throw new Error('Имя пользователя должно содержать от 3 до 24 латинских букв, цифр, дефисов или подчеркиваний.');
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Укажите корректный адрес электронной почты.');
  }
  if (input.password && input.password.length < 4) {
    throw new Error('Пароль должен содержать не менее 4 символов.');
  }

  const all = getAllUsers();
  if (all.some((u) => u.username.toLowerCase() === cleanUsername)) {
    throw new Error(`Имя пользователя @${cleanUsername} уже занято. Выберите другое.`);
  }
  if (all.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('Пользователь с таким email уже зарегистрирован.');
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    name: cleanName,
    email: cleanEmail,
    initials: computeInitials(cleanName),
    avatarBg: input.avatarBg || AVATAR_PALETTE[0].color,
    role: 'Путешественник',
    password: input.password,
  };

  const registeredRaw = localStorage.getItem(STORAGE_USERS_KEY);
  let registered: User[] = [];
  if (registeredRaw) {
    try {
      registered = JSON.parse(registeredRaw);
    } catch {
      registered = [];
    }
  }
  registered.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registered));

  setCurrentUser(newUser);
  return newUser;
}

export function logoutUser(): void {
  setCurrentUser(null);
}
