import { useState, type MouseEvent } from 'react';
import ConstellationCanvas from './ConstellationCanvas';
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

      {/* Hero Block */}
      <div style={{ marginBottom: 'var(--spacing-36)' }}>
        <span className="kicker-amber">ПУТЕШЕСТВИЕ С ДРУЗЬЯМИ</span>
        <h1 className="hero-headline" style={{ marginBottom: '12px' }}>{currentTrip.place}</h1>
        <p className="body-light" style={{ fontSize: '20px', color: '#ffffff' }}>
          {currentTrip.destination} · {currentTrip.dates} · {currentTrip.duration}
        </p>
      </div>

      {/* Block 1: Маршрут и созвездие гор */}
      <section className="content-island" aria-labelledby="island-route-heading">
        <div className="content-island-header">
          <div>
            <span className="kicker-amber" style={{ marginBottom: '4px' }}>БЛОК 01</span>
            <h2 id="island-route-heading" className="heading-subsection">О поездке и маршруте</h2>
          </div>
          <span style={{ color: '#ffb829', fontSize: '14px', letterSpacing: '0.35px' }}>
            ✦ {currentTrip.nextWhen}
          </span>
        </div>

        <div className="section-two-col" style={{ margin: 0, alignItems: 'center' }}>
          <div>
            <p className="body-light" style={{ fontSize: '18px', color: '#ffffff', marginBottom: '24px' }}>
              {currentTrip.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div className="split-stat-box">
                <span className="split-stat-title">СЛЕДУЮЩАЯ ТОЧКА</span>
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 400 }}>{currentTrip.next}</div>
              </div>
              <div className="split-stat-box">
                <span className="split-stat-title">ВРЕМЯ В ПУТИ</span>
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 400 }}>{currentTrip.duration}</div>
              </div>
            </div>
          </div>

          <div style={{ height: '280px', borderRadius: '20px', overflow: 'hidden', background: '#000000', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ConstellationCanvas preset="mountains" />
          </div>
        </div>
      </section>

      {/* Block 2: Друзья в поездке (теплая дружеская компания) */}
      <section className="content-island" aria-labelledby="island-friends-heading">
        <div className="content-island-header">
          <div>
            <span className="kicker-amber" style={{ marginBottom: '4px' }}>БЛОК 02</span>
            <h2 id="island-friends-heading" className="heading-subsection">
              Наша компания ({currentTrip.members.length} чел)
            </h2>
          </div>
          <span style={{ color: '#9a9a9a', fontSize: '14px' }}>
            Все роли распределены по-дружески
          </span>
        </div>

        <div className="friends-grid">
          {currentTrip.members.map((member) => (
            <div className="friend-card" key={member.name}>
              <div className="friend-badge" style={{ backgroundColor: `${member.color}22`, borderColor: member.color }}>
                {member.initials}
              </div>
              <h3 className="friend-name">{member.name}</h3>
              <span className="friend-role" style={{ color: member.color }}>{member.role}</span>
              <p className="friend-duty">{member.duty}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Block 3: Общий котел и честный сплит */}
      <section className="content-island" aria-labelledby="island-split-heading">
        <div className="content-island-header">
          <div>
            <span className="kicker-amber" style={{ marginBottom: '4px' }}>БЛОК 03</span>
            <h2 id="island-split-heading" className="heading-subsection">
              Общий котел и расчеты
            </h2>
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsExpenseModalOpen(true)}
            aria-label="Внести совместную трату"
          >
            ＋ Скинулись на что-то
          </button>
        </div>

        {/* 3 summary stats */}
        <div className="split-summary-grid">
          <div className="split-stat-box">
            <span className="split-stat-title">ОБЩИЙ БЮДЖЕТ</span>
            <div className="split-stat-num">{formatRubles(currentTrip.budget)}</div>
          </div>
          <div className="split-stat-box">
            <span className="split-stat-title">ПОТРАЧЕНО ВСЕГО</span>
            <div className="split-stat-num" style={{ color: '#8052ff' }}>{formatRubles(spent)}</div>
          </div>
          <div className="split-stat-box">
            <span className="split-stat-title">С КАЖДОГО ПОРОВНУ</span>
            <div className="split-stat-num" style={{ color: '#ffb829' }}>{formatRubles(perPerson)}</div>
          </div>
        </div>

        {/* Budget progress bar */}
        <div className="budget-meter-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="budget-meter-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Minimal transfers */}
        <div style={{ marginTop: 'var(--spacing-24)' }}>
          <span className="label-violet" style={{ marginBottom: '12px' }}>
            КАК ЗАКРЫТЬ ДОЛГИ МЕЖДУ ДРУЗЬЯМИ (МИНИМУМ ПЕРЕВОДОВ):
          </span>

          <div className="settlement-card-list">
            {settlements.length === 0 ? (
              <p style={{ color: '#9a9a9a', fontStyle: 'italic', padding: '8px 0' }}>
                Все скинулись ровно, никто никому ничего не должен!
              </p>
            ) : (
              settlements.map((s, idx) => (
                <div className="settlement-row-card" key={idx}>
                  <div className="settlement-names">
                    <strong style={{ fontWeight: 400 }}>{s.from}</strong>
                    <span className="arrow">→</span>
                    <strong style={{ fontWeight: 400 }}>{s.to}</strong>
                  </div>
                  <strong className="settlement-cash">{formatRubles(s.amount)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Block 4: Лента трат */}
      <section className="content-island" aria-labelledby="island-expenses-heading">
        <div className="content-island-header">
          <div>
            <span className="kicker-amber" style={{ marginBottom: '4px' }}>БЛОК 04</span>
            <h2 id="island-expenses-heading" className="heading-subsection">
              Все расходы в поездке ({currentTrip.expenses.length})
            </h2>
          </div>
          <span style={{ color: '#9a9a9a', fontSize: '14px' }}>
            Остаток бюджета: <strong style={{ color: remaining >= 0 ? '#ffffff' : '#ffb829' }}>{formatRubles(remaining)}</strong>
          </span>
        </div>

        <div>
          {currentTrip.expenses.map((expense) => (
            <div className="expense-row-item" key={expense.id}>
              <div className="expense-left-meta">
                <span className="expense-title-text">{expense.title}</span>
                <span className="expense-author-tag">
                  {expense.date} · оплатил(а) <strong>{expense.paidBy}</strong> · категория: {expense.category}
                </span>
              </div>
              <strong className="expense-cost-val">{formatRubles(expense.amount)}</strong>
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
                <h3 className="heading-subsection">Скинулись на что-то</h3>
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
