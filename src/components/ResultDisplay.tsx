import { ReactNode } from 'react';

interface ResultDisplayProps {
  children: ReactNode;
  className?: string;
}

const ResultDisplay = ({ children, className = '' }: ResultDisplayProps) => {
  return (
    <div className={`result-box flex items-center justify-center min-h-[3rem] ${className}`}>
      {children}
    </div>
  );
};

export default ResultDisplay;
