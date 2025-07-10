export const calculateDiscount = (price: number, percentage: number) => {
    return price * (percentage / 100)
}
// check the access role 
export const checkAccessRole = (currentRole: string, userRole: string) => {
    if (currentRole === 'superadmin') {
        if (userRole === 'superadmin' || userRole === 'admin' || userRole === 'distributor' || userRole === 'agent' || userRole === 'player') {
            return true
        }
    }
    if (currentRole === 'admin') {
        if (userRole === 'admin' || userRole === 'distributor' || userRole === 'agent' || userRole === 'player') {
            return true
        }
    }
    if (currentRole === 'distributor') {
        if (userRole === 'agent' || userRole === 'player') {
            return true
        }
    }
    if (currentRole === 'agent') {
        if (userRole === 'player') {
            return true
        }
    }
    if (currentRole === 'player') {
        return false
    }
    return false
}