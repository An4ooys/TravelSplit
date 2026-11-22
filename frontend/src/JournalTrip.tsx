import { useState, useRef, type MouseEvent, type KeyboardEvent } from 'react';
import { formatRubles, type Trip } from './trips';

const tabs = [{ id: 'overview', label: 'О путешествии' }, { id: 'money', label: 'Общие расходы' }, { id: 'people', label: 'Наша компания' }] as const;
type Tab = typeof tabs[number]['id'];

export default function JournalTrip({ trip, onBack }: { trip: Trip; onBack: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const spent = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  function changeTab(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next].id);
    buttons.current[next]?.focus();
  }

  return <div className="trip-journal">
    <a href="/" className="back-link" onClick={onBack}>← Все путешествия</a>
    <section className="trip-cover">
      <div className="trip-cover-copy"><p className="eyebrow">ВАША СЛЕДУЮЩАЯ ИСТОРИЯ</p><h1>{trip.place}<em>.</em></h1><p>{trip.destination}</p><div className="trip-seal" aria-hidden="true">✳</div></div>
      <div className="trip-color-square" aria-hidden="true" />
      <div className="trip-date-note"><span>ВСТРЕЧА С МИРОМ</span><strong>{trip.dates}</strong></div>
    </section>
    <div className="trip-fact-strip"><div><span>Когда</span><strong>{trip.dates}</strong></div><div><span>В дороге</span><strong>{trip.duration}</strong></div><div><span>Вместе</span><strong>{trip.members.length} участника</strong></div><div><span>Общий бюджет</span><strong>{formatRubles(trip.budget)}</strong></div></div>
    <div className="journal-tabs" role="tablist" aria-label="Разделы поездки">{tabs.map((item, index) => <button ref={element => { buttons.current[index] = element; }} key={item.id} role="tab" id={`tab-${item.id}`} aria-controls={`panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => changeTab(event, index)}>{item.label}<span aria-hidden="true">↗</span></button>)}</div>
    <section className="journal-panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} key={tab}>
      {tab === 'overview' && <div className="overview-layout"><div><p className="eyebrow">ТО, РАДИ ЧЕГО МЫ ЕДЕМ</p><h2>Замедлиться.<br /><em>Оглянуться вокруг.</em></h2><p className="trip-description">{trip.description}</p><div className="organizer"><span className="user-avatar">{trip.members[0].initials}</span><span>Поездку собирает <strong>{trip.members[0].name}</strong><small>@{trip.members[0].username}</small></span></div></div><aside className="plan-card"><span className="eyebrow">БЛИЖАЙШИЙ ПЛАН</span><span className="plan-star" aria-hidden="true">✳</span><h3>{trip.next}</h3><p>{trip.nextWhen}</p><div className="plan-bottom">{trip.place} <span aria-hidden="true">↗</span></div></aside></div>}
      {tab === 'money' && <div className="money-layout"><aside className="budget-card"><p className="eyebrow">ОБЩИЙ БЮДЖЕТ</p><h2>{formatRubles(trip.budget)}</h2><div className="budget-progress" role="meter" aria-label="Потраченная доля бюджета" aria-valuenow={Math.round(spent / trip.budget * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, spent / trip.budget * 100)}%` }} /></div><dl><div><dt>Потрачено</dt><dd>{formatRubles(spent)}</dd></div><div><dt>Осталось</dt><dd>{formatRubles(trip.budget - spent)}</dd></div></dl></aside><div className="expense-book"><h2>На что потратили</h2>{trip.expenses.map(expense => <div className="expense-entry" key={expense.title}><span className="expense-symbol" aria-hidden="true">↗</span><div><strong>{expense.title}</strong><small>{expense.date} · {expense.paidBy}</small></div><b>{formatRubles(expense.amount)}</b></div>)}</div></div>}
      {tab === 'people' && <div className="people-layout"><div><p className="eyebrow">ТЕ, С КЕМ ХОРОШО</p><h2>Ваша <em>компания.</em></h2><p className="trip-description">У каждого — свои впечатления.<br />История у нас общая.</p></div><div className="people-list">{trip.members.map(member => <div className="person" key={member.username}><span className="person-initials">{member.initials}</span><div><h3>{member.name}</h3><p>@{member.username}</p></div><span className="person-role">{member.role}</span></div>)}</div></div>}
    </section>
  </div>;
}
