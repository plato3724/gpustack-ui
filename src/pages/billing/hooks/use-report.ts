import { useEffect, useRef, useState } from 'react';
import type { Dimension, Period, Report } from '../config/types';
import { queryReport } from '../services';

export default function useReport(period: Period, dimension: Dimension) {
  const [state, setState] = useState<{
    loading: boolean;
    data?: Report;
    error?: unknown;
  }>({ loading: true });
  const current = useRef<AbortController>();
  const load = async () => {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setState({ loading: true });
    try {
      const data = await queryReport(period, dimension, controller.signal);
      if (!controller.signal.aborted) setState({ loading: false, data });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error });
    }
  };
  // The host remounts this report when the operator changes period/grouping.
  useEffect(() => {
    void load();
    return () => current.current?.abort();
  }, []);
  return { ...state, reload: load };
}
