import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<{ children: React.ReactNode, className?: string }>;
  Title: React.FC<{ children: React.ReactNode, className?: string }>;
  Body: React.FC<{ children: React.ReactNode, className?: string }>;
  Description: React.FC<{ children: React.ReactNode, className?: string }>;
} = ({ children, className }) => {
  return (
    <div className={`relative bg-black/50 border border-gray-700/50 rounded-lg shadow-lg backdrop-blur-sm h-full flex flex-col ${className}`}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return <div className={`p-4 border-b border-gray-700/50 flex items-center ${className}`}>{children}</div>;
};

const CardTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return <h2 className={`font-cinzel text-lg font-bold text-gray-100 ml-3 tracking-wider ${className}`}>{children}</h2>;
};

const CardBody: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return <div className={`p-4 flex-grow ${className}`}>{children}</div>;
};

const CardDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return <p className={`text-sm text-gray-400 ${className}`}>{children}</p>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Description = CardDescription;

export default Card;