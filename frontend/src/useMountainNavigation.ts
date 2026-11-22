import { useCallback, useEffect, useRef, useState } from 'react';
import { trips } from './trips';

function tripFromLocation() {
  return trips.find(trip => window.location.pathname.replace(/\/$/, '') === `/trips/${trip.id}`)?.id || null;
}

type Destination = { id: string | null; push: boolean };

export default function useMountainNavigation(motion: boolean) {
  const [tripId, setTripId] = useState<string | null>(tripFromLocation);
  const [transitioning, setTransitioning] = useState(false);
  const pending = useRef<Destination | null>(null);
  const active = useRef(false);
  const timers = useRef<number[]>([]);

  const commit = useCallback((destination: Destination) => {
    const path = destination.id ? `/trips/${destination.id}` : '/';
    if (destination.push && location.pathname !== path) window.history.pushState(null, '', path);
    setTripId(destination.id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const runTransition = useCallback((destination: Destination) => {
    pending.current = destination;
    if (!motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.current.forEach(window.clearTimeout);
      pending.current = null;
      active.current = false;
      setTransitioning(false);
      commit(destination);
      return;
    }
    if (active.current) return;
    active.current = true;
    setTransitioning(true);
    timers.current = [
      window.setTimeout(() => {
        const next = pending.current;
        pending.current = null;
        if (next) commit(next);
      }, 480),
      window.setTimeout(() => {
        // A browser history event during the reveal takes precedence.
        if (pending.current) commit(pending.current);
        pending.current = null;
        active.current = false;
        timers.current = [];
        setTransitioning(false);
      }, 1200),
    ];
  }, [commit, motion]);

  useEffect(() => {
    const onPopState = () => runTransition({ id: tripFromLocation(), push: false });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [runTransition]);

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  const navigate = useCallback((id: string | null) => {
    if (id === tripFromLocation() && !active.current) return;
    runTransition({ id, push: true });
  }, [runTransition]);

  return { tripId, navigate, transitioning };
}
