import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CarePoint, FacilityReport, RealtimeSyncEvent, UserRating } from '../types';

interface RealtimeContextType {
  isConnected: boolean;
  activeWorkersCount: number;
  lastSyncTime: Date | null;
  latestEvent: RealtimeSyncEvent | null;
  broadcastAction: (type: string, payload: any) => void;
  syncCarePoints: () => Promise<CarePoint[]>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{
  children: React.ReactNode;
  onCarePointUpdated?: (point: CarePoint) => void;
  onCarePointAdded?: (point: CarePoint) => void;
  onRatingAdded?: (rating: UserRating, updatedPoint?: CarePoint) => void;
  onReportAdded?: (report: FacilityReport, updatedPoint?: CarePoint) => void;
}> = ({ children, onCarePointUpdated, onCarePointAdded, onRatingAdded, onReportAdded }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeWorkersCount, setActiveWorkersCount] = useState<number>(14);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [latestEvent, setLatestEvent] = useState<RealtimeSyncEvent | null>(null);

  // References to latest callbacks to avoid re-subscribing EventSource unnecessarily
  const callbacksRef = useRef({
    onCarePointUpdated,
    onCarePointAdded,
    onRatingAdded,
    onReportAdded,
  });

  useEffect(() => {
    callbacksRef.current = {
      onCarePointUpdated,
      onCarePointAdded,
      onRatingAdded,
      onReportAdded,
    };
  });

  const syncCarePoints = useCallback(async (): Promise<CarePoint[]> => {
    try {
      const res = await fetch('/api/care-points');
      if (res.ok) {
        const data = await res.json();
        setLastSyncTime(new Date());
        return data;
      }
    } catch (e) {
      console.warn('Realtime sync fetch fallback', e);
    }
    return [];
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
          setLastSyncTime(new Date());
        };

        eventSource.onmessage = (event) => {
          try {
            const parsed: RealtimeSyncEvent = JSON.parse(event.data);
            setLatestEvent(parsed);
            setLastSyncTime(new Date());

            if (parsed.type === 'CARE_POINT_ADDED') {
              callbacksRef.current.onCarePointAdded?.(parsed.payload);
            } else if (parsed.type === 'CARE_POINT_UPDATED') {
              callbacksRef.current.onCarePointUpdated?.(parsed.payload);
            } else if (parsed.type === 'RATING_ADDED') {
              callbacksRef.current.onRatingAdded?.(parsed.payload.rating, parsed.payload.updatedCarePoint);
            } else if (parsed.type === 'REPORT_ADDED') {
              callbacksRef.current.onReportAdded?.(parsed.payload.report, parsed.payload.updatedCarePoint);
            } else if (parsed.type === 'USER_JOINED') {
              setActiveWorkersCount((prev) => prev + 1);
            }
          } catch (e) {
            console.error('Failed to parse SSE event data', e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect after 5s
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const broadcastAction = (type: string, payload: any) => {
    setLatestEvent({
      type: type as any,
      payload,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        activeWorkersCount,
        lastSyncTime,
        latestEvent,
        broadcastAction,
        syncCarePoints,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
