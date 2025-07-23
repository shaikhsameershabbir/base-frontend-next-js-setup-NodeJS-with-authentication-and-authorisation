import { Shield, Target, User as UserIcon, Crown, Users, CheckCircle, XCircle } from "lucide-react"

export function getRoleDisplayName(role: string): string {
    switch (role) {
        case 'superadmin':
            return 'Super Admin'
        case 'admin':
            return 'Admin'
        case 'distributor':
            return 'Distributor'
        case 'agent':
            return 'Agent'
        case 'player':
            return 'Player'
        default:
            return role.charAt(0).toUpperCase() + role.slice(1)
    }
}

export function getRoleColor(role: string): string {
    switch (role) {
        case 'superadmin':
            return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        case 'admin':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        case 'distributor':
            return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
        case 'agent':
            return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
        case 'player':
            return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
        default:
            return 'bg-gray-500 text-white'
    }
}

import React from "react";

export function getRoleIcon(role: string): React.ReactNode {
    switch (role) {
        case 'superadmin':
            return <Crown className="h-3 w-3" />;
        case 'admin':
            return <Shield className="h-3 w-3" />;
        case 'distributor':
            return <Target className="h-3 w-3" />;
        case 'agent':
            return <Users className="h-3 w-3" />;
        case 'player':
            return <UserIcon className="h-3 w-3" />;
        default:
            return <UserIcon className="h-3 w-3" />;
    }
}

export function getStatusColor(isActive: boolean): string {
    return isActive
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
}

export function getStatusIcon(isActive: boolean) {
    return isActive
        ? <CheckCircle className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />
}

export function getChildRole(parentRole: string): string {
    switch (parentRole) {
        case 'superadmin':
            return 'admin'
        case 'admin':
            return 'distributor'
        case 'distributor':
            return 'agent'
        case 'agent':
            return 'player'
        default:
            return 'player'
    }
} 