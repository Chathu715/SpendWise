// Type augmentation for lucide-react-native
// Adds missing exports and props that are present at runtime but missing from TS types

import type { ForwardRefExoticComponent } from 'react';

type LucideIcon = ForwardRefExoticComponent<{
  size?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  [key: string]: any;
}>;

declare module 'lucide-react-native' {
  // Color prop fix
  interface LucideProps {
    color?: string;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
  }

  // Icons renamed/added in v0.5xx but missing from tsc resolution
  export const House: LucideIcon;
  export const ChartBar: LucideIcon;
  export const TriangleAlert: LucideIcon;
  export const Wallet: LucideIcon;
  export const Check: LucideIcon;
  export const X: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const LogOut: LucideIcon;
  export const Plus: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const CircleAlert: LucideIcon;
  export const Package: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Pencil: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Settings: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;
  export const Monitor: LucideIcon;
  export const Info: LucideIcon;
  export const UtensilsCrossed: LucideIcon;
  export const Bus: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Heart: LucideIcon;
  export const Tv: LucideIcon;
}
