import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../SocketContext';
import { message } from 'antd';
import { Socket } from 'socket.io-client';

export interface Client {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  status: 'Active' | 'Inactive';
  contractValue?: number;
  projects?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  newClients: number;
}

export interface ClientFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useClients = () => {
  const socket = useSocket() as Socket | null;
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch all client data (clients + stats)
  const fetchAllData = useCallback((filters: ClientFilters = {}) => {
    if (!socket) {
      console.warn('[useClients] Socket not available');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[useClients] Fetching all client data with filters:', filters);
    socket.emit('client:getAllData', filters);
  }, [socket]);

  // Create client
  const createClient = useCallback(async (clientData: Partial<Client>): Promise<boolean> => {
    if (!socket) {
      message.error('Socket connection not available');
      return false;
    }

    return new Promise((resolve) => {
      console.log('[useClients] Creating client:', clientData);
      socket.emit('client:create', clientData);

      const handleResponse = (response: any) => {
        console.log('[useClients] Client create response received:', response);
        if (response.done) {
          console.log('[useClients] Client created successfully:', response.data);
          message.success('Client created successfully!');
          fetchAllData(); // Refresh data
          resolve(true);
        } else {
          console.error('[useClients] Failed to create client:', response.error);
          message.error(`Failed to create client: ${response.error}`);
          resolve(false);
        }
        socket.off('client:create-response', handleResponse);
      };

      socket.on('client:create-response', handleResponse);
    });
  }, [socket, fetchAllData]);

  // Update client
  const updateClient = useCallback(async (clientId: string, updateData: Partial<Client>): Promise<boolean> => {
    if (!socket) {
      message.error('Socket connection not available');
      return false;
    }

    return new Promise((resolve) => {
      console.log('[useClients] Updating client:', { clientId, updateData });
      socket.emit('client:update', { _id: clientId, ...updateData });

      const handleResponse = (response: any) => {
        console.log('[useClients] Client update response received:', response);
        if (response.done) {
          console.log('[useClients] Client updated successfully:', response.data);
          message.success('Client updated successfully!');
          fetchAllData(); // Refresh data
          resolve(true);
        } else {
          console.error('[useClients] Failed to update client:', response.error);
          message.error(`Failed to update client: ${response.error}`);
          resolve(false);
        }
        socket.off('client:update-response', handleResponse);
      };

      socket.on('client:update-response', handleResponse);
    });
  }, [socket, fetchAllData]);

  // Delete client
  const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
    if (!socket) {
      message.error('Socket connection not available');
      return false;
    }

    return new Promise((resolve) => {
      console.log('[useClients] Deleting client:', clientId);
      socket.emit('client:delete', clientId);

      const handleResponse = (response: any) => {
        console.log('[useClients] Client delete response received:', response);
        if (response.done) {
          console.log('[useClients] Client deleted successfully:', response.data);
          message.success('Client deleted successfully!');
          fetchAllData(); // Refresh data
          resolve(true);
        } else {
          console.error('[useClients] Failed to delete client:', response.error);
          message.error(`Failed to delete client: ${response.error}`);
          resolve(false);
        }
        socket.off('client:delete-response', handleResponse);
      };

      socket.on('client:delete-response', handleResponse);
    });
  }, [socket, fetchAllData]);

  // Get client by ID
  const getClientById = useCallback(async (clientId: string): Promise<Client | null> => {
    if (!socket) {
      message.error('Socket connection not available');
      return null;
    }

    return new Promise((resolve) => {
      console.log('[useClients] Getting client by ID:', clientId);
      socket.emit('client:getById', clientId);

      const handleResponse = (response: any) => {
        console.log('[useClients] Client getById response received:', response);
        if (response.done) {
          console.log('[useClients] Client retrieved successfully:', response.data);
          resolve(response.data);
        } else {
          console.error('[useClients] Failed to get client:', response.error);
          message.error(`Failed to get client: ${response.error}`);
          resolve(null);
        }
        socket.off('client:getById-response', handleResponse);
      };

      socket.on('client:getById-response', handleResponse);
    });
  }, [socket]);

  // Export PDF
  const exportPDF = useCallback(async (): Promise<boolean> => {
    if (!socket) {
      message.error('Socket connection not available');
      return false;
    }

    setExporting(true);
    return new Promise((resolve) => {
      console.log('[useClients] Exporting clients as PDF');
      socket.emit('client:export-pdf');

      const handleResponse = (response: any) => {
        console.log('[useClients] PDF export response received:', response);
        setExporting(false);
        if (response.done) {
          console.log('[useClients] PDF exported successfully:', response.data);
          message.success('PDF exported successfully!');
          // Open the PDF in a new tab
          window.open(response.data.pdfUrl, '_blank');
          resolve(true);
        } else {
          console.error('[useClients] Failed to export PDF:', response.error);
          message.error(`Failed to export PDF: ${response.error}`);
          resolve(false);
        }
        socket.off('client:export-pdf-response', handleResponse);
      };

      socket.on('client:export-pdf-response', handleResponse);
    });
  }, [socket]);

  // Export Excel
  const exportExcel = useCallback(async (): Promise<boolean> => {
    if (!socket) {
      message.error('Socket connection not available');
      return false;
    }

    setExporting(true);
    return new Promise((resolve) => {
      console.log('[useClients] Exporting clients as Excel');
      socket.emit('client:export-excel');

      const handleResponse = (response: any) => {
        console.log('[useClients] Excel export response received:', response);
        setExporting(false);
        if (response.done) {
          console.log('[useClients] Excel exported successfully:', response.data);
          message.success('Excel exported successfully!');
          // Open the Excel file in a new tab
          window.open(response.data.excelUrl, '_blank');
          resolve(true);
        } else {
          console.error('[useClients] Failed to export Excel:', response.error);
          message.error(`Failed to export Excel: ${response.error}`);
          resolve(false);
        }
        socket.off('client:export-excel-response', handleResponse);
      };

      socket.on('client:export-excel-response', handleResponse);
    });
  }, [socket]);

  // Filter clients
  const filterClients = useCallback((filters: ClientFilters) => {
    console.log('[useClients] Filtering clients with:', filters);
    fetchAllData(filters);
  }, [fetchAllData]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleGetAllDataResponse = (response: any) => {
      console.log('[useClients] getAllData response received:', response);
      setLoading(false);
      if (response.done) {
        console.log('[useClients] Clients data received:', response.data.clients);
        console.log('[useClients] Stats data received:', response.data.stats);
        setClients(response.data.clients || []);
        setStats(response.data.stats || {});
        setError(null);
      } else {
        console.error('[useClients] Failed to get clients data:', response.error);
        setError(response.error);
        setClients([]);
        setStats(null);
      }
    };

    // Listen for real-time updates
    const handleClientCreated = (response: any) => {
      if (response.done && response.data) {
        console.log('[useClients] Client created via broadcast:', response.data);
        fetchAllData();
      }
    };

    const handleClientUpdated = (response: any) => {
      if (response.done && response.data) {
        console.log('[useClients] Client updated via broadcast:', response.data);
        fetchAllData();
      }
    };

    const handleClientDeleted = (response: any) => {
      if (response.done && response.data) {
        console.log('[useClients] Client deleted via broadcast:', response.data);
        fetchAllData();
      }
    };

    socket.on('client:getAllData-response', handleGetAllDataResponse);
    socket.on('client:client-created', handleClientCreated);
    socket.on('client:client-updated', handleClientUpdated);
    socket.on('client:client-deleted', handleClientDeleted);

    return () => {
      socket.off('client:getAllData-response', handleGetAllDataResponse);
      socket.off('client:client-created', handleClientCreated);
      socket.off('client:client-updated', handleClientUpdated);
      socket.off('client:client-deleted', handleClientDeleted);
    };
  }, [socket, fetchAllData]);

  return {
    clients,
    stats,
    loading,
    error,
    exporting,
    fetchAllData,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    exportPDF,
    exportExcel,
    filterClients
  };
};