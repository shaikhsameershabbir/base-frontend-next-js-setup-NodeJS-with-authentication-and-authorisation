import React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const Dialog = ({ isOpen, onClose, children, title }: DialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-50 w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                {title && (
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Close dialog"
                            >
                                <svg
                                    className="h-5 w-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                <div className="px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export { Dialog }; 