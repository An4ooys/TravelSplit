import type { MouseEvent } from 'react';
import { formatRubles, type Trip } from './trips';

type Props = {
  trip: Trip;
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function TripPage({ trip, onBack }: Props) {
  const spent = trip.expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = trip.budget - spent;
  const progress = Math.min(100, Math.round((spent / trip.budget) * 100));

  return (
    <main className="trip-page-content">
      <a className="back-link" href="/" onClick={onBack}>
        <span aria-hidden="true">←</span> Все поездки
      </a>

      <div className="trip-page-heading">
        <div>
          <p className="eyebrow">ВАША ПОЕЗДКА</p>
          <h1>{trip.place}</h1>
          <p className="intro-subtitle">{trip.destination} · {trip.dates}</p>
        </div>
        <span className="trip-page-count">{trip.members.length} участника</span>
      </div>

      <section className="trip-overview-card" aria-labelledby="overview-heading">
        <div className="trip-overview-copy">
          <div className="detail-heading">
            <span className="detail-section-number">01</span>
            <h2 id="overview-heading">О поездке</h2>
          </div>
          <p className="trip-description">{trip.description}</p>
          <div className="trip-facts">
            <div><span>Когда</span><strong>{trip.dates}</strong></div>
            <div><span>Продолжительность</span><strong>{trip.duration}</strong></div>
            <div><span>Направление</span><strong>{trip.destination}</strong></div>
            <div><span>Валюта расходов</span><strong>Рубль · ₽</strong></div>
          </div>
        </div>
        <img className="trip-overview-image" src={trip.image} alt={`Пейзаж поездки: ${trip.place}`} />
      </section>

      <div className="trip-detail-grid">
        <section className="detail-card members-card" aria-labelledby="members-heading">
          <div className="detail-heading">
            <span className="detail-section-number">02</span>
            <h2 id="members-heading">Участники</h2>
            <span className="detail-count">{trip.members.length}</span>
          </div>
          <div className="member-list">
            {trip.members.map((member, index) => (
              <div className="member-row" key={member.username}>
                <span className={`member-avatar member-avatar-${index % 3}`} aria-hidden="true">{member.initials}</span>
                <div className="member-identity">
                  <strong>{member.name}</strong>
                  <span>@{member.username}</span>
                </div>
                <span className="member-role">{member.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-card money-card" aria-labelledby="money-heading">
          <div className="detail-heading">
            <span className="detail-section-number">03</span>
            <h2 id="money-heading">Деньги</h2>
          </div>
          <div className="budget-head">
            <span>Общий бюджет</span>
            <strong>{formatRubles(trip.budget)}</strong>
          </div>
          <div className="budget-track" role="meter" aria-label="Доля потраченного бюджета" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="budget-totals">
            <div><span>Потрачено</span><strong>{formatRubles(spent)}</strong></div>
            <div><span>Осталось</span><strong>{formatRubles(remaining)}</strong></div>
          </div>
          <div className="expense-heading">
            <h3>Последние расходы</h3>
            <span>{trip.expenses.length} записи</span>
          </div>
          <div className="expense-list">
            {trip.expenses.map((expense) => (
              <div className="expense-row" key={expense.title}>
                <div>
                  <strong>{expense.title}</strong>
                  <span>{expense.date} · оплатил(а) {expense.paidBy}</span>
                </div>
                <strong>{formatRubles(expense.amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
