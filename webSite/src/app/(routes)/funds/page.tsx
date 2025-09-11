"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";
import apiClient from "@/lib/api-client";

interface ParentBarcodeData {
  barcodeImage: string | null;
  whatsappNumber: string | null;
  parentUsername: string;
  parentRole: string;
}

function Page() {
  const [barcodeData, setBarcodeData] = useState<ParentBarcodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParentBarcode();
  }, []);

  const fetchParentBarcode = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/parent-barcode');

      if (response.data.success) {
        setBarcodeData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load barcode');
      }
    } catch (err: any) {
      console.error('Error fetching parent barcode:', err);
      setError(err.response?.data?.message || 'Failed to load barcode');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (barcodeData?.whatsappNumber) {
      // Remove any non-numeric characters except + and format the number
      const cleanNumber = barcodeData.whatsappNumber.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 px-2 md:px-4">
        <h1 className="text-2xl font-bold text-center text-black mb-6 mt-2">
          Funds
        </h1>

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Barcode Image */}
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                <p className="text-lg font-semibold mb-2">Unable to load barcode</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchParentBarcode}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                  Retry
                </button>
              </div>
            ) : barcodeData?.barcodeImage ? (
              <img
                src={barcodeData.barcodeImage}
                alt="Parent Barcode"
                className="w-full mx-auto"
              />
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">No barcode available</p>
                <p className="text-sm">
                  {barcodeData?.parentUsername ?
                    `${barcodeData.parentUsername} (${barcodeData.parentRole}) hasn't uploaded a barcode yet.` :
                    'Parent barcode not found.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {barcodeData && !loading && !error && (
            <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md text-center">
              <h3 className="text-lg font-semibold text-black mb-3">Contact Information</h3>

              {/* Parent Info */}
              <div className="mb-3">
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="text-lg font-semibold text-primary">
                  {barcodeData.parentUsername} ({barcodeData.parentRole})
                </p>
              </div>

              {/* WhatsApp Number */}
              {barcodeData.whatsappNumber ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">WhatsApp Number</p>
                  <p className="text-lg font-semibold text-black">{barcodeData.whatsappNumber}</p>

                  {/* WhatsApp Button */}
                  <button
                    onClick={openWhatsApp}
                    className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    <span>Open WhatsApp</span>
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-sm">No WhatsApp number available</p>
                </div>
              )}
            </div>
          )}

          {/* UIL ID */}
          <div className="bg-white rounded-lg shadow-md p-4 text-center w-full max-w-md">
            <p className="text-lg font-semibold text-black">UIL ID</p>
            <p className="text-2xl font-bold text-primary">123456789</p>
          </div>
        </div>
      </div>

      <div className="block">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;
