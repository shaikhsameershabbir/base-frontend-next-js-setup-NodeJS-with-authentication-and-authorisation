"use client";

import React from 'react';
import NotificationModal from './notification-modal';
import { useNotification } from '@/contexts/NotificationContext';

export const NotificationRenderer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <>
            {notifications.map((notification) => (
                <NotificationModal
                    key={notification.id}
                    isOpen={true}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={() => removeNotification(notification.id)}
                    autoClose={notification.autoClose}
                    autoCloseDelay={notification.autoCloseDelay}
                />
            ))}
        </>
    );
}; 