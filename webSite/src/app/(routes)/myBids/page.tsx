"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bid, bids } from "@/app/constant/constant";
import BottomNav from "@/app/components/BottomNav";
import BidsCard from "@/app/components/BidsCard";
import Header from "@/app/components/Header";
import { Pagination } from "@/app/constant/pagination";

const itemsPerPage = 6;

function Page() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrevClick = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextClick = () => setCurrentPage((prev) => prev + 1);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16">
        <h1 className="text-2xl font-bold text-center text-black">BID HISTORY</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 max-h-[750px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="contents"
            >
              {bids
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((bid: Bid, index: number) => (
                  <BidsCard
                    key={index}
                    marketname={bid.marketname}
                    gametype={bid.gametype}
                    digit={bid.digit}
                    point={bid.point}
                    Transcationtime={bid.Transcationtime}
                    resultmessage={bid.resultmessage}
                  />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <Pagination
          currentPage={currentPage}
          onPrevClick={handlePrevClick}
          onNextClick={handleNextClick}
          itemsPerPage={itemsPerPage}
          totalItems={bids.length}
        />
      </div>
      <div className="hidden md:block">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;
