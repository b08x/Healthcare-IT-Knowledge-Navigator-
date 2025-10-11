import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-brand-surface p-6 rounded-xl border border-brand-subtle/10 shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;