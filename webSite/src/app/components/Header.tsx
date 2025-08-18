"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Menu, Gift, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';

interface Ticket {
  _id: string;
  winAmount: number;
  result: string;
  type: string;
  marketId?: {
    marketName: string;
  };
}

interface ClaimData {
  unclaimedTickets: Ticket[];
  winningTickets: Ticket[];
  pendingTickets: Ticket[];
  totalUnclaimed: number;
  totalWinning: number;
  totalPending: number;
}

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const { state: { user }, updateBalance, refreshUser } = useAuthContext();

  // Fetch claim data when component mounts (only once)
  useEffect(() => {
    if (user && !claimData) {
      fetchUnclaimedTickets();
    }
  }, [user]);

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

  const fetchUnclaimedTickets = async () => {
    // Prevent duplicate calls
    if (isFetching) return;

    console.log('🔄 Header: Fetching unclaimed tickets...');
    setIsFetching(true);
    try {
      const response = await apiClient.get('/claim/tickets');

      if (response.status === 200) {
        const data = response.data;
        setClaimData(data.data);
        console.log('✅ Header: Unclaimed tickets fetched successfully');
      } else {
        console.error('❌ Header: Failed to fetch unclaimed tickets');
      }
    } catch (error) {
      console.error('❌ Header: Error fetching unclaimed tickets:', error);
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
      console.error('Error claiming tickets:', error);
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
          <h1 className="text-lg sm:text-xl font-bold pt-1 truncate">MK Booking</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Claim Button */}
          <button
            onClick={openClaimModal}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors relative text-sm sm:text-base"
          >
            <Gift size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Claim</span>
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
              onClick={() => {
                if (refreshUser && !isFetching) {
                  refreshUser();
                }
              }}
              disabled={isFetching}
              className={`text-white hover:text-yellow-200 transition-colors p-0.5 sm:p-1 flex-shrink-0 ${isFetching ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              title="Refresh balance"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-sm sm:max-w-md lg:max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Claim Winning Tickets</h2>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={fetchUnclaimedTickets}
                  className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                  title="Refresh tickets"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={closeClaimModal}
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4">
              {claimMessage && (
                <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg text-sm sm:text-base ${claimMessage.includes('Successfully')
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {claimMessage}
                </div>
              )}

              {claimData && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                      <div className="text-green-800 font-bold text-base sm:text-lg">{claimData.totalWinning}</div>
                      <div className="text-green-600 text-xs sm:text-sm">Winning Tickets</div>
                    </div>
                    <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200">
                      <div className="text-yellow-800 font-bold text-base sm:text-lg">{claimData.totalPending}</div>
                      <div className="text-yellow-600 text-xs sm:text-sm">Pending Results</div>
                    </div>
                  </div>

                  {/* Winning Tickets */}
                  {claimData.winningTickets.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <CheckCircle className="text-green-600" size={16} />
                        Winning Tickets to Claim
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {claimData.winningTickets.map((ticket) => (
                          <div key={ticket._id} className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-green-800 text-sm sm:text-base truncate">{ticket.type}</div>
                                <div className="text-xs sm:text-sm text-green-600">Result: {ticket.result}</div>
                              </div>
                              <div className="text-green-800 font-bold text-sm sm:text-base flex-shrink-0">₹{ticket.winAmount}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Tickets */}
                  {claimData.pendingTickets.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Clock className="text-yellow-600" size={16} />
                        Pending Results
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {claimData.pendingTickets.map((ticket) => (
                          <div key={ticket._id} className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-yellow-800 text-sm sm:text-base truncate">{ticket.type}</div>
                                <div className="text-xs sm:text-sm text-yellow-600">Result: {ticket.result}</div>
                              </div>
                              <div className="text-yellow-800 font-bold text-xs sm:text-sm flex-shrink-0">Winning not declared</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Tickets Message */}
                  {claimData.totalUnclaimed === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <Gift className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                      <p className="text-gray-600 text-sm sm:text-base">No unclaimed tickets found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                {claimData && claimData.totalWinning > 0 && (
                  <button
                    onClick={claimTickets}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 sm:py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    {isLoading ? 'Claiming...' : `Claim ₹${claimData.winningTickets.reduce((sum, ticket) => sum + ticket.winAmount, 0)}`}
                  </button>
                )}
                <button
                  onClick={closeClaimModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2.5 sm:py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
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

