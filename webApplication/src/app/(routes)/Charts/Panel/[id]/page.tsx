"use client";
import React from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

// Fix: Remove unused WeekData and marketData, and define correct types for matkaData
type DayData = {
  main: string;
  sub1: string;
  sub2: string;
  sub3: string;
};

type MatkaRecord = {
  dateRange: string;
  Mon: DayData;
  Tue: DayData;
  Wed: DayData;
  Thu: DayData;
  Fri: DayData;
  Sat: DayData;
  Sun: DayData;
};

const redHighlightedNumbers: string[] = [
  "00",
  "11",
  "22",
  "33",
  "44",
  "55",
  "66",
  "77",
  "88",
  "99",
];

const matkaData: MatkaRecord[] = [
  {
    dateRange: "22-04-2019\nTo\n28-04-2019",
    Mon: { main: "84", sub1: "2", sub2: "8", sub3: "1" },
    Tue: { main: "12", sub1: "2", sub2: "4", sub3: "1" },
    Wed: { main: "30", sub1: "4", sub2: "8", sub3: "1" },
    Thu: { main: "44", sub1: "2", sub2: "3", sub3: "1" },
    Fri: { main: "35", sub1: "7", sub2: "8", sub3: "1" },
    Sat: { main: "64", sub1: "4", sub2: "0", sub3: "1" },
    Sun: { main: "95", sub1: "1", sub2: "8", sub3: "1" },
  },
  {
    dateRange: "29-04-2019\nTo\n05-05-2019",
    Mon: { main: "12", sub1: "1", sub2: "2", sub3: "1" },
    Tue: { main: "50", sub1: "1", sub2: "4", sub3: "1" },
    Wed: { main: "63", sub1: "5", sub2: "7", sub3: "1" },
    Thu: { main: "38", sub1: "6", sub2: "8", sub3: "1" },
    Fri: { main: "47", sub1: "2", sub2: "6", sub3: "1" },
    Sat: { main: "99", sub1: "2", sub2: "7", sub3: "1" },
    Sun: { main: "65", sub1: "5", sub2: "6", sub3: "1" },
  },
  {
    dateRange: "06-05-2019\nTo\n12-05-2019",
    Mon: { main: "39", sub1: "6", sub2: "7", sub3: "1" },
    Tue: { main: "15", sub1: "4", sub2: "6", sub3: "1" },
    Wed: { main: "84", sub1: "3", sub2: "4", sub3: "1" },
    Thu: { main: "02", sub1: "1", sub2: "3", sub3: "1" },
    Fri: { main: "04", sub1: "4", sub2: "8", sub3: "1" },
    Sat: { main: "61", sub1: "5", sub2: "6", sub3: "1" },
    Sun: { main: "87", sub1: "2", sub2: "6", sub3: "1" },
  },
  {
    dateRange: "13-05-2019\nTo\n19-05-2019",
    Mon: { main: "51", sub1: "2", sub2: "5", sub3: "1" },
    Tue: { main: "36", sub1: "1", sub2: "2", sub3: "1" },
    Wed: { main: "47", sub1: "4", sub2: "5", sub3: "1" },
    Thu: { main: "30", sub1: "3", sub2: "6", sub3: "1" },
    Fri: { main: "05", sub1: "4", sub2: "6", sub3: "1" },
    Sat: { main: "28", sub1: "3", sub2: "4", sub3: "1" },
    Sun: { main: "93", sub1: "1", sub2: "7", sub3: "1" },
  },
  {
    dateRange: "20-05-2019\nTo\n26-05-2019",
    Mon: { main: "10", sub1: "4", sub2: "7", sub3: "1" },
    Tue: { main: "54", sub1: "5", sub2: "7", sub3: "1" },
    Wed: { main: "29", sub1: "3", sub2: "4", sub3: "1" },
    Thu: { main: "86", sub1: "1", sub2: "2", sub3: "1" },
    Fri: { main: "37", sub1: "7", sub2: "9", sub3: "1" },
    Sat: { main: "91", sub1: "1", sub2: "2", sub3: "1" },
    Sun: { main: "77", sub1: "5", sub2: "6", sub3: "1" },
  },
  {
    dateRange: "27-05-2019\nTo\n02-06-2019",
    Mon: { main: "37", sub1: "1", sub2: "3", sub3: "1" },
    Tue: { main: "80", sub1: "4", sub2: "5", sub3: "1" },
    Wed: { main: "43", sub1: "1", sub2: "3", sub3: "1" },
    Thu: { main: "60", sub1: "5", sub2: "8", sub3: "1" },
    Fri: { main: "44", sub1: "4", sub2: "6", sub3: "1" },
    Sat: { main: "05", sub1: "1", sub2: "3", sub3: "1" },
    Sun: { main: "88", sub1: "1", sub2: "4", sub3: "1" },
  },
  {
    dateRange: "03-06-2019\nTo\n09-06-2019",
    Mon: { main: "20", sub1: "2", sub2: "4", sub3: "1" },
    Tue: { main: "84", sub1: "4", sub2: "6", sub3: "1" },
    Wed: { main: "19", sub1: "4", sub2: "0", sub3: "1" },
    Thu: { main: "30", sub1: "1", sub2: "2", sub3: "1" },
    Fri: { main: "66", sub1: "2", sub2: "8", sub3: "1" },
    Sat: { main: "15", sub1: "7", sub2: "4", sub3: "1" },
    Sun: { main: "71", sub1: "3", sub2: "4", sub3: "1" },
  },
  {
    dateRange: "10-06-2019\nTo\n16-06-2019",
    Mon: { main: "55", sub1: "6", sub2: "9", sub3: "1" },
    Tue: { main: "91", sub1: "1", sub2: "5", sub3: "1" },
    Wed: { main: "40", sub1: "2", sub2: "9", sub3: "1" },
    Thu: { main: "00", sub1: "3", sub2: "8", sub3: "1" },
    Fri: { main: "02", sub1: "5", sub2: "7", sub3: "1" },
    Sat: { main: "80", sub1: "6", sub2: "7", sub3: "1" },
    Sun: { main: "88", sub1: "4", sub2: "6", sub3: "1" },
  },
  {
    dateRange: "17-06-2019\nTo\n23-06-2019",
    Mon: { main: "76", sub1: "3", sub2: "7", sub3: "1" },
    Tue: { main: "55", sub1: "3", sub2: "4", sub3: "1" },
    Wed: { main: "85", sub1: "7", sub2: "8", sub3: "1" },
    Thu: { main: "27", sub1: "2", sub2: "4", sub3: "1" },
    Fri: { main: "12", sub1: "8", sub2: "9", sub3: "1" },
    Sat: { main: "42", sub1: "1", sub2: "2", sub3: "1" },
    Sun: { main: "32", sub1: "1", sub2: "5", sub3: "1" },
  },
  {
    dateRange: "24-06-2019\nTo\n30-06-2019",
    Mon: { main: "89", sub1: "2", sub2: "6", sub3: "1" },
    Tue: { main: "02", sub1: "1", sub2: "8", sub3: "1" },
    Wed: { main: "47", sub1: "3", sub2: "4", sub3: "1" },
    Thu: { main: "63", sub1: "4", sub2: "6", sub3: "1" },
    Fri: { main: "30", sub1: "5", sub2: "9", sub3: "1" },
    Sat: { main: "93", sub1: "1", sub2: "3", sub3: "1" },
    Sun: { main: "19", sub1: "6", sub2: "8", sub3: "1" },
  },
  {
    dateRange: "01-07-2019\nTo\n07-07-2019",
    Mon: { main: "25", sub1: "1", sub2: "4", sub3: "1" },
    Tue: { main: "08", sub1: "4", sub2: "5", sub3: "1" },
    Wed: { main: "67", sub1: "4", sub2: "5", sub3: "1" },
    Thu: { main: "44", sub1: "3", sub2: "4", sub3: "1" },
    Fri: { main: "35", sub1: "6", sub2: "8", sub3: "1" },
    Sat: { main: "14", sub1: "3", sub2: "3", sub3: "1" },
    Sun: { main: "79", sub1: "2", sub2: "5", sub3: "1" },
  },
];

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

  // Fix: Use matkaData directly, since marketData was broken and not used
  // Optionally, you could filter matkaData by marketId if you have multiple markets' data

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
        <div className="w-full overflow-y-auto max-h-[525px]">
          <table className="w-full border-2 border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200 text-black font-bold">
                {["Date", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <th
                      key={day}
                      className="border-2 border-gray-300 text-xs sm:text-sm px-1 sm:px-2 py-1 whitespace-nowrap"
                    >
                      {day}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="text-black">
              {matkaData.map((row, i) => (
                <tr key={i}>
                  <td className="border-2 border-gray-300 text-xs sm:text-sm font-bold whitespace-pre-line px-1 sm:px-2 py-1">
                    {row.dateRange}
                  </td>
                  {(
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
                  ).map((day) => (
                    <td
                      key={day}
                      className="border-2 border-gray-300 px-1 sm:px-2 py-1 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between h-full gap-0.5 xs:gap-1 sm:gap-2">
                        <div className="flex flex-col text-[8px] xs:text-[10px] sm:text-[13px] font-extrabold">
                          <div>{row[day].sub1}</div>
                          <div>{row[day].sub2}</div>
                          <div>{row[day].sub3}</div>
                        </div>
                        <div
                          className={`text-[14px] xs:text-[16px] sm:text-[23px] font-bold ${
                            redHighlightedNumbers.includes(row[day].main)
                              ? "text-red-600"
                              : "text-black"
                          }`}
                        >
                          {row[day].main}
                        </div>
                        <div className="flex flex-col text-[8px] xs:text-[10px] sm:text-[13px] font-extrabold items-end">
                          <div>{row[day].sub1}</div>
                          <div>{row[day].sub2}</div>
                          <div>{row[day].sub3}</div>
                        </div>
                      </div>
                    </td>
                  ))}
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
