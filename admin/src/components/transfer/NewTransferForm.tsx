"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, DollarSign, Send, XCircle, ChevronDown, User } from "lucide-react"
import { ChildUser, TransferRequest } from "@/lib/api/transfer"

interface NewTransferFormProps {
    childUsers: ChildUser[]
    onTransfer: (transferData: TransferRequest) => Promise<void>
    loading: boolean
}

export function NewTransferForm({ childUsers, onTransfer, loading }: NewTransferFormProps) {
    const [selectedUser, setSelectedUser] = useState<ChildUser | null>(null)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [newTransfer, setNewTransfer] = useState({
        toUserId: "",
        amount: "",
        type: "credit" as "credit" | "debit",
        reason: "",
        adminNote: ""
    })

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleTransfer = async () => {
        if (!newTransfer.toUserId || !newTransfer.amount || !newTransfer.reason) {
            return
        }

        if (Number(newTransfer.amount) <= 0) {
            return
        }

        const transferData: TransferRequest = {
            toUserId: newTransfer.toUserId,
            amount: Number(newTransfer.amount),
            type: newTransfer.type,
            reason: newTransfer.reason,
            adminNote: newTransfer.adminNote
        }

        await onTransfer(transferData)

        // Reset form
        setNewTransfer({ toUserId: "", amount: "", type: "credit", reason: "", adminNote: "" })
        setSelectedUser(null)
    }

    return (
        <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-white" />
                    </div>
                    New Transfer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="toUserId" className="text-secondary">To User</Label>
                    <div className="relative" ref={dropdownRef}>
                        <Input
                            id="toUserId"
                            placeholder="Select a child user"
                            value={selectedUser ? `${selectedUser.username} (${selectedUser.id})` : newTransfer.toUserId}
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            readOnly
                            className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60 cursor-pointer"
                        />
                        {selectedUser ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-500/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUser(null);
                                    setNewTransfer({ ...newTransfer, toUserId: "" });
                                }}
                            >
                                <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                        ) : null}
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        {showUserDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {Array.isArray(childUsers) && childUsers.length > 0 ? (
                                    childUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewTransfer({ ...newTransfer, toUserId: user.id });
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-primary">{user.username}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-secondary">₹{(user.balance || 0).toLocaleString()}</div>
                                                <div className="text-xs text-muted">{user.role}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-muted text-sm">
                                        No child users found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-secondary">Amount (₹)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={newTransfer.amount}
                        onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-secondary">Transfer Type</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={newTransfer.type === "credit" ? "default" : "outline"}
                            onClick={() => setNewTransfer({ ...newTransfer, type: "credit" })}
                            className={`flex-1 ${newTransfer.type === "credit" ? "bg-green-500 hover:bg-green-600" : "border-green-500/20 hover:bg-green-500/10"}`}
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Credit
                        </Button>
                        <Button
                            type="button"
                            variant={newTransfer.type === "debit" ? "default" : "outline"}
                            onClick={() => setNewTransfer({ ...newTransfer, type: "debit" })}
                            className={`flex-1 ${newTransfer.type === "debit" ? "bg-red-500 hover:bg-red-600" : "border-red-500/20 hover:bg-red-500/10"}`}
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Debit
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reason" className="text-secondary">Reason</Label>
                    <Input
                        id="reason"
                        placeholder="Winning payout, commission, etc."
                        value={newTransfer.reason}
                        onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="adminNote" className="text-secondary">Admin Note (Optional)</Label>
                    <Input
                        id="adminNote"
                        placeholder="Additional notes"
                        value={newTransfer.adminNote}
                        onChange={(e) => setNewTransfer({ ...newTransfer, adminNote: e.target.value })}
                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                    />
                </div>

                <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    onClick={handleTransfer}
                    disabled={loading || !newTransfer.toUserId || !newTransfer.amount || !newTransfer.reason}
                >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Processing..." : "Process Transfer"}
                </Button>
            </CardContent>
        </Card>
    )
} 