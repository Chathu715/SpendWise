import {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Heart,
  Tv,
  Package,
} from 'lucide-react-native';
import type { ForwardRefExoticComponent } from 'react';
type LucideIcon = ForwardRefExoticComponent<any>;

export interface Category {
  name: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
}

export const CATS: Category[] = [
  { name: 'Food',          Icon: UtensilsCrossed, color: '#F97316', bg: '#F9731614' },
  { name: 'Transport',     Icon: Bus,             color: '#38BDF8', bg: '#38BDF814' },
  { name: 'Shopping',      Icon: ShoppingBag,     color: '#A78BFA', bg: '#A78BFA14' },
  { name: 'Health',        Icon: Heart,           color: '#34D399', bg: '#34D39914' },
  { name: 'Entertainment', Icon: Tv,              color: '#FBBF24', bg: '#FBBF2414' },
  { name: 'Other',         Icon: Package,         color: '#94A3B8', bg: '#94A3B814' },
];

export const getCat = (name: string): Category =>
  CATS.find((c) => c.name === name) ?? CATS[5];
