"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Wallet,
    CheckCircle,
    AlertCircle,
} from "lucide-react"
import { getChildUsers, processTransfer, getTransferHistory, getTransferStats, type ChildUser, type TransferRequest, type TransferHistoryItem, type TransferStats } from "@/lib/api/transfer"
import { TransferStats as TransferStatsComponent } from "@/components/transfer/TransferStats"
import { NewTransferForm } from "@/components/transfer/NewTransferForm"
import { TransferList } from "@/components/transfer/TransferList"

export default function PointTransferPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [childUsers, setChildUsers] = useState<ChildUser[]>([])
    const [transfers, setTransfers] = useState<TransferHistoryItem[]>([])
    const [transferStats, setTransferStats] = useState<TransferStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
            loadData()
        }
    }, [router])

    const loadData = async () => {
        try {
            setLoading(true)
            const [childUsersData, transfersData, statsData] = await Promise.all([
                getChildUsers(),
                getTransferHistory(),
                getTransferStats()
            ])
            console.log(childUsersData, transfersData, statsData)
            // Ensure childUsers is always an array
            const safeChildUsers = Array.isArray(childUsersData) ? childUsersData : [];
            setChildUsers(safeChildUsers)

            // Ensure transfers is always an array
            const safeTransfers = Array.isArray(transfersData?.data) ? transfersData.data : [];
            setTransfers(safeTransfers)

            // Set stats if available
            setTransferStats(statsData?.data || null)
        } catch (error) {
            console.error('Error loading data:', error)
            // Set safe defaults on error
            setChildUsers([])
            setTransfers([])
            setTransferStats(null)
        } finally {
            setLoading(false)
        }
    }

    const handleTransfer = async (transferData: TransferRequest) => {
        try {
            setLoading(true)
            await processTransfer(transferData)
            await loadData()
            setMessage({ type: 'success', text: 'Transfer completed successfully!' })
            setTimeout(() => setMessage(null), 5000)
        } catch (error: any) {
            console.error('Transfer error:', error)
            setMessage({ type: 'error', text: error.response?.data?.message || 'Transfer failed' })
            setTimeout(() => setMessage(null), 5000)
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight dark:text-white text-black">Point Transfer</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Transfer Statistics */}
                <TransferStatsComponent stats={transferStats} />

                <div className="grid gap-8 md:grid-cols-1">
                    {/* New Transfer */}
                    <NewTransferForm
                        childUsers={childUsers}
                        onTransfer={handleTransfer}
                        loading={loading}
                    />
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-600'
                        : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Transfers List */}
                <TransferList
                    transfers={transfers}
                    loading={loading}
                    onRefresh={loadData}
                />
            </div>
        </AdminLayout>
    )
} 