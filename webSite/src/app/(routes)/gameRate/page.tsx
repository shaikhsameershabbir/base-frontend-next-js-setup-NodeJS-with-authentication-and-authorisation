"use client";

import React from "react";
import { gameRate } from "@/app/constant/constant";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

function Page() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 px-2 md:px-4">
        <h1 className="text-2xl font-bold text-center text-black mb-6 mt-2">
          Game Rate
        </h1>
        <p className="text-center text-orange-500 font-bold mb-6">
          {gameRate[0].message}
        </p>

        {/* Cards: 1 column on mobile, 3 columns on medium+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          {[gameRate[0].r1, gameRate[0].r2, gameRate[0].r3, gameRate[0].r4, gameRate[0].r5, gameRate[0].r6, gameRate[0].r7].map(
            (rate, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center"
              >
                <h2 className="text-2xl font-bold text-gray-800">{rate}</h2>
              </div>
            )
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;
