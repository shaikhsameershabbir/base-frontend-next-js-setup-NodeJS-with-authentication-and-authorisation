"use client";

import React, { useState } from "react";
import { funds } from "@/app/constant/constant";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";
import { CirclePlus, ChevronRight, Building2, Wallet, X } from "lucide-react";

function Page() {
  const [selectedFund, setSelectedFund] = useState<(typeof funds)[0] | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "add" | "withdraw" | "bank"
  >("add");
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: ""
  });

  const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", bankFormData);
    setShowBankForm(false);
  };

  const openModal = (
    fund: (typeof funds)[0],
    section: "add" | "withdraw" | "bank"
  ) => {
    setSelectedFund(fund);
    setActiveSection(section);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 px-2 md:px-4">
        <h1 className="text-2xl font-bold text-center text-black mb-6 mt-2">
          Funds
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Add Funds Card */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-2">
                <button className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center">
                  <CirclePlus className="text-black" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {funds[0].addfund.boxname}
                </h2>
                <p className="text-sm text-gray-600">
                  {funds[0].addfund.boxmessage}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => openModal(funds[0], "add")}
                  className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Withdraw Funds Card */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-2">
                <button className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Wallet className="text-black" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {funds[0].withdrawfund.boxname}
                </h2>
                <p className="text-sm text-gray-600">
                  {funds[0].withdrawfund.boxmessage}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => openModal(funds[0], "withdraw")}
                  className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-2">
                <button className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Building2 className="text-black" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Bank Details</h2>
                <p className="text-sm text-gray-600">Manage bank information</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => openModal(funds[0], "bank")}
                  className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedFund && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 w-full">
              <h2 className="text-2xl font-bold text-gray-800 text-center w-full">
                {activeSection === "add"
                  ? selectedFund.addfund.boxname
                  : activeSection === "withdraw"
                  ? selectedFund.withdrawfund.boxname
                  : "Bank Details"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-100 hover:text-gray-100 absolute right-6"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {activeSection === "add" && (
                <>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-black">
                      Available Balance
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{selectedFund.addfund.AvailableBalance}
                    </p>
                    <p className="text-gray-700 mt-2">
                      {selectedFund.addfund.infomessage}
                    </p>
                  </div>
                </>
              )}

              {activeSection === "withdraw" && (
                <>
                  <div className="bg-white rounded-xl shadow-md p-4 mb-4 text-center">
                    <h2 className="text-xl font-bold text-black">
                      {selectedFund.withdrawfund.username}
                    </h2>
                    <p className="text-lg text-black">
                      {selectedFund.withdrawfund.accountnumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Available Balance
                    </p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">
                      ₹{selectedFund.withdrawfund.AvailableBalance}
                    </p>
                  </div>

                  <p className="text-center text-gray-700 text-sm mb-4">
                    {selectedFund.withdrawfund.boxmessage}
                  </p>

                  <div className="flex items-center border-2 border-gray-300 rounded-full px-4 py-2 mb-4 mx-2">
                    <Wallet className="text-black" />
                    <input
                      type="number"
                      placeholder="Enter Points"
                      className="w-full outline-none text-black placeholder:text-gray-500 bg-transparent ml-2"
                    />
                  </div>

                  <button className="bg-primary text-white font-semibold w-full rounded-full py-3 mb-4">
                    Request Withdraw
                  </button>

                  <div className="text-center text-sm text-black">
                    <p>Withdraw Request Timing 10:00 AM To 11:00 PM</p>
                    <p>Withdraw is available once per Day</p>
                  </div>
                </>
              )}

              {activeSection === "bank" && (
                <>
                  {!showBankForm ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl shadow-md mb-4 text-center">
                        <div>
                          <p className="text-sm font-semibold text-black text-center">
                            Account Number
                          </p>
                          <p className="text-gray-700 text-center">
                            {selectedFund.addbackdetails.accountnumber || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black text-center">
                            IFSC Code
                          </p>
                          <p className="text-gray-700 text-center">
                            {selectedFund.addbackdetails.IFSCcode || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black text-center">
                            Bank Name
                          </p>
                          <p className="text-gray-700 text-center">
                            {selectedFund.addbackdetails.Bankname || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black text-center">
                            Account Holder Name
                          </p>
                          <p className="text-gray-700 text-center">
                            {selectedFund.addbackdetails.ACHoldername || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="px-4">
                        <button
                          onClick={() => setShowBankForm(true)}
                          className="w-full bg-primary text-white font-semibold rounded-full py-3"
                        >
                          Update Bank Details
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleBankFormSubmit} className="space-y-4">
                      <div className="space-y-4">
                        {["accountNumber", "ifscCode", "bankName", "accountHolderName"].map((field, idx) => (
                          <div key={idx}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field === "accountHolderName" ? "Account Holder Name" : field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              name={field}
                              value={(bankFormData as any)[field]}
                              onChange={handleBankFormChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-black"
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowBankForm(false)}
                          className="flex-1 bg-gray-200 text-gray-800 font-semibold rounded-full py-3"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-primary text-white font-semibold rounded-full py-3"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="block">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;
