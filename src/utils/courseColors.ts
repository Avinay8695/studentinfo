import { COURSES } from '@/data/courses';

// Course category color mapping for badges & avatars
const CATEGORY_COLORS: Record<string, { bg: string; text: string; badge: string; avatar: string }> = {
  'Computer Applications': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    avatar: 'from-blue-500 to-cyan-500',
  },
  'Design & Publishing': {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
    avatar: 'from-violet-500 to-purple-500',
  },
  'Accounting': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    avatar: 'from-emerald-500 to-teal-500',
  },
  'Office Management': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    avatar: 'from-amber-500 to-orange-500',
  },
  'Language & Skills': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    avatar: 'from-rose-500 to-pink-500',
  },
  'Professional': {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    avatar: 'from-indigo-500 to-blue-600',
  },
};

const DEFAULT_COLORS = {
  bg: 'bg-primary/10',
  text: 'text-primary',
  badge: 'bg-primary/15 text-primary border-primary/20',
  avatar: 'from-primary to-accent',
};

export function getCourseColors(courseName: string) {
  const course = COURSES.find(c => c.name === courseName);
  const category = course?.category || '';
  return CATEGORY_COLORS[category] || DEFAULT_COLORS;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}
