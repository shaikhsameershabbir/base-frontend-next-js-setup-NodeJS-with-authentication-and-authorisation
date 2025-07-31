"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationType } from '@/components/ui/notification-modal';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (type: NotificationType, title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => void;
    showSuccess: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => void;
    showError: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => void;
    showWarning: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => void;
    showInfo: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        options?: {
            autoClose?: boolean;
            autoCloseDelay?: number;
        }
    ) => {
        const id = Date.now().toString();
        const notification: Notification = {
            id,
            type,
            title,
            message,
            autoClose: options?.autoClose ?? true,
            autoCloseDelay: options?.autoCloseDelay ?? 3000
        };

        setNotifications(prev => [...prev, notification]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const showSuccess = useCallback((title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
        showNotification('success', title, message, options);
    }, [showNotification]);

    const showError = useCallback((title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
        showNotification('error', title, message, options);
    }, [showNotification]);

    const showWarning = useCallback((title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
        showNotification('warning', title, message, options);
    }, [showNotification]);

    const showInfo = useCallback((title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
        showNotification('info', title, message, options);
    }, [showNotification]);

    const value: NotificationContextType = {
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 