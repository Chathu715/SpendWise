export const formatLKR = (amount: number): string =>
  `LKR ${Math.round(amount).toLocaleString('en-LK')}`;

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-LK', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getCurrentMonthLabel = (): string => {
  return new Date().toLocaleDateString('en-LK', {
    month: 'long',
    year: 'numeric',
  });
};

export const getCurrentMonth = (): string =>
  new Date().toISOString().slice(0, 7); // "2026-03"

export const getFirstDayOfMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export const getMonthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleDateString('en-LK', { month: 'long', year: 'numeric' });

const pad = (n: number) => String(n).padStart(2, '0');

export const getMonthRange = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return {
    first: `${year}-${pad(month)}-01`,
    last:  `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

export const prevMonth = (year: number, month: number) =>
  month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

export const nextMonth = (year: number, month: number) =>
  month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

export const isCurrentMonth = (year: number, month: number): boolean => {
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
};

export const getWarningLevel = (
  spent: number,
  limit: number
): 'none' | 'warning' | 'exceeded' => {
  if (!limit || limit === 0) return 'none';
  const pct = (spent / limit) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80)  return 'warning';
  return 'none';
};

export const getProgressColor = (
  spent: number,
  limit: number,
  accColor: string,
  amberColor: string,
  redColor: string
): string => {
  if (!limit || limit === 0) return accColor;
  const pct = (spent / limit) * 100;
  if (pct >= 100) return redColor;
  if (pct >= 80)  return amberColor;
  return accColor;
};
