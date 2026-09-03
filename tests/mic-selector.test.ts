import { describe, expect, it } from 'vitest';
import {
  findMicRoute,
  MIC_ROUTE_KINDS,
  type MicRoute,
  orderMicRoutes,
} from '../packages/registry/src/components/ai/mic-selector.logic.ts';

/**
 * Pure logic only — the route vocabulary and display order (see agent-status.test.ts's
 * header for why rendering itself cannot live in this tier). The route LIST is
 * caller-supplied per the PRD verdict (native-substitute): enumeration is the one part
 * with no honest registry implementation.
 */

describe('MIC_ROUTE_KINDS (the route vocabulary)', () => {
  it('is exactly the PRD verdict list plus the catch-all', () => {
    expect([...MIC_ROUTE_KINDS]).toEqual(['built-in', 'wired', 'bluetooth', 'other']);
  });
});

describe('orderMicRoutes (deterministic display order)', () => {
  const ROUTES: MicRoute[] = [
    { id: 'bt', label: 'Car Bluetooth', kind: 'bluetooth' },
    { id: 'built-in', label: 'iPhone Microphone', kind: 'built-in' },
    { id: 'usb', label: 'Unknown Dongle' }, // no kind → other
    { id: 'wired', label: 'Headphones', kind: 'wired' },
  ];

  it('orders built-in, wired, bluetooth, other', () => {
    expect(orderMicRoutes(ROUTES).map((r) => r.id)).toEqual(['built-in', 'wired', 'bt', 'usb']);
  });

  it('preserves caller order within a kind', () => {
    const routes: MicRoute[] = [
      { id: 'bt-2', label: 'Second BT', kind: 'bluetooth' },
      { id: 'bt-1', label: 'First BT', kind: 'bluetooth' },
    ];
    expect(orderMicRoutes(routes).map((r) => r.id)).toEqual(['bt-2', 'bt-1']);
  });

  it('does not mutate the caller array', () => {
    const routes: MicRoute[] = [
      { id: 'bt', label: 'BT', kind: 'bluetooth' },
      { id: 'mic', label: 'Mic', kind: 'built-in' },
    ];
    orderMicRoutes(routes);
    expect(routes.map((r) => r.id)).toEqual(['bt', 'mic']);
  });

  it('is a no-op on an empty list', () => {
    expect(orderMicRoutes([])).toEqual([]);
  });
});

describe('findMicRoute (the trigger readout)', () => {
  const ROUTES: MicRoute[] = [{ id: 'built-in', label: 'iPhone Microphone', kind: 'built-in' }];

  it('finds the selected route', () => {
    expect(findMicRoute(ROUTES, 'built-in')?.label).toBe('iPhone Microphone');
  });

  it('returns undefined for no value and for a stale (disconnected) id', () => {
    expect(findMicRoute(ROUTES, undefined)).toBeUndefined();
    expect(findMicRoute(ROUTES, 'ghost')).toBeUndefined();
  });
});
