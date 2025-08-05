"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import Header from "@/app/components/Header";
import { GameDataProvider } from "@/contexts/GameDataContext";

const gameTypes = [
  { id: "single", name: "Single", icon: "/Game/single_panna.png" },
  { id: "jodi-digits", name: "Jodi DIGITS", icon: "/Game/sp_dp_tp.png" },
  { id: "single-panna", name: "Single Panna", icon: "/Game/single_panna.png" },
  { id: "double-panna", name: "Double Panna", icon: "/Game/sp_dp_tp.png" },
  { id: "triple-panna", name: "Triple Panna", icon: "/Game/sp_dp_tp.png" },
  { id: "sp-motor", name: "SP Motor", icon: "/Game/sp-motor.png" },
  { id: "dp-motor", name: "DP Motor", icon: "/Game/sp-motor.png" },
  { id: "SP_DP", name: "Common SP, DP, SPDP", icon: "/Game/sp_dp_tp.png" },
  { id: "red-bracket", name: "Red Bracket", icon: "/Game/odd_even.png" },
  { id: "cycle-panna", name: "Cycle Panna", icon: "/Game/cycly_panna.png" },
  { id: "family-panel", name: "Family", icon: "/Game/family_panel.png" },
  { id: "sangam", name: "Sangam Half - Open / Close, Full", icon: "/Game/half_sangam.png" },
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
      <div className="flex flex-col h-screen pt-16 bg-gray-100">
        <div className="flex-1 overflow-y-auto p-4">
          {/* Game Types Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {gameTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleGameTypeClick(type.id)}
                className="bg-white hover:bg-orange-50 rounded-lg p-4 flex flex-col items-center justify-center transition-all shadow-md hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <Image
                    src={type.icon}
                    alt={type.name}
                    width={40}
                    height={40}
                    className="text-orange-500"
                  />
                </div>
                <span className="text-gray-800 font-medium text-center">
                  {type.name}
                </span>
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
  return (
    <GameDataProvider>
      <GamePageContent />
    </GameDataProvider>
  );
};

export default GamePage;
