'use client';

import React from 'react';
import { Button, ButtonProps } from './button';

// ✅ Безопасная обертка для использования в Server Components
export function ClientButton(props: ButtonProps) {
  return <Button {...props} />;
}

// ✅ Для async actions в Server Components
interface ServerActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  action?: () => Promise<void> | void;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
}

export function ServerActionButton({ action, formAction, ...props }: ServerActionButtonProps) {
  const handleClick = React.useCallback(async (e: React.MouseEvent) => {
    if (action) {
      e.preventDefault();
      try {
        await action();
      } catch (error) {
        console.error('Server action error:', error);
      }
    }
  }, [action]);

  if (formAction) {
    return (
      <form action={formAction} style={{ display: 'inline' }}>
        <Button type="submit" {...props} />
      </form>
    );
  }

  return <Button onClick={handleClick} {...props} />;
}