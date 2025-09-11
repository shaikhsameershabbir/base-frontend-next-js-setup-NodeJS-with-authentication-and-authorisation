'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, X, Phone, QrCode, Trash2 } from 'lucide-react';

interface PaymentConfiguration {
    barcodeImage: string | null;
    whatsappNumber: string | null;
}

export default function PaymentConfigurationPage() {
    const { user } = useAuth();
    const [config, setConfig] = useState<PaymentConfiguration>({
        barcodeImage: null,
        whatsappNumber: null
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load payment configuration on component mount
    useEffect(() => {
        loadPaymentConfiguration();
    }, []);

    const loadPaymentConfiguration = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/users/payment-configuration');
            if (response.data.success) {
                setConfig(response.data.data);
            }
        } catch (error) {
            console.error('Error loading payment configuration:', error);
            toast.error('Failed to load payment configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({
            ...prev,
            whatsappNumber: e.target.value
        }));
    };

    const handleSaveWhatsAppNumber = async () => {
        try {
            setLoading(true);
            const response = await apiClient.put('/users/payment-configuration', {
                whatsappNumber: config.whatsappNumber
            });

            if (response.data.success) {
                toast.success('WhatsApp number updated successfully');
                setConfig(response.data.data);
            }
        } catch (error: any) {
            console.error('Error updating WhatsApp number:', error);
            const message = error.response?.data?.message || 'Failed to update WhatsApp number';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleImageUpload = async (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG, and GIF images are allowed');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setUploading(true);

            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await apiClient.post('/users/payment-configuration/upload-barcode', {
                imageData: base64
            });

            if (response.data.success) {
                toast.success('Barcode image uploaded successfully');
                setConfig(response.data.data);
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            const message = error.response?.data?.message || 'Failed to upload image';
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            setLoading(true);
            const response = await apiClient.delete('/users/payment-configuration/barcode');

            if (response.data.success) {
                toast.success('Barcode image deleted successfully');
                setConfig(response.data.data);
            }
        } catch (error: any) {
            console.error('Error deleting image:', error);
            const message = error.response?.data?.message || 'Failed to delete image';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Payment Configuration</h1>
                    <p className="text-muted">Manage your barcode image and WhatsApp contact information</p>
                </div>

                <div className="space-y-6">
                    {/* WhatsApp Number Section */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold text-primary">WhatsApp Number</h2>
                        </div>
                        <p className="text-muted mb-4">Enter your WhatsApp contact number for customer support</p>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="whatsappNumber" className="text-sm font-medium">
                                    WhatsApp Number
                                </Label>
                                <Input
                                    id="whatsappNumber"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={config.whatsappNumber || ''}
                                    onChange={handleWhatsAppNumberChange}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted mt-1">
                                    Include country code (e.g., +1 for US, +91 for India)
                                </p>
                            </div>

                            <Button
                                onClick={handleSaveWhatsAppNumber}
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                {loading ? 'Saving...' : 'Save WhatsApp Number'}
                            </Button>
                        </div>
                    </Card>

                    <Separator />

                    {/* Barcode Image Section */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <QrCode className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold text-primary">Barcode Image</h2>
                        </div>
                        <p className="text-muted mb-4">Upload your payment barcode/QR code image</p>

                        <div className="space-y-4">
                            {/* Image Preview */}
                            {config.barcodeImage ? (
                                <div className="space-y-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={config.barcodeImage}
                                            alt="Barcode"
                                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                                            onClick={handleDeleteImage}
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted">
                                        Current barcode image. Click the X button to delete or upload a new one.
                                    </p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-muted mb-4">No barcode image uploaded</p>
                                    <p className="text-sm text-muted">Upload a JPEG, PNG, or GIF image (max 5MB)</p>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={openFileDialog}
                                    disabled={uploading}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {config.barcodeImage ? 'Change Image' : 'Upload Image'}
                                </Button>

                                {config.barcodeImage && (
                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteImage}
                                        disabled={loading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Image
                                    </Button>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {uploading && (
                                <p className="text-sm text-muted">Uploading image...</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}