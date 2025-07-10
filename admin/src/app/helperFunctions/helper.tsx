import { CheckCircle, Shield, Target, UserIcon, Users, XCircle } from 'lucide-react'
import React from 'react'

export const getRoleColor = (role: string) => {
    switch (role) {
        case "superadmin":
            return "bg-purple-500/10 text-purple-600 border-purple-500/20"
        case "admin":
            return "bg-blue-500/10 text-blue-600 border-blue-500/20"
        case "distributor":
            return "bg-orange-500/10 text-orange-600 border-orange-500/20"
        case "player":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

export const getRoleIcon = (role: string) => {
    switch (role) {
        case "superadmin":
            return <Shield className="h-4 w-4" />
        case "admin":
            return <Users className="h-4 w-4" />
        case "distributor":
            return <Target className="h-4 w-4" />
        case "player":
            return <UserIcon className="h-4 w-4" />
        default:
            return <Users className="h-4 w-4" />
    }
}
export const getStatusColor = (isActive: boolean) => {
    return isActive
        ? "bg-green-500/10 text-green-600 border-green-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20"
}

export const getStatusIcon = (isActive: boolean) => {
    return isActive
        ? <CheckCircle className="h-4 w-4 text-green-600" />
        : <XCircle className="h-4 w-4 text-red-600" />
}

function helper() {


    return (
        <div>helper</div>
    )
}

export default helper