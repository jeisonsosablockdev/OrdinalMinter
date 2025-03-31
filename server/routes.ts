import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ValidationResponse, MintResponse } from "@shared/schema";

// Mock function to simulate TAAL API validation
async function validateOrdinalOwnership(ordinalId: string, walletAddress: string): Promise<boolean> {
  // In a real app, this would call the TAAL API to verify ownership
  // For now, we'll simulate success for any input
  console.log(`Validating ordinal ${ordinalId} for wallet ${walletAddress}`);
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate ordinal ownership
  app.post("/api/validate-ordinal", async (req, res) => {
    const schema = z.object({
      ordinalId: z.string(),
      walletAddress: z.string()
    });
    
    try {
      const { ordinalId, walletAddress } = schema.parse(req.body);
      
      // Check if the ordinal exists in our database
      const ordinal = await storage.getOrdinalById(ordinalId);
      
      if (!ordinal) {
        const response: ValidationResponse = {
          isValid: false,
          message: "Ordinal not found"
        };
        return res.status(404).json(response);
      }
      
      // Validate ownership through TAAL API
      const isOwner = await validateOrdinalOwnership(ordinalId, walletAddress);
      
      if (!isOwner) {
        const response: ValidationResponse = {
          isValid: false,
          message: "You don't own this ordinal"
        };
        return res.status(403).json(response);
      }
      
      const response: ValidationResponse = {
        isValid: true,
        ordinal: {
          ordinalId: ordinal.ordinalId,
          collectionName: ordinal.collectionName,
          imageUrl: ordinal.imageUrl
        }
      };
      
      res.json(response);
    } catch (error) {
      const response: ValidationResponse = {
        isValid: false,
        message: "Invalid request data"
      };
      res.status(400).json(response);
    }
  });
  
  // Get a random ordinal to mint from a collection
  app.get("/api/mint-candidates/:collectionName", async (req, res) => {
    const { collectionName } = req.params;
    
    try {
      const ordinal = await storage.getRandomUnmintedOrdinal(collectionName);
      
      if (!ordinal) {
        return res.status(404).json({
          success: false,
          message: "No unminted ordinals available in this collection"
        });
      }
      
      res.json({
        success: true,
        ordinal: {
          ordinalId: ordinal.ordinalId,
          collectionName: ordinal.collectionName,
          imageUrl: ordinal.imageUrl,
          name: ordinal.metadata.name,
          mintFee: ordinal.mintFee
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching mint candidate"
      });
    }
  });
  
  // Mint a new ordinal
  app.post("/api/mint", async (req, res) => {
    const schema = z.object({
      walletAddress: z.string(),
      ordinalId: z.string(),
      txDetails: z.object({
        fee: z.number()
      }).optional()
    });
    
    try {
      const { walletAddress, ordinalId, txDetails } = schema.parse(req.body);
      
      // Check if the ordinal exists and is available
      const ordinal = await storage.getOrdinalById(ordinalId);
      
      if (!ordinal) {
        const response: MintResponse = {
          success: false,
          message: "Ordinal not found"
        };
        return res.status(404).json(response);
      }
      
      if (ordinal.isMinted) {
        const response: MintResponse = {
          success: false,
          message: "This ordinal has already been minted"
        };
        return res.status(400).json(response);
      }
      
      // Generate a mock transaction ID
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        txId,
        walletAddress,
        ordinalId,
        status: "pending"
      });
      
      // Mark the ordinal as minted
      await storage.updateOrdinalMintStatus(ordinalId, true);
      
      // Simulate transaction processing
      setTimeout(async () => {
        await storage.updateTransactionStatus(txId, "processing");
        
        // Simulate completion after a delay
        setTimeout(async () => {
          await storage.updateTransactionStatus(txId, "completed");
        }, 5000);
      }, 2000);
      
      const response: MintResponse = {
        success: true,
        transaction: {
          txId,
          status: "pending"
        }
      };
      
      res.json(response);
    } catch (error) {
      const response: MintResponse = {
        success: false,
        message: "Invalid request data"
      };
      res.status(400).json(response);
    }
  });
  
  // Get transaction status
  app.get("/api/transaction/:txId", async (req, res) => {
    const { txId } = req.params;
    
    try {
      const transaction = await storage.getTransactionByTxId(txId);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }
      
      res.json({
        success: true,
        transaction: {
          txId: transaction.txId,
          status: transaction.status,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching transaction status"
      });
    }
  });
  
  // Get collection statistics
  app.get("/api/collection/:collectionName/stats", async (req, res) => {
    const { collectionName } = req.params;
    
    try {
      const ordinals = await storage.getOrdinalsByCollection(collectionName);
      
      if (ordinals.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      
      const totalSupply = ordinals.length;
      const mintedCount = ordinals.filter(ord => ord.isMinted).length;
      const percentageMinted = (mintedCount / totalSupply) * 100;
      const remainingSupply = totalSupply - mintedCount;
      
      res.json({
        success: true,
        stats: {
          collectionName,
          totalSupply,
          mintedCount,
          percentageMinted,
          remainingSupply,
          mintFee: ordinals[0].mintFee
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching collection statistics"
      });
    }
  });
  
  // Get collection items (paginated)
  app.get("/api/collection/:collectionName/items", async (req, res) => {
    const { collectionName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    try {
      const allOrdinals = await storage.getOrdinalsByCollection(collectionName);
      
      if (allOrdinals.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const ordinals = allOrdinals.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        items: ordinals.map(ordinal => ({
          ordinalId: ordinal.ordinalId,
          name: ordinal.metadata.name,
          imageUrl: ordinal.imageUrl,
          mintFee: ordinal.mintFee,
          isMinted: ordinal.isMinted
        })),
        pagination: {
          total: allOrdinals.length,
          page,
          pages: Math.ceil(allOrdinals.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching collection items"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
