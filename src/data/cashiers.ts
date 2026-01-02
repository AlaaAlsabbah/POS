import { Cashier } from '../types';

export const cashiers: Cashier[] = [
  {
    id: 'cash-001',
    name: 'Ahmad Ali',
    pin: '1234',
    avatar: undefined,
  },
  {
    id: 'cash-002',
    name: 'Mahmoud Abdullah',
    pin: '5678',
    avatar: undefined,
  },
  {
    id: 'cash-003',
    name: 'Abdullah Al-Absi',
    pin: '9999',
    avatar: undefined,
  },
];

export const cashiersById = new Map(cashiers.map(c => [c.id, c]));

