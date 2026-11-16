import { useState, type MouseEvent } from 'react';
import { calculateSettlements, formatRubles, type Trip, type Expense } from './trips';

type Props = {
  trip: Trip;
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
  onUpdateTrip?: (updatedTrip: Trip) => void;
};

export default function TripPage({ trip, onBack, onUpdateTrip }: Props) {
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPaidBy, setNewPaidBy] = useState(trip.members[0]?.name || 'Аня');
  const [newCategory, setNewCategory] = useState('Еда');

  const { spent, perPerson, settlements } = calculateSettlements(currentTrip);
  const remaining = currentTrip.budget - spent;
  const progressPercent = Math.min(100, Math.max(0, Math.round((spent / currentTrip.budget) * 100)));

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      amount: amountNum,
      paidBy: newPaidBy,
      date: 'Сегодня',
      category: newCategory,
    };

    const updated: Trip = {
      ...currentTrip,
      expenses: [newExpense, ...currentTrip.expenses],
    };

    setCurrentTrip(updated);
    if (onUpdateTrip) {
      onUpdateTrip(updated);
    }

    setNewTitle('');
    setNewAmount('');
    setIsExpenseModalOpen(false);
  }

  return (
    <main className="trip-detail-view" aria-label={`Поездка: ${currentTrip.place}`}>
      {/* Ghost Back Link */}
      <a className="back-link" href="/" onClick={onBack}>
        <span aria-hidden="true">←</span> Все поездки
      </a>

      {/* Hero Block — Floating directly on void canvas */}
      <div style={{ marginBottom: 'var(--spacing-36)' }}>
        <span className="kicker-amber">ЭКСПЕДИЦИЯ С ДРУЗЬЯМИ</span>
        <h1 className="heading-display" style={{ marginBottom: '16px' }}>
          {currentTrip.place}
        </h1>
        <p className="body-airy" style={{ marginBottom: 'var(--spacing-24)' }}>
          {currentTrip.destination} · {currentTrip.dates} · {currentTrip.duration}
        </p>
      </div>

      {/* Block 01: О поездке и маршруте */}
      <section className="trip-detail-section" aria-labelledby="section-route-heading">
        <span className="kicker-amber">БЛОК 01 · МАРШРУТ</span>
        <h2 id="section-route-heading" className="heading-section">
          О маршруте
        </h2>

        <p className="body-airy" style={{ marginBottom: 'var(--spacing-24)' }}>
          {currentTrip.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'var(--color-saffron-spark)', marginBottom: 'var(--spacing-24)' }}>
          <span>✦ СЛЕДУЮЩИЙ ШАГ:</span>
          <strong style={{ color: 'var(--color-bone-white)', fontWeight: 400 }}>
            {currentTrip.next} ({currentTrip.nextWhen})
          </strong>
        </div>

        <div
          style={{
            height: '280px',
            borderRadius: 'var(--radius-cards)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 'var(--spacing-24)',
          }}
        >
          <img
            src={currentTrip.image}
            alt={`Пейзаж: ${currentTrip.place}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Block 02: Наша компания */}
      <section className="trip-detail-section" aria-labelledby="section-friends-heading">
        <span className="kicker-amber">БЛОК 02 · ДРУЗЬЯ В ПУТИ</span>
        <h2 id="section-friends-heading" className="heading-section">
          Наша компания ({currentTrip.members.length} чел)
        </h2>
        <p className="body-muted">
          Роли и снаряжение распределены по-дружески.
        </p>

        <div className="friends-clean-list">
          {currentTrip.members.map((member) => (
            <div className="friend-clean-row" key={member.name}>
              <div
                className="friend-clean-badge"
                style={{
                  backgroundColor: `${member.color}22`,
                  borderColor: member.color,
                }}
              >
                {member.initials}
              </div>
              <div className="friend-clean-info">
                <div className="friend-clean-name">
                  {member.name}
                  <span style={{ color: member.color, fontSize: '14px', marginLeft: '8px', fontWeight: 200 }}>
                    · {member.role}
                  </span>
                </div>
                <div className="friend-clean-duty">{member.duty}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Block 03: Общий котел и честный сплит */}
      <section className="trip-detail-section" aria-labelledby="section-split-heading">
        <span className="kicker-amber">БЛОК 03 · ЧЕСТНЫЙ СПЛИТ</span>
        <div className="trip-detail-section-header">
          <h2 id="section-split-heading" className="heading-section" style={{ marginBottom: 0 }}>
            Общий котел
          </h2>
          <button
            className="btn-primary"
            onClick={() => setIsExpenseModalOpen(true)}
            aria-label="Внести совместную трату"
          >
            ＋ Скинулись на что-то
          </button>
        </div>

        {/* 4 summary stats floating cleanly */}
        <div className="stats-clean-row">
          <div className="stat-clean-item">
            <span className="stat-clean-label">Общий бюджет</span>
            <span className="stat-clean-value">{formatRubles(currentTrip.budget)}</span>
          </div>
          <div className="stat-clean-item">
            <span className="stat-clean-label">Потрачено</span>
            <span className="stat-clean-value" style={{ color: 'var(--color-electric-iris)' }}>
              {formatRubles(spent)}
            </span>
          </div>
          <div className="stat-clean-item">
            <span className="stat-clean-label">Остаток</span>
            <span className="stat-clean-value" style={{ color: remaining >= 0 ? '#34d399' : 'var(--color-saffron-spark)' }}>
              {formatRubles(remaining)}
            </span>
          </div>
          <div className="stat-clean-item">
            <span className="stat-clean-label">С каждого</span>
            <span className="stat-clean-value" style={{ color: 'var(--color-saffron-spark)' }}>
              {formatRubles(perPerson)}
            </span>
          </div>
        </div>

        {/* Budget progress bar */}
        <div
          className="budget-bar-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="budget-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Minimal transfers */}
        <div style={{ marginTop: 'var(--spacing-24)' }}>
          <span className="label-violet" style={{ marginBottom: '12px' }}>
            МИНИМУМ ПЕРЕВОДОВ ДЛЯ ПОЛНОГО РАСЧЕТА:
          </span>

          <div className="settlement-clean-list">
            {settlements.length === 0 ? (
              <p style={{ color: 'var(--color-ash-gray)', fontStyle: 'italic', padding: '8px 0' }}>
                Все скинулись ровно, никто никому ничего не должен!
              </p>
            ) : (
              settlements.map((s, idx) => (
                <div className="settlement-clean-row" key={idx}>
                  <div className="settlement-clean-names">
                    <span>{s.from}</span>
                    <span className="arrow">→</span>
                    <span>{s.to}</span>
                  </div>
                  <span className="settlement-clean-amount">{formatRubles(s.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Block 04: Лента расходов */}
      <section className="trip-detail-section" aria-labelledby="section-expenses-heading">
        <span className="kicker-amber">БЛОК 04 · ЛЕНТА ТРАТ</span>
        <h2 id="section-expenses-heading" className="heading-section">
          Все расходы ({currentTrip.expenses.length})
        </h2>

        <div className="expense-clean-list">
          {currentTrip.expenses.map((expense) => (
            <div className="expense-clean-row" key={expense.id}>
              <div className="expense-clean-info">
                <span className="expense-clean-title">{expense.title}</span>
                <span className="expense-clean-meta">
                  {expense.date} · оплатил(а) <strong>{expense.paidBy}</strong> · категория: {expense.category}
                </span>
              </div>
              <strong className="expense-clean-amount">{formatRubles(expense.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="kicker-amber">НОВАЯ ТРАТА</span>
                <h3 className="heading-section" style={{ fontSize: '28px', marginBottom: 0 }}>
                  Скинулись на что-то
                </h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsExpenseModalOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="form-field">
                <label className="form-label">НА ЧТО ПОТРАТИЛИ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Например: Продукты для ужина на костре"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">СКОЛЬКО СТОИЛО (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="4500"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">КТО ИЗ ДРУЗЕЙ ОПЛАТИЛ</label>
                <select
                  className="form-select"
                  value={newPaidBy}
                  onChange={(e) => setNewPaidBy(e.target.value)}
                >
                  {currentTrip.members.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">КАТЕГОРИЯ</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Еда">Еда и напитки</option>
                  <option value="Жилье">Жилье и стоянки</option>
                  <option value="Авто">Бензин и транспорт</option>
                  <option value="Снаряжение">Снаряжение</option>
                  <option value="Развлечения">Развлечения</option>
                </select>
              </div>

              <div style={{ marginTop: 'var(--spacing-24)', display: 'flex', gap: 'var(--spacing-18)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsExpenseModalOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  Записать в общий котел
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
