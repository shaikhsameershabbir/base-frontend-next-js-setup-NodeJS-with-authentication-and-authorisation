import React from 'react';

interface FormLayoutProps {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    className?: string;
}

const FormLayout: React.FC<FormLayoutProps> = ({ children, onSubmit, className = "" }) => {
    return (
        <form onSubmit={onSubmit} className={`space-y-2 sm:space-y-4 ${className}`}>
            {children}
        </form>
    );
};

export default FormLayout;
