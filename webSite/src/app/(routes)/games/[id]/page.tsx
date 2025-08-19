"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import Header from "@/app/components/Header";

const gameTypes = [
  {
    id: "single",
    name: "Single",
    icon: "/Game/single_panna.png",
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-50 to-teal-50",
    description: "Bet on single digits"
  },
  {
    id: "jodi-digits",
    name: "Jodi",
    icon: "/Game/sp_dp_tp.png",
    color: "from-violet-500 to-purple-600",
    bgColor: "from-violet-50 to-purple-50",
    description: "Two-digit combinations"
  },
  {
    id: "single-panna",
    name: "SP",
    icon: "/Game/single_panna.png",
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-50 to-orange-50",
    description: "Three-digit patterns"
  },
  {
    id: "double-panna",
    name: "DP",
    icon: "/Game/sp_dp_tp.png",
    color: "from-rose-500 to-pink-600",
    bgColor: "from-rose-50 to-pink-50",
    description: "Double digit patterns"
  },
  {
    id: "triple-panna",
    name: "TP",
    icon: "/Game/sp_dp_tp.png",
    color: "from-cyan-500 to-blue-600",
    bgColor: "from-cyan-50 to-blue-50",
    description: "Triple digit patterns"
  },
  {
    id: "sp-motor",
    name: "SP Motor",
    icon: "/Game/sp-motor.png",
    color: "from-lime-500 to-green-600",
    bgColor: "from-lime-50 to-green-50",
    description: "Single Panna Motor"
  },
  {
    id: "dp-motor",
    name: "DP Motor",
    icon: "/Game/sp-motor.png",
    color: "from-red-500 to-rose-600",
    bgColor: "from-red-50 to-rose-50",
    description: "Double Panna Motor"
  },
  {
    id: "SP_DP",
    name: "Common",
    icon: "/Game/sp_dp_tp.png",
    color: "from-indigo-500 to-purple-600",
    bgColor: "from-indigo-50 to-purple-50",
    description: "Combined patterns"
  },
  {
    id: "red-bracket",
    name: "Bracket",
    icon: "/Game/odd_even.png",
    color: "from-yellow-500 to-orange-600",
    bgColor: "from-yellow-50 to-orange-50",
    description: "Bracket betting"
  },
  {
    id: "cycle-panna",
    name: "Cycle",
    icon: "/Game/cycly_panna.png",
    color: "from-blue-500 to-cyan-600",
    bgColor: "from-blue-50 to-cyan-50",
    description: "Cyclic patterns"
  },
  {
    id: "family-panel",
    name: "Family",
    icon: "/Game/family_panel.png",
    color: "from-pink-500 to-rose-600",
    bgColor: "from-pink-50 to-rose-50",
    description: "Family combinations"
  },
  {
    id: "sangam",
    name: "Sangam",
    icon: "/Game/half_sangam.png",
    color: "from-purple-500 to-indigo-600",
    bgColor: "from-purple-50 to-indigo-50",
    description: "Half & Full Sangam"
  },
];

const GamePageContent = () => {
  const params = useParams();
  const router = useRouter();
  const gameName = (params.id as string)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleGameTypeClick = (typeId: string) => {
    router.push(`/games/${params.id}/${typeId}`);
  };

  return (
    <>
      <div className="flex flex-col h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex-1 overflow-y-auto p-4">
          {/* Hero Header Section */}
          

          {/* Game Types Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {gameTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleGameTypeClick(type.id)}
                className="group relative overflow-hidden bg-white rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 active:scale-95"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Icon Container */}
                <div className={`relative w-20 h-20 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  {/* SVG Icons instead of images */}
                  <div className="w-12 h-12 text-white">
                    {type.id === "single" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {type.id === "jodi-digits" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    )}
                    {type.id === "single-panna" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    {type.id === "double-panna" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    {type.id === "triple-panna" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    {type.id === "sp-motor" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {type.id === "dp-motor" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {type.id === "SP_DP" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    {type.id === "red-bracket" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {type.id === "cycle-panna" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {type.id === "family-panel" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {type.id === "sangam" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Game Name */}
                <span className="relative text-gray-800 font-bold text-center text-sm leading-tight group-hover:text-gray-900 transition-colors duration-300 mb-2">
                  {type.name}
                </span>

                {/* Description */}
                <span className="relative text-gray-500 text-xs text-center leading-tight opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  {type.description}
                </span>

                {/* Hover Effect Indicator */}
                <div className="relative mt-3 w-8 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12"></div>

                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-${type.color.split('-')[1]}-500 opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-none">
          <BottomNav />
        </div>
      </div>
    </>
  );
};

const GamePage = () => {
  return <GamePageContent />;
};

export default GamePage;