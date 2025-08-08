import { useState, useEffect, useCallback } from 'react';
import { useBets } from './useBets';
import { BetFilters, HierarchyOption } from '@/lib/betApi';

export const useBetsManagement = () => {
    const {
        bets,
        loading,
        error,
        summary,
        pagination,
        getBets,
        getHierarchyOptions,
        getAdminHierarchyOptions,
        clearError
    } = useBets();

    const [filters, setFilters] = useState<BetFilters>({
        dateFilter: 'today',
        page: 1,
        limit: 10
    });

    const [hierarchyOptions, setHierarchyOptions] = useState<{
        admins: HierarchyOption[];
        distributors: HierarchyOption[];
        agents: HierarchyOption[];
        players: HierarchyOption[];
    }>({
        admins: [],
        distributors: [],
        agents: [],
        players: []
    });

    const [selectedBetId, setSelectedBetId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');

    // Load current user role from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserRole(user.role);
        }
    }, []);

    // Load hierarchy options based on current user role
    const loadHierarchyOptions = useCallback(async () => {
        if (!currentUserRole) return;

        try {
            if (currentUserRole === 'superadmin') {
                const admins = await getAdminHierarchyOptions('admin');
                setHierarchyOptions(prev => ({ ...prev, admins }));
            } else if (currentUserRole === 'admin') {
                const distributors = await getHierarchyOptions('distributor');
                setHierarchyOptions(prev => ({ ...prev, distributors }));
            } else if (currentUserRole === 'distributor') {
                const agents = await getHierarchyOptions('agent');
                setHierarchyOptions(prev => ({ ...prev, agents }));
            } else if (currentUserRole === 'agent') {
                const players = await getHierarchyOptions('player');
                setHierarchyOptions(prev => ({ ...prev, players }));
            }
        } catch (error) {
            console.error('Error loading hierarchy options:', error);
        }
    }, [currentUserRole, getHierarchyOptions, getAdminHierarchyOptions]);

    // Load child options when parent changes
    const loadChildOptions = useCallback(async (level: string, parentId: string) => {
        try {
            let options: HierarchyOption[] = [];

            if (currentUserRole === 'superadmin') {
                const filters: any = {};
                if (level === 'distributor') filters.adminId = parentId;
                else if (level === 'agent') filters.distributorId = parentId;
                else if (level === 'player') filters.agentId = parentId;

                options = await getAdminHierarchyOptions(level, filters);
            } else {
                options = await getHierarchyOptions(level, parentId);
            }

            setHierarchyOptions(prev => ({ ...prev, [level + 's']: options }));
        } catch (error) {
            console.error('Error loading child options:', error);
        }
    }, [currentUserRole, getHierarchyOptions, getAdminHierarchyOptions]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof BetFilters, value: any) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value, page: 1 };
        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets]);

    // Handle hierarchy changes
    const handleHierarchyChange = useCallback(async (level: string, value: string) => {
        const newFilters = { ...filters, page: 1 };

        // Clear child selections when parent changes
        if (level === 'admin') {
            newFilters.adminId = value === 'all' ? undefined : value;
            newFilters.distributorId = undefined;
            newFilters.agentId = undefined;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('distributor', value);
            }
        } else if (level === 'distributor') {
            newFilters.distributorId = value === 'all' ? undefined : value;
            newFilters.agentId = undefined;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('agent', value);
            }
        } else if (level === 'agent') {
            newFilters.agentId = value === 'all' ? undefined : value;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('player', value);
            }
        } else if (level === 'player') {
            newFilters.playerId = value === 'all' ? undefined : value;
        }

        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets, loadChildOptions]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        const newFilters = { ...filters, page };
        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets]);

    // Handle bet view
    const handleViewBet = useCallback((betId: string) => {
        setSelectedBetId(betId);
        setIsDetailModalOpen(true);
    }, []);

    // Handle modal close
    const handleCloseModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setSelectedBetId(null);
    }, []);

    // Load hierarchy options when role changes
    useEffect(() => {
        if (currentUserRole) {
            loadHierarchyOptions();
        }
    }, [currentUserRole, loadHierarchyOptions]);

    return {
        // State
        bets,
        loading,
        error,
        summary,
        pagination,
        filters,
        hierarchyOptions,
        currentUserRole,
        selectedBetId,
        isDetailModalOpen,

        // Actions
        handleFilterChange,
        handleHierarchyChange,
        handlePageChange,
        handleViewBet,
        handleCloseModal,
        clearError,
        getBets: () => getBets(filters)
    };
};
