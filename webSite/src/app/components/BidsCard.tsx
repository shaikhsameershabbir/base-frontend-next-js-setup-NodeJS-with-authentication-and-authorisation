import React from "react";
import Image from "next/image";
import { CalendarDays, PlayCircle } from "lucide-react";

interface BidsCardProps {
  marketname: string;
  gametype: string;
  digit: number;
  point: number;
  Transcationtime: string;
  resultmessage: string;
}

const BidsCard: React.FC<BidsCardProps> = ({
  marketname,
  gametype,
  digit,
  point,
  Transcationtime,
  resultmessage
}) => {
  return (
    <>
      <div className="rounded-lg shadow-xl mb-8">
        <div className="flex items-center justify-center bg-primary p-1">
          <div>
            <h2 className="text-sm font-bold text-white text-center">
              {marketname}
            </h2>
          </div>
        </div>
        <div className="flex flex-row justify-between p-3">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">
              Game Type
            </h2>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">Digit</h2>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">Point</h2>
          </div>
        </div>
        <div className="flex flex-row justify-between m-1">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">
              {gametype}
            </h2>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">
              {digit}
            </h2>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-black text-center">
              {point}
            </h2>
          </div>
        </div>
        <hr className="border-black" />
        <div className="flex flex-row justify-center p-3">
          <h2 className="text-sm font-semibold text-black text-center">
            Transaction Time : {Transcationtime}
          </h2>
        </div>
        <hr className="border-black" />
        <div className="flex flex-row justify-center p-3">
          <h2 className="text-sm font-semibold text-green-400 text-center">
            {resultmessage}
          </h2>
        </div>
      </div>
    </>
  );
};

export default BidsCard;
