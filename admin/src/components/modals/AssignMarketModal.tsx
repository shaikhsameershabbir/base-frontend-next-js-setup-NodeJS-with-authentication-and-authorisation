"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { usersAPI, Market as ApiMarket } from "@/lib/api-service"
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react"

interface Market extends ApiMarket {
    isAssigned?: boolean
    assignmentId?: string
}

interface AssignMarketModalProps {
    open: boolean
    onClose: () => void
    userId: string
    userName: string
    userRole: string
    onSuccess?: () => void
}

export function AssignMarketModal({
    open,
    onClose,
    userId,
    userName,
    userRole,
    onSuccess
}: AssignMarketModalProps) {
    const [markets, setMarkets] = useState<Market[]>([])
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
    const [marketsToUnassign, setMarketsToUnassign] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load available markets when modal opens
    useEffect(() => {
        if (open && userId) {
            loadAvailableMarkets()
        }
    }, [open, userId])

    const loadAvailableMarkets = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await usersAPI.getAvailableMarkets(userId)

            if (response.success && response.data) {
                const marketsData = response.data.markets || []
                setMarkets(marketsData)

                // Reset selections when loading new data
                setSelectedMarkets([])
                setMarketsToUnassign([])
            } else {
                setError(response.message || 'Failed to load markets')
            }
        } catch (err) {
            setError('Failed to load markets')
            console.error('Error loading markets:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleMarketToggle = (marketId: string, isAssigned: boolean) => {
        if (isAssigned) {
            // Handle assigned markets - when unchecked, mark for unassignment
            setMarketsToUnassign(prev => {
                if (prev.includes(marketId)) {
                    // Market was marked for unassignment, now unmark it (keep it assigned)
                    return prev.filter(id => id !== marketId)
                } else {
                    // Market was assigned, now mark it for unassignment
                    return [...prev, marketId]
                }
            })
        } else {
            // Handle unassigned markets - when checked, add to assignment list
            setSelectedMarkets(prev =>
                prev.includes(marketId)
                    ? prev.filter(id => id !== marketId)
                    : [...prev, marketId]
            )
        }
    }

    const handleSelectAll = () => {
        const filteredMarkets = (markets || []).filter(market =>
            market.marketName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const unassignedMarkets = filteredMarkets.filter(market => !market.isAssigned)
        const assignedMarkets = filteredMarkets.filter(market => market.isAssigned)

        const unassignedMarketIds = unassignedMarkets.map(market => market._id)
        const assignedMarketIds = assignedMarkets.map(market => market._id)

        // Handle unassigned markets
        setSelectedMarkets(prev => {
            const allUnassignedSelected = unassignedMarketIds.every(id => prev.includes(id))
            return allUnassignedSelected ? [] : unassignedMarketIds
        })

        // Handle assigned markets
        setMarketsToUnassign(prev => {
            const allAssignedSelected = assignedMarketIds.every(id => prev.includes(id))
            return allAssignedSelected ? [] : assignedMarketIds
        })
    }

    const handleAssign = async () => {
        if (selectedMarkets.length === 0 && marketsToUnassign.length === 0) {
            setError('Please select at least one market to assign or unassign')
            return
        }

        try {
            setAssigning(true)
            setError(null)

            // Assign new markets
            if (selectedMarkets.length > 0) {
                const assignResponse = await usersAPI.assignMarkets(userId, selectedMarkets)
                if (!assignResponse.success) {
                    setError(assignResponse.message || 'Failed to assign markets')
                    return
                }
            }

            // Unassign markets
            if (marketsToUnassign.length > 0) {
                const unassignResponse = await usersAPI.removeMarketAssignments(userId, marketsToUnassign)
                if (!unassignResponse.success) {
                    setError(unassignResponse.message || 'Failed to unassign markets')
                    return
                }
            }

            onSuccess?.()
            onClose()
            setSelectedMarkets([])
            setMarketsToUnassign([])
            setSearchTerm("")
        } catch (err) {
            setError('Failed to process market assignments')
            console.error('Error processing market assignments:', err)
        } finally {
            setAssigning(false)
        }
    }

    const filteredMarkets = (markets || []).filter(market =>
        market.marketName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const unassignedMarkets = filteredMarkets.filter(market => !market.isAssigned)
    const assignedMarkets = filteredMarkets.filter(market => market.isAssigned)

    const unassignedMarketIds = unassignedMarkets.map(market => market._id)
    const assignedMarketIds = assignedMarkets.map(market => market._id)

    const allUnassignedSelected = unassignedMarketIds.length > 0 &&
        unassignedMarketIds.every(id => selectedMarkets.includes(id))
    const allAssignedSelected = assignedMarketIds.length > 0 &&
        assignedMarketIds.every(id => marketsToUnassign.includes(id))

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Manage Markets for {userName}
                    </DialogTitle>
                    <div className="text-sm text-secondary">
                        Assign or unassign markets for {userName} ({userRole})
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Search and Select All */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                            <Input
                                placeholder="Search markets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleSelectAll}
                            disabled={filteredMarkets.length === 0}
                            className="whitespace-nowrap"
                        >
                            {allUnassignedSelected && allAssignedSelected ? 'Clear All' : 'Toggle All'}
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">{error}</span>
                        </div>
                    )}

                    {/* Markets List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-card/50">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-primary">Loading markets...</span>
                            </div>
                        ) : filteredMarkets.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-muted">
                                    {searchTerm ? 'No markets found matching your search' : 'No markets available for assignment'}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Assigned Markets */}
                                {assignedMarkets.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Currently Assigned ({assignedMarkets.length})
                                        </h3>
                                        {assignedMarkets.map((market) => (
                                            <div
                                                key={market._id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50/20 hover:bg-green-50/30 transition-colors mb-2"
                                            >
                                                <Checkbox
                                                 className="bg-white "
                                                    id={market._id}
                                                    checked={!marketsToUnassign.includes(market._id)}
                                                    onCheckedChange={() => handleMarketToggle(market._id, true)}
                                                />
                                                <Label
                                                    htmlFor={market._id}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-primary">
                                                                {market.marketName}
                                                            </div>
                                                            <div className="text-sm text-secondary">
                                                                {market.isActive ? 'Active Market' : 'Inactive Market'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-green-500 text-white">
                                                                Assigned
                                                            </Badge>
                                                            <Badge variant={market.isActive ? "default" : "secondary"}>
                                                                {market.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Unassigned Markets */}
                                {unassignedMarkets.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Available to Assign ({unassignedMarkets.length})
                                        </h3>
                                        {unassignedMarkets.map((market) => (
                                            <div
                                                key={market._id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50/20 hover:bg-blue-50/30 transition-colors mb-2"
                                            >
                                                <Checkbox
                                                    id={market._id}
                                                    checked={selectedMarkets.includes(market._id)}
                                                    onCheckedChange={() => handleMarketToggle(market._id, false)}
                                                />
                                                <Label
                                                    htmlFor={market._id}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-primary">
                                                                {market.marketName}
                                                            </div>
                                                            <div className="text-sm text-secondary">
                                                                {market.isActive ? 'Active Market' : 'Inactive Market'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-blue-500 text-white">
                                                                Available
                                                            </Badge>
                                                            <Badge variant={market.isActive ? "default" : "secondary"}>
                                                                {market.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* No Markets Available */}
                                {assignedMarkets.length === 0 && unassignedMarkets.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-muted">
                                            No markets available for assignment
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selection Summary */}
                    {(selectedMarkets.length > 0 || marketsToUnassign.length > 0) && (
                        <div className="flex items-center justify-between p-3 bg-primary/10 border rounded-lg">
                            <div className="flex gap-4">
                                {selectedMarkets.length > 0 && (
                                    <span className="text-sm text-blue-600 font-medium">
                                        +{selectedMarkets.length} market{selectedMarkets.length !== 1 ? 's' : ''} to assign
                                    </span>
                                )}
                                {marketsToUnassign.length > 0 && (
                                    <span className="text-sm text-red-600 font-medium">
                                        -{marketsToUnassign.length} market{marketsToUnassign.length !== 1 ? 's' : ''} to unassign
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedMarkets([])
                                    setMarketsToUnassign([])
                                }}
                                className="text-muted hover:text-primary"
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={assigning}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={(selectedMarkets.length === 0 && marketsToUnassign.length === 0) || assigning}
                        className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
                    >
                        {assigning ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            `Save Changes (${selectedMarkets.length + marketsToUnassign.length} Market${(selectedMarkets.length + marketsToUnassign.length) !== 1 ? 's' : ''})`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 