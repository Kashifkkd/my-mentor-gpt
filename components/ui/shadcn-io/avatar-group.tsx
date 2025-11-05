'use client';

import { Children, cloneElement, isValidElement, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'stack' | 'grid';
  animate?: boolean;
  size?: number;
  max?: number;
}

export function AvatarGroup({
  children,
  variant = 'stack',
  animate = false,
  size = 40,
  max,
  className,
  ...props
}: AvatarGroupProps) {
  const validChildren = Children.toArray(children).filter(isValidElement);
  const displayCount = max ? Math.min(validChildren.length, max) : validChildren.length;
  const overflowCount = max && validChildren.length > max ? validChildren.length - max : 0;

  return (
    <div
      className={cn(
        'flex items-center',
        variant === 'stack' && '-space-x-2',
        variant === 'grid' && 'flex-wrap gap-2',
        animate && 'transition-all duration-300',
        className
      )}
      {...props}
    >
      {validChildren.slice(0, displayCount).map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            key: child.key || index,
            className: cn(
              child.props.className,
              variant === 'stack' && 'ring-2 ring-background',
              size && `size-${size}`
            ),
            style: {
              ...child.props.style,
              width: size,
              height: size,
            },
          });
        }
        return child;
      })}
      {overflowCount > 0 && (
        <Avatar className={cn('ring-2 ring-background', size && `size-${size}`)}>
          <AvatarFallback className="text-xs">
            +{overflowCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

