"use client";

import React, { useState, useEffect } from "react";
import { passbook } from "@/app/constant/constant";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw } from "lucide-react";
import { Pagination } from "@/app/constant/pagination";
const itemsPerPage = 5;

// Define the Screen Orientation API types
interface ScreenOrientationAPI extends ScreenOrientation {
  lock(orientation: "portrait" | "landscape"): Promise<void>;
}

interface ExtendedScreen extends Screen {
  orientation: ScreenOrientationAPI;
}

function Page() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const handleOrientationChange = () => {
      const extendedScreen = screen as ExtendedScreen;
      if (extendedScreen.orientation) {
        setIsLandscape(extendedScreen.orientation.type.includes("landscape"));
      }
    };

    // Set initial orientation
    handleOrientationChange();

    // Listen for orientation changes
    screen.orientation?.addEventListener('change', handleOrientationChange);

    return () => {
      screen.orientation?.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrevClick = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextClick = () => setCurrentPage((prev) => prev + 1);

  const handleRotateScreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const extendedScreen = screen as ExtendedScreen;
      if (extendedScreen.orientation) {
        const currentOrientation = extendedScreen.orientation.type;
        const newOrientation = currentOrientation.includes("landscape") ? "portrait" : "landscape";
        await extendedScreen.orientation.lock(newOrientation);
        setIsLandscape(newOrientation === "landscape");
      }
    } catch (err) {
      console.error("Screen rotation not supported:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 px-2 md:px-4 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 mb-6 mt-2 relative">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-black">
              Passbook
            </h1>
            <button
              onClick={handleRotateScreen}
              className={`z-50 bg-white rounded-full p-2 shadow-md md:hidden ${
                isLandscape 
                  ? 'relative' // Position next to text in landscape
                  : 'fixed top-20 right-4' // Keep fixed position in portrait
              }`}
              aria-label="Toggle screen orientation"
            >
              <RotateCw className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto pb-10 md:pb-4 max-h-[480px] overflow-y-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-center min-w-[120px]">Date</th>
                <th className="p-3 text-center min-w-[200px]" colSpan={2}>
                  Particulars
                </th>
                <th className="p-3 text-center min-w-[150px]">
                  Transaction Amount
                </th>
                <th className="p-3 text-center min-w-[120px]">
                  Current Amount
                </th>
              </tr>
            </thead>
            <tbody className="max-h-[550px] overflow-y-auto">
              {passbook
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((entry) => (
                  <React.Fragment key={entry.id}>
                    <tr
                      className="border-b hover:bg-gray-50 cursor-pointer text-black text-center"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <td className="p-3">{entry.date}</td>
                      <td className="p-3" colSpan={2}>
                        <div className="flex items-center justify-center">
                          {entry.particulars}
                          <svg
                            className={`w-5 h-5 ml-2 transform transition-transform ${
                              expandedItems[entry.id] ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </td>
                      <td
                        className={`p-3 ${
                          entry.transactionAmount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {entry.transactionAmount >= 0 ? "+" : ""}
                        {entry.transactionAmount}
                      </td>
                      <td className="p-3">{entry.currentAmount}</td>
                    </tr>

                    <AnimatePresence>
                      {expandedItems[entry.id] && (
                        <tr>
                          <td colSpan={5}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-gray-200"
                            >
                              <div className="p-4 grid grid-cols-2 md:grid-cols-9 gap-4 text-black justify-center items-center text-center">
                                {Object.entries(entry.details).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <p className="text-black font-bold">
                                        {key.charAt(0).toUpperCase() +
                                          key.slice(1)}
                                      </p>
                                      <p
                                        className={`font-medium ${
                                          key === "status"
                                            ? "text-green-400 font-bold"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {value}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        onPrevClick={handlePrevClick}
        onNextClick={handleNextClick}
        itemsPerPage={itemsPerPage}
        totalItems={passbook.length}
      />

      {/* Show BottomNav on all screen sizes */}
      <div className="block">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;
