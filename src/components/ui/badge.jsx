import React from 'react';

const Badge = React.forwardRef(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${className}`}
    {...props}
  >
    {children}
  </span>
));

Badge.displayName = "Badge";

export { Badge };
