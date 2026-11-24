import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { createTripEvent } from './api/notifications';
import { formatRubles, type Trip, type TripItineraryItem } from './trips';
import { NotificationType } from './types/notification';

export type FocusedTarget = {
  targetType: string;
  targetId: string;
  seq: number;
};

type Props = {
  trip: Trip;
  currentUserId: string;
  focusedTarget?: FocusedTarget | null;
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
  onOpenSettings?: () => void;
  onToast?: (message: string) => void;
};

function resolveSectionId(targetType: string): string {
  switch (targetType) {
    case 'BOOKING':
      return 'section-bookings';
    case 'ITINERARY':
      return 'section-itinerary';
    case 'MEMBER':
      return 'section-members';
    case 'EXPENSE':
      return 'section-money';
    case 'TRIP':
    default:
      return 'section-overview';
  }
}

export default function TripPage({ trip, currentUserId, focusedTarget, onBack, onOpenSettings, onToast }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<TripItineraryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOffset, setNewOffset] = useState(15);
  const [newType, setNewType] = useState<NotificationType>('ITINERARY_EVENT');
  const [submitting, setSubmitting] = useState(false);

  const spent = trip.expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = trip.budget - spent;
  const progress = Math.min(100, Math.round((spent / trip.budget) * 100));
  const itineraryItems = [...trip.itinerary, ...customItems];

  useEffect(() => {
    if (!focusedTarget) return;
    const sectionId = resolveSectionId(focusedTarget.targetType);
    const timer = window.setTimeout(() => {
      const targetEl =
        (focusedTarget.targetId
          ? document.querySelector<HTMLElement>(`[data-target-id="${CSS.escape(focusedTarget.targetId)}"]`)
          : null) || document.getElementById(sectionId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedId(targetEl.getAttribute('data-target-id') || sectionId);
      }
    }, 60);

    const clearTimer = window.setTimeout(() => setHighlightedId(null), 2600);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clearTimer);
    };
  }, [trip.id, focusedTarget]);

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const created = await createTripEvent(
        trip.id,
        {
          title,
          type: newType,
          offsetMinutes: newOffset,
          timeZone: trip.timeZone,
        },
        currentUserId
      );
      setCustomItems(prev => [
        ...prev,
        {
          id: created.id,
          title: created.title,
          details: `Часовой пояс: ${trip.timeZone}`,
          when: `через ${newOffset} мин`,
        },
      ]);
      setNewTitle('');
      setShowAddForm(false);
      onToast?.(`Добавлено в маршрут: «${title}»`);
    } catch (err) {
      console.error(err);
      onToast?.('Не удалось добавить событие');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="trip-page-content">
      <a className="back-link" href="/" onClick={onBack}>
        <span aria-hidden="true">←</span> Все поездки
      </a>

      <div className="trip-page-heading">
        <div>
          <p className="eyebrow">ВАША ПОЕЗКА</p>
          <h1>{trip.place}</h1>
          <p className="intro-subtitle">{trip.destination} · {trip.dates}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onOpenSettings && (
            <button
              type="button"
              className="reminder-settings-trigger"
              onClick={onOpenSettings}
              title="Настройки напоминаний для этой поездки"
            >
              <span>🔔</span> Напоминания
            </button>
          )}
          <span className="trip-page-count">{trip.members.length} участника</span>
        </div>
      </div>

      <section
        id="section-overview"
        className={`trip-overview-card ${highlightedId === 'section-overview' ? 'target-highlight' : ''}`}
        aria-labelledby="overview-heading"
      >
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
            <div><span>Часовой пояс</span><strong>{trip.timeZone}</strong></div>
          </div>
        </div>
        <img className="trip-overview-image" src={trip.image} alt={`Пейзаж поездки: ${trip.place}`} />
      </section>

      <div className="trip-detail-grid">
        <section
          id="section-members"
          className={`detail-card members-card ${highlightedId === 'section-members' ? 'target-highlight' : ''}`}
          aria-labelledby="members-heading"
        >
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

        <section
          id="section-money"
          className={`detail-card money-card ${highlightedId === 'section-money' ? 'target-highlight' : ''}`}
          aria-labelledby="money-heading"
        >
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

      <div className="trip-detail-grid">
        <section
          id="section-bookings"
          className={`detail-card ${highlightedId === 'section-bookings' ? 'target-highlight' : ''}`}
          aria-labelledby="bookings-heading"
        >
          <div className="detail-heading">
            <span className="detail-section-number">04</span>
            <h2 id="bookings-heading">Транспорт и проживание</h2>
            <span className="detail-count">{trip.bookings.length}</span>
          </div>
          <div className="expense-list">
            {trip.bookings.map((booking) => (
              <div
                key={booking.id}
                data-target-id={booking.id}
                className={`expense-row ${highlightedId === booking.id ? 'target-highlight-row' : ''}`}
              >
                <div>
                  <strong>{booking.title}</strong>
                  <span>{booking.kind} · {booking.details}</span>
                </div>
                <strong>{booking.when}</strong>
              </div>
            ))}
          </div>
        </section>

        <section
          id="section-itinerary"
          className={`detail-card ${highlightedId === 'section-itinerary' ? 'target-highlight' : ''}`}
          aria-labelledby="itinerary-heading"
        >
          <div className="detail-heading">
            <span className="detail-section-number">05</span>
            <h2 id="itinerary-heading">Маршрут и события</h2>
            <button
              type="button"
              className="add-event-toggle-btn"
              onClick={() => setShowAddForm(prev => !prev)}
            >
              {showAddForm ? 'Скрыть' : '+ Добавить'}
            </button>
          </div>

          {showAddForm && (
            <form className="inline-event-form" onSubmit={handleAddEvent}>
              <input
                type="text"
                placeholder="Название события в маршруте"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                maxLength={120}
                required
              />
              <div className="inline-event-row">
                <select value={newType} onChange={e => setNewType(e.target.value as NotificationType)}>
                  <option value="ITINERARY_EVENT">Событие маршрута</option>
                  <option value="TRANSPORT_DEPARTURE">Отправление транспорта</option>
                  <option value="ACCOMMODATION_CHECKIN">Заселение в отель</option>
                  <option value="ACCOMMODATION_CHECKOUT">Выселение из отеля</option>
                </select>
                <select value={newOffset} onChange={e => setNewOffset(Number(e.target.value))}>
                  <option value={10}>Через 10 мин</option>
                  <option value={15}>Через 15 мин</option>
                  <option value={30}>Через 30 мин</option>
                  <option value={60}>Через 1 час</option>
                </select>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : 'Добавить'}
                </button>
              </div>
            </form>
          )}

          <div className="expense-list">
            {itineraryItems.map((item) => (
              <div
                key={item.id}
                data-target-id={item.id}
                className={`expense-row ${highlightedId === item.id ? 'target-highlight-row' : ''}`}
              >
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.details}</span>
                </div>
                <strong>{item.when}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
