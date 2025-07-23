'use client';
import React from "react";
import { messages } from "../constant/constant";

const MessageSection = () => {
  return (
    <div className="p-2 bg-white rounded-lg overflow-hidden">
      {/* Full-width marquee */}
      <div className="relative w-full h-8 overflow-hidden mb-4">
        <div className="absolute w-full marquee-left text-xl font-bold whitespace-nowrap text-red-600">
          {messages.map((message) => message.message).join(" | ")}
        </div>
      </div>

      {/* WhatsApp contacts */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-nowrap items-center justify-start sm:justify-between gap-x-6 min-w-[350px]">
          <div className="flex items-center">
            <img src="/whatsapp-logo.png" alt="WhatsApp" className="w-9 h-8" />
            <span className="ml-2 text-base text-black">+91 95524 30652</span>
          </div>
          <div className="flex items-center">
            <img src="/whatsapp-logo.png" alt="WhatsApp" className="w-9 h-8" />
            <span className="ml-2 text-base text-black">+91 95524 30652</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
