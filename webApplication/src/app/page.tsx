'use client';

import React from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import BottomNav from "./components/BottomNav";
import games, { Game } from "./constant/constant";
import Message from "./components/Message";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-16">
        <Message />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 max-h-[500px] overflow-y-auto">
          {games.map((game: Game, index: number) => (
            <GameCard
              key={index}
              title={game.title}
              numbers={game.numbers}
              status={game.status}
              timeOpen={game.timeOpen}
              timeClose={game.timeClose}
              statusColor={
                game.status === "Market close for today"
                  ? "text-red-500"
                  : game.status === "Running for close"
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            />
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
