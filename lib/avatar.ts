import type { AvatarProps } from '@heroui/react';

type AvatarColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * Generate a consistent color based on user id
 * This ensures the same user always gets the same color
 */
export const getAvatarColor = (id: number): AvatarColor => {
  const colors: AvatarColor[] = [
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
  ];
  return colors[id % colors.length];
};

/**
 * Generate avatar props for HeroUI User component
 * Creates consistent colored avatar with fallback initials
 */
export const getAvatarProps = (
  id: number,
  name: string | null | undefined,
  email: string,
  size: AvatarProps['size'] = 'md',
  src?: string | null
): AvatarProps => {
  return {
    size,
    name: name || email,
    color: getAvatarColor(id),
    ...(src && { src }),
  };
};
