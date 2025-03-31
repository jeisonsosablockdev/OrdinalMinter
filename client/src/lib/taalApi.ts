const API_KEY = process.env.TAAL_API_KEY || import.meta.env.VITE_TAAL_API_KEY || "";
const BASE_URL = "https://api.taal.com/v1";

export interface OrdinalData {
  id: string;
  owner: string;
  collection: string;
  inscription: {
    type: string;
    data: string;
  };
}

class TaalApi {
  private headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
  };
  
  async getOrdinalById(ordinalId: string): Promise<OrdinalData | null> {
    try {
      // This is a placeholder for the actual TAAL API endpoint
      // In a real implementation, this would use the actual API endpoint
      const response = await fetch(`${BASE_URL}/ordinals/${ordinalId}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ordinal: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching ordinal data:", error);
      return null;
    }
  }
  
  async validateOwnership(ordinalId: string, ownerAddress: string): Promise<boolean> {
    try {
      const ordinal = await this.getOrdinalById(ordinalId);
      
      if (!ordinal) {
        return false;
      }
      
      return ordinal.owner === ownerAddress;
    } catch (error) {
      console.error("Error validating ownership:", error);
      return false;
    }
  }
  
  async submitTransaction(signedTransaction: string): Promise<{ txId: string } | null> {
    try {
      // This is a placeholder for the actual TAAL API endpoint
      const response = await fetch(`${BASE_URL}/tx/submit`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ rawTx: signedTransaction })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit transaction: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error submitting transaction:", error);
      return null;
    }
  }
}

export const taalApi = new TaalApi();
