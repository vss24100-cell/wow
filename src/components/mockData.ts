import { Animal, User } from '../App';

export { translations } from '../i18n/translations';

export const mockAnimals: Animal[] = [];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    role: 'zookeeper',
    permissions: ['view_animals', 'update_logs', 'upload_media'],
    password: 'zoo123',
  },
  {
    id: '2',
    name: 'Dr. Anjali Patel',
    role: 'vet',
    permissions: ['view_health', 'prescribe', 'view_logs'],
    password: 'vet123',
  },
  {
    id: '3',
    name: 'Rajiv Singh',
    role: 'admin',
    permissions: ['all'],
    password: 'admin123',
  },
  {
    id: '4',
    name: 'Officer Mehta',
    role: 'officer',
    permissions: ['view_food', 'view_costs'],
    password: 'officer123',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'zookeeper',
    permissions: ['view_animals', 'update_logs', 'upload_media'],
    password: 'zoo456',
  },
];
