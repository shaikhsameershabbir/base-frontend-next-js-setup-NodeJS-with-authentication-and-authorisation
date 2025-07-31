"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationModalProps {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    onClose: () => void;
    showCloseButton?: boolean;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    type,
    title,
    message,
    onClose,
    showCloseButton = true,
    autoClose = true,
    autoCloseDelay = 3000
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle entrance animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsAnimating(true);
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsAnimating(false);
            }, 200); // Match exit animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto close functionality
    useEffect(() => {
        if (isOpen && autoClose && !isAnimating) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose, isAnimating]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
                    icon: 'text-green-600',
                    title: 'text-green-900',
                    message: 'text-green-700',
                    button: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg',
                    accent: 'bg-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
                    icon: 'text-red-600',
                    title: 'text-red-900',
                    message: 'text-red-700',
                    button: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg',
                    accent: 'bg-red-500'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
                    icon: 'text-yellow-600',
                    title: 'text-yellow-900',
                    message: 'text-yellow-700',
                    button: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg',
                    accent: 'bg-yellow-500'
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
                    icon: 'text-blue-600',
                    title: 'text-blue-900',
                    message: 'text-blue-700',
                    button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg',
                    accent: 'bg-blue-500'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
                    icon: 'text-gray-600',
                    title: 'text-gray-900',
                    message: 'text-gray-700',
                    button: 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg',
                    accent: 'bg-gray-500'
                };
        }
    };

    const styles = getStyles();

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with animation */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${isAnimating ? 'bg-opacity-0 backdrop-blur-none' : 'bg-opacity-60 backdrop-blur-sm'
                    }`}
                onClick={onClose}
            />

            {/* Modal with modern design */}
            <div
                className={`relative w-full max-w-lg transform rounded-3xl border-0 shadow-2xl transition-all duration-300 ease-out ${styles.bg
                    } ${isAnimating
                        ? 'scale-95 opacity-0 translate-y-4'
                        : 'scale-100 opacity-100 translate-y-0'
                    }`}
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full rounded-t-3xl ${styles.accent}`} />

                {/* Content container */}
                <div className="p-8">
                    {/* Header with icon and close button */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`transition-all duration-500 ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
                                }`}>
                                {getIcon()}
                            </div>
                            <div className={`transition-all duration-500 delay-100 ${isAnimating ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'
                                }`}>
                                <h3 className={`text-xl font-bold ${styles.title}`}>
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:rotate-90"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Message with modern typography */}
                    <div className={`text-base leading-relaxed ${styles.message} transition-all duration-500 delay-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                        }`}>
                        {message}
                    </div>

                    {/* Footer with modern button */}
                    <div className={`mt-8 flex justify-end transition-all duration-500 delay-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                        }`}>
                        <button
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${styles.button}`}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Use portal to render modal at the top level
    return createPortal(modalContent, document.body);
};

export default NotificationModal; 