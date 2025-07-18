"use client";
import React from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

interface WeekData {
  date: string;
  mon: string | number;
  tue: string | number;
  wed: string | number;
  thu: string | number;
  fri: string | number;
  sat: string | number;
  sun: string | number;
}

const marketData: { [key: string]: WeekData[] } = {
  "1": [
    {
      date: "04/11/24\nto\n10/11/24",
      mon: "11",
      tue: "**",
      wed: "**",
      thu: "**",
      fri: "**",
      sat: "**",
      sun: "**",
    },
    {
      date: "11/11/24\nto\n17/11/24",
      mon: "**",
      tue: "**",
      wed: "**",
      thu: "**",
      fri: "**",
      sat: "**",
      sun: "**",
    },
  ],
  "2": [
    {
      date: "04/11/24\nto\n10/11/24",
      mon: "75",
      tue: "**",
      wed: "**",
      thu: "11",
      fri: "**",
      sat: "**",
      sun: "**",
    },
    {
      date: "11/11/24\nto\n17/11/24",
      mon: "**",
      tue: "**",
      wed: "75",
      thu: "**",
      fri: "**",
      sat: "**",
      sun: "**",
    },
  ],
};

const marketNames: { [key: string]: string } = {
  "1": "KALYAN",
  "2": "KALYAN NIGHT",
  "3": "KARNATAKA DAY",
  "4": "MADHUR DAY",
  "5": "MADHUR NIGHT",
  "6": "MAIN BAZAR",
};

const JodiChart = () => {
  const params = useParams();
  const marketId = params.id as string;

  const weeklyData = marketData[marketId] || [];
  const marketName = marketNames[marketId] || "Unknown Market";

  return (
    <main className="min-h-screen bg-gray-100 overflow-hidden">
      <h1 className="text-base md:text-2xl font-bold text-center text-black mb-4 mt-2">
        Charts
      </h1>
      <div className="p-2 md:p-5 pt-5">
        <h2 className="text-base md:text-xl font-bold text-center mb-3 text-orange-500">
          {marketName} - Jodi Chart
        </h2>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-collapse text-center text-black border-2 border-gray-300 rounded-lg text-[10px] sm:text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-200 border-gray-300 rounded-lg">
                <th className="border-2 p-1 border-gray-300 rounded-lg">DATE</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">MON</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">TUE</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">WED</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">THU</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">FRI</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">SAT</th>
                <th className="border-2 p-1 border-gray-300 rounded-lg">SUN</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((week, index) => (
                <tr key={index}>
                  <td className="border-2 p-1 whitespace-pre-line font-bold">
                    {week.date}
                  </td>
                  <td className={`border-2 p-1 ${week.mon !== "**" ? "text-red-600 font-bold" : ""}`}>{week.mon}</td>
                  <td className={`border-2 p-1 ${week.tue !== "**" ? "text-red-600 font-bold" : ""}`}>{week.tue}</td>
                  <td className={`border-2 p-1 ${week.wed !== "**" ? "text-red-600 font-bold" : ""}`}>{week.wed}</td>
                  <td className={`border-2 p-1 ${week.thu !== "**" ? "text-red-600 font-bold" : ""}`}>{week.thu}</td>
                  <td className={`border-2 p-1 ${week.fri !== "**" ? "text-red-600 font-bold" : ""}`}>{week.fri}</td>
                  <td className={`border-2 p-1 ${week.sat !== "**" ? "text-red-600 font-bold" : ""}`}>{week.sat}</td>
                  <td className={`border-2 p-1 ${week.sun !== "**" ? "text-red-600 font-bold" : ""}`}>{week.sun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <BottomNav />
    </main>
  );
};

export default function Page() {
  return (
    <div className="max-w-full overflow-hidden">
      <JodiChart />
    </div>
  );
}
