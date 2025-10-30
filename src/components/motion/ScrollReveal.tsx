'use client';

import type { CSSProperties, HTMLAttributes, ElementType } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { cn } from '@/lib/utils';

type Variant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'skew'
  | 'blur'
  | 'clip';

type Props = {
  as?: ElementType; // tidak bergantung namespace JSX global
  variant?: Variant;
  delay?: number;
  duration?: number;
  origin?: CSSProperties['transformOrigin'];
  once?: boolean;
} & HTMLAttributes<HTMLElement>;

export default function ScrollReveal({
  as: Tag = 'div',
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  origin,
  once = true,
  className,
  style,
  children,
  ...rest
}: Props) {
  const { ref, inView } = useInView<HTMLElement>({ once });

  return (
    <Tag
      ref={ref as any}
      className={cn(
        'sr',
        variant === 'fade-up' && 'sr-fade-up',
        variant === 'fade-down' && 'sr-fade-down',
        variant === 'fade-left' && 'sr-fade-left',
        variant === 'fade-right' && 'sr-fade-right',
        variant === 'zoom-in' && 'sr-zoom-in',
        variant === 'skew' && 'sr-skew',
        variant === 'blur' && 'sr-blur',
        variant === 'clip' && 'sr-clip',
        inView && 'sr-visible',
        className
      )}
      style={
        {
          ...(style || {}),
          transitionDelay: `${delay}ms`,
          ['--sr-dur' as any]: `${duration}ms`,
          ['--sr-origin' as any]: origin,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}