"use client";

import React from "react";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

function Page() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 px-2 md:px-4">
        <h1 className="text-2xl font-bold text-center text-black mb-6 mt-2">
          Funds
        </h1>

        <div className="flex flex-col items-center justify-center">
          {/* Barcode Image */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <img
              src="/hiring1.png"
              alt="Barcode"
              className="w-full max-w-md mx-auto"
            />
          </div>

          {/* UIL ID */}
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
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
