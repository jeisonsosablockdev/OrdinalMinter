import { apiRequest } from "@/lib/queryClient";

export interface OrdinalValidationRequest {
  ordinalId: string;
  walletAddress: string;
}

export interface ValidationResponse {
  isValid: boolean;
  ordinal?: {
    ordinalId: string;
    collectionName: string;
    imageUrl: string;
  };
  message?: string;
}

export interface MintCandidate {
  ordinalId: string;
  collectionName: string;
  imageUrl: string;
  name: string;
  mintFee: number;
}

export interface MintRequest {
  walletAddress: string;
  ordinalId: string;
  txDetails?: {
    fee: number;
  };
}

export interface MintResponse {
  success: boolean;
  transaction?: {
    txId: string;
    status: string;
  };
  message?: string;
}

export interface CollectionStats {
  collectionName: string;
  totalSupply: number;
  mintedCount: number;
  percentageMinted: number;
  remainingSupply: number;
  mintFee: number;
}

export interface CollectionItem {
  ordinalId: string;
  name: string;
  imageUrl: string;
  mintFee: number;
  isMinted: boolean;
}

export interface TransactionStatus {
  txId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class OrdinalService {
  async validateOrdinal(data: OrdinalValidationRequest): Promise<ValidationResponse> {
    const response = await apiRequest("POST", "/api/validate-ordinal", data);
    return response.json();
  }

  async getMintCandidate(collectionName: string): Promise<MintCandidate> {
    const response = await fetch(`/api/mint-candidates/${collectionName}`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get mint candidate: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to get mint candidate");
    }
    
    return data.ordinal;
  }

  async mintOrdinal(data: MintRequest): Promise<MintResponse> {
    const response = await apiRequest("POST", "/api/mint", data);
    return response.json();
  }

  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    const response = await fetch(`/api/transaction/${txId}`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to get transaction status");
    }
    
    return data.transaction;
  }

  async getCollectionStats(collectionName: string): Promise<CollectionStats> {
    const response = await fetch(`/api/collection/${collectionName}/stats`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get collection stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to get collection stats");
    }
    
    return data.stats;
  }

  async getCollectionItems(collectionName: string, page = 1, limit = 10): Promise<{ 
    items: CollectionItem[],
    pagination: { total: number, page: number, pages: number }
  }> {
    const response = await fetch(`/api/collection/${collectionName}/items?page=${page}&limit=${limit}`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get collection items: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to get collection items");
    }
    
    return { items: data.items, pagination: data.pagination };
  }
}

export const ordinalService = new OrdinalService();
