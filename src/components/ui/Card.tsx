import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

function Card({ header, footer, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-c2 border border-c3
        transition-colors duration-200
        hover:bg-c3
        ${className}
      `.trim()}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-c2">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-c2">
          {footer}
        </div>
      )}
    </div>
  );
}

export { Card };
export type { CardProps };
