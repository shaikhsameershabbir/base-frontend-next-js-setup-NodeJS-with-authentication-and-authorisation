import { Button } from '@/components/ui/button';

interface DetailedModalProps {
    showModal: boolean;
    selectedEntry: any;
    onClose: () => void;
}

export const DetailedModal = ({ showModal, selectedEntry, onClose }: DetailedModalProps) => {
    if (!showModal || !selectedEntry) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">📊 Detailed Breakdown</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Number and Game Type */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-lg font-bold text-blue-400 mb-2">{selectedEntry.number}</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Game Type:</span>
                            <span className="text-purple-400 bg-purple-900/20 px-2 py-1 rounded">{selectedEntry.gameType}</span>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-bold text-white mb-2">💰 Financial Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Bet Amount:</span>
                                    <span className="text-green-400 font-bold">₹{selectedEntry.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Winning Rate:</span>
                                    <span className="text-blue-400 font-bold">₹{selectedEntry.rate.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Winning Amount:</span>
                                    <span className="text-yellow-400 font-bold">₹{selectedEntry.winningAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Risk Ratio:</span>
                                    <span className="text-red-400 font-bold">{(selectedEntry.winningAmount / selectedEntry.amount).toFixed(1)}x</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-bold text-white mb-2">📋 Bet Sources & Calculations</h4>
                            <div className="text-sm space-y-2">
                                {(() => {
                                    const sources = selectedEntry.betBreakdown.split(' | ');
                                    const totalWin = sources.find((s: string) => s.includes('Total Win'));
                                    const otherSources = sources.filter((s: string) => !s.includes('Total Win'));

                                    return (
                                        <>
                                            {otherSources.map((source: string, index: number) => (
                                                <div key={index} className="bg-gray-700 p-2 rounded">
                                                    <div className="text-gray-300">• {source}</div>
                                                </div>
                                            ))}
                                            {totalWin && (
                                                <div className="bg-yellow-900/20 p-2 rounded border border-yellow-500">
                                                    <div className="text-yellow-400 font-bold text-lg">
                                                        {totalWin}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-bold text-white mb-2">⚠️ Risk Assessment</h4>
                        <div className="space-y-2">
                            <div className={`p-2 rounded ${selectedEntry.winningAmount > 1000000 ? 'bg-red-900/30 border border-red-500' :
                                selectedEntry.winningAmount > 500000 ? 'bg-orange-900/30 border border-orange-500' :
                                    selectedEntry.winningAmount > 100000 ? 'bg-yellow-900/30 border border-yellow-500' :
                                        'bg-green-900/30 border border-green-500'
                                }`}>
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                        {selectedEntry.winningAmount > 1000000 ? '🔥' :
                                            selectedEntry.winningAmount > 500000 ? '⚠️' :
                                                selectedEntry.winningAmount > 100000 ? '⚡' :
                                                    '✅'}
                                    </span>
                                    <span className="font-bold text-white">
                                        {selectedEntry.winningAmount > 1000000 ? 'HIGH RISK - Avoid this number' :
                                            selectedEntry.winningAmount > 500000 ? 'MEDIUM RISK - Consider carefully' :
                                                selectedEntry.winningAmount > 100000 ? 'LOW RISK - Relatively safe' :
                                                    'SAFE - Good choice'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-300">
                                <p><strong>Recommendation:</strong> {
                                    selectedEntry.winningAmount > 1000000 ? 'This number has extremely high winning potential. Consider choosing a different number to minimize risk.' :
                                        selectedEntry.winningAmount > 500000 ? 'This number has significant winning potential. Evaluate if the risk is acceptable.' :
                                            selectedEntry.winningAmount > 100000 ? 'This number has moderate winning potential. Generally acceptable risk level.' :
                                                'This number has low winning potential. Safe choice for minimizing risk.'
                                }</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 