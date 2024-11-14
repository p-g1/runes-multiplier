import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
  const variantStyles = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    secondary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  }
  const sizeStyles = {
    default: 'px-4 py-2',
    sm: 'px-3 py-2 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}