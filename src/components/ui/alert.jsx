import React from 'react';

const Alert = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: 'bg-white border-gray-200',
    destructive: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm leading-relaxed ${className}`}
    {...props}
  />
));

Alert.displayName = "Alert";
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
