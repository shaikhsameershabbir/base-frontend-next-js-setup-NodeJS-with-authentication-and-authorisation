'use client';
import React from "react";
import { messages } from "../constant/constant";

const MessageSection = () => {
  return (
    <div className="p-2 bg-white rounded-lg overflow-hidden flex justify-center items-center">
      <span className="zi text-2xl md:text-2xl">&#128073;</span>
      <a
        href="https://www.matkaresult.online/"
        target="_blank"
        title="Click to check Market results !"
        rel="noopener noreferrer"
        className="text-xl font-bold text-red-600 hover:text-red-700 transition-colors text-center animate-pulse"
      >
        matkaresult.online
      </a>
      <span className="zi text-2xl md:text-2xl">&#128072;</span>
    </div>
  );
};

export default MessageSection;
