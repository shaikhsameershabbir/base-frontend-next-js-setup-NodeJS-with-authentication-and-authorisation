"use client";

import React from "react";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";
import { Search } from "lucide-react";

const chartSections = [
  { title: "KALYAN", id: "1" },
  { title: "KALYAN NIGHT", id: "2" },
  { title: "KARNATAKA DAY", id: "3" },
  { title: "MADHUR DAY", id: "4" },
  { title: "MADHUR NIGHT", id: "5" },
  { title: "MAIN BAZAR", id: "6" },
  { title: "MAIN BAZAR", id: "7" },
  { title: "MAIN BAZAR", id: "8" },
  { title: "MAIN BAZAR", id: "9" },
  { title: "MAIN BAZAR", id: "10" },
  { title: "MAIN BAZAR", id: "11" },
  { title: "MAIN BAZAR", id: "12" }
];

function Page() {
  return (
    <main className="min-h-screen bg-gray-50">

      <div className="pt-16 px-4">
        {/* Search Bar */}
        <div className="relative mb-6 mt-4">
          <div className="relative flex items-center border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <Search className="absolute left-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search chart"
              className="w-full pl-12 pr-4 py-3 text-gray-800 bg-transparent outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Chart Sections */}
        <div className="h-[calc(85vh-160px)] overflow-y-auto pr-1 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden rounded-t-xl rounded-b-xl border border-gray-200"
              >
                {/* Section Title */}
                <div className="bg-orange-500 py-4 rounded-t-xl">
                  <h2 className="text-xl font-semibold text-white text-center">
                    {section.title}
                  </h2>
                </div>

                {/* Chart Buttons */}
                <div className="flex gap-4 p-4">
                  <a
                    href={`/Charts/Jodi/${section.id}`}
                    className="flex-1 bg-orange-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-orange-600 transition-colors text-center shadow-sm"
                  >
                    Jodi Chart
                  </a>
                  <a
                    href={`/Charts/Panel/${section.id}`}
                    className="flex-1 bg-orange-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-orange-600 transition-colors text-center shadow-sm"
                  >
                    Panel Chart
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        {/* <BottomNav /> */}
      </div>
    </main>
  );
}

export default Page;
