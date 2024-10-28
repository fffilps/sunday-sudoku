import React from 'react'

export interface LabelProps {
  text: string; // Example member
  className?: string; // Added className property
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }
