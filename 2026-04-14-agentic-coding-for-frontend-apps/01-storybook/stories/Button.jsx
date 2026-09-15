import React from 'react'

export const Button = ({ variant = 'primary', size = 'medium', children, onClick, disabled = false }) => {
  const baseStyles = {
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 500,
    borderRadius: '100px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    transition: 'background-color 0.2s',
  }

  const variants = {
    primary: { backgroundColor: '#2563eb', color: '#fff' },
    secondary: { backgroundColor: '#e5e7eb', color: '#1f2937' },
    danger: { backgroundColor: '#dc2626', color: '#fff' },
  }

  const sizes = {
    small: { padding: '6px 12px', fontSize: '13px' },
    medium: { padding: '8px 16px', fontSize: '14px' },
    large: { padding: '12px 24px', fontSize: '16px' },
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
    >
      {children}
    </button>
  )
}
