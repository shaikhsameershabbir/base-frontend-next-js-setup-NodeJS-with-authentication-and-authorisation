"use client";

import React from "react";
import { gameRate } from "@/app/constant/constant";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

function Page() {
  const rates = [
    {
      name: "Single",
      bet: "10₹",
      win: "90₹",
      icon: "🎯",
      bgColor: "bg-gradient-to-r from-emerald-400 to-teal-500"
    },
    {
      name: "Jodi",
      bet: "10₹",
      win: "900₹",
      icon: "🎲",
      bgColor: "bg-gradient-to-r from-violet-400 to-purple-500"
    },
    {
      name: "Single Panna",
      bet: "10₹",
      win: "1500₹",
      icon: "🔢",
      bgColor: "bg-gradient-to-r from-amber-400 to-orange-500"
    },
    {
      name: "Double Panna",
      bet: "10₹",
      win: "3000₹",
      icon: "🎪",
      bgColor: "bg-gradient-to-r from-rose-400 to-pink-500"
    },
    {
      name: "Triple Panna",
      bet: "10₹",
      win: "10000₹",
      icon: "⭐",
      bgColor: "bg-gradient-to-r from-cyan-400 to-blue-500"
    },
    {
      name: "Half Sangam",
      bet: "10₹",
      win: "10000₹",
      icon: "🏆",
      bgColor: "bg-gradient-to-r from-lime-400 to-green-500"
    },
    {
      name: "Full Sangam",
      bet: "10₹",
      win: "100000₹",
      icon: "👑",
      bgColor: "bg-gradient-to-r from-red-400 to-rose-500"
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-6">
          {/* Simple Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Game Rates</h1>
          </div>

          {/* Rates Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 px-4 py-3">
              <h2 className="text-lg font-semibold text-white">Current Rates</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Game Type</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Bet Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Win Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rates.map((rate, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${rate.bgColor}`}>
                            {rate.icon}
                          </div>
                          <span className="font-medium text-gray-800">{rate.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                          {rate.bet}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                          {rate.win}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default Page;
