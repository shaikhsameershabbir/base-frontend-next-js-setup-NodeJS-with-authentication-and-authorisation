"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Menu, Gift, X, CheckCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import apiClient from '@/lib/api-client';

interface Ticket {
  _id: string;
  winAmount: number;
  result: string;
  type: string;
  marketId?: {
    marketName: string;
  };
  amount: number;
}

interface ClaimData {
  unclaimedTickets: Ticket[];
  winningTickets: Ticket[];
  totalUnclaimed: number;
  totalWinning: number;
}

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { state: { user }, updateBalance, refreshUser } = useAuthContext();
  const { refreshData } = useMarketData();

  // Fetch claim data when component mounts (only once)
  useEffect(() => {
    if (user && !claimData) {
      fetchUnclaimedTickets();
    }
  }, [user]);

  // Refresh data when page becomes visible or on focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && refreshUser) {
        refreshUser();
      }
    };

    const handlePageShow = () => {
      if (user && refreshUser) {
        refreshUser();
      }
    };

    const handleVisibilityChange = () => {
      if (user && refreshUser && !document.hidden) {
        refreshUser();
      }
    };

    // Add event listeners for page focus, show, and visibility events
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshUser]);

  // No periodic refresh - only refresh when needed (after claiming)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openClaimModal = async () => {
    setIsClaimModalOpen(true);
    await fetchUnclaimedTickets();
  };

  const closeClaimModal = () => {
    setIsClaimModalOpen(false);
    setClaimMessage('');
  };

  const [isFetching, setIsFetching] = useState(false);

  // Comprehensive refresh function that refreshes both balance and markets
  const handleRefreshAll = async () => {
    if (isRefreshing || isFetching) return;

    setIsRefreshing(true);
    try {
      // Refresh user balance and profile
      if (refreshUser) {
        await refreshUser();
      }

      // Refresh markets and results
      await refreshData();

      // Refresh claim data
      await fetchUnclaimedTickets();

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUnclaimedTickets = async () => {
    // Prevent duplicate calls
    if (isFetching) return;

    setIsFetching(true);
    try {
      const response = await apiClient.get('/claim/tickets');

      if (response.status === 200) {
        const data = response.data;
        setClaimData(data.data);
      }
    } catch (error) {
      // Error fetching tickets - silently fail
    } finally {
      setIsFetching(false);
    }
  };

  const claimTickets = async () => {
    if (!claimData || claimData.totalWinning === 0) {
      setClaimMessage('No winning tickets to claim');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/claim/claim');

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setClaimMessage(`Successfully claimed ₹${data.data.claimedAmount} from ${data.data.claimedTickets} tickets!`);

          // Update user balance in context and localStorage
          if (updateBalance) {
            updateBalance(data.data.newBalance);
          }

          // Refresh the tickets data to show updated status
          await fetchUnclaimedTickets();
        } else {
          setClaimMessage(data.message || 'Failed to claim tickets');
        }
      } else {
        setClaimMessage('Failed to claim tickets');
      }
    } catch (error) {
      setClaimMessage('Error claiming tickets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-primary text-white px-3 py-3 sm:px-4 sm:py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={toggleSidebar} className="p-1 hover:bg-white/10 rounded transition-colors">
            <Menu size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold pt-1 truncate">MR GAME</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Claim Button */}
          <button
            onClick={openClaimModal}
            className="bg-yellow-600  hover:bg-yellow-700 text-white p-1 rounded  font-bold flex items-center gap-1 sm:gap-2 transition-colors relative text-sm sm:text-base"
          >
            {/* <p className="sm:w-5 sm:h-5 font-bold" >Claim</p> */}
            Claim
            {claimData && claimData.totalWinning > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                {claimData.totalWinning}
              </span>
            )}
          </button>

          {/* Wallet */}
          <div className="text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="flex-shrink-0"><Wallet size={16} className="sm:w-5 sm:h-5" /></span>
            <span className="font-bold text-sm sm:text-base truncate">₹{user?.balance || 0}</span>
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing || isFetching}
              className={`text-white hover:text-yellow-200 transition-colors p-0.5 sm:p-1 flex-shrink-0 ${(isRefreshing || isFetching) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              title="Refresh balance and markets"
            >
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Claim Winnings</h2>
                  <p className="text-sm text-gray-500">Collect your winning tickets</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshAll}
                  disabled={isRefreshing || isFetching}
                  className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${(isRefreshing || isFetching) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Refresh all data"
                >
                  <svg
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={closeClaimModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {claimMessage && (
                <div className={`mb-4 p-4 rounded-xl text-sm ${claimMessage.includes('Successfully')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                  {claimMessage}
                </div>
              )}

              {claimData && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{claimData.totalWinning}</h3>
                        <p className="text-green-100">Winning Tickets</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          ₹{claimData.winningTickets.reduce((sum, ticket) => sum + ticket.winAmount, 0)}
                        </div>
                        <p className="text-green-100">Total Amount</p>
                      </div>
                    </div>
                  </div>

                  {/* Winning Tickets */}
                  {claimData.winningTickets.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        Your Winning Tickets
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {claimData.winningTickets.map((ticket) => (
                          <div key={ticket._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-base truncate">{ticket.marketId?.marketName}</div>
                                <div className="text-sm text-gray-600 capitalize mt-1">{ticket.type}</div>
                                <div className="text-xs text-gray-500 mt-1">Result: {ticket.result}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-green-600">₹{ticket.winAmount}</div>
                                <div className="text-xs text-gray-500">Win Amount</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Winning Tickets</h3>
                      <p className="text-gray-500">You don't have any winning tickets to claim at the moment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200">
              {claimData && claimData.totalWinning > 0 ? (
                <button
                  onClick={claimTickets}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Claiming...
                    </div>
                  ) : (
                    `Claim ₹${claimData.winningTickets.reduce((sum, ticket) => sum + ticket.winAmount, 0)}`
                  )}
                </button>
              ) : (
                <button
                  onClick={closeClaimModal}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={toggleSidebar}
      />
    </>
  );
};

export default Header;

