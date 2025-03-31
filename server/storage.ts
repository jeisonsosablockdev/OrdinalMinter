import { 
  users, type User, type InsertUser,
  ordinals, type Ordinal, type InsertOrdinal,
  transactions, type Transaction, type InsertTransaction
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ordinals
  getOrdinalById(ordinalId: string): Promise<Ordinal | undefined>;
  getOrdinalsByCollection(collectionName: string): Promise<Ordinal[]>;
  createOrdinal(ordinal: InsertOrdinal): Promise<Ordinal>;
  updateOrdinalMintStatus(ordinalId: string, isMinted: boolean): Promise<Ordinal | undefined>;
  getRandomUnmintedOrdinal(collectionName: string): Promise<Ordinal | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionByTxId(txId: string): Promise<Transaction | undefined>;
  updateTransactionStatus(txId: string, status: string): Promise<Transaction | undefined>;
  getTransactionsByWalletAddress(walletAddress: string): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ordinals: Map<string, Ordinal>;
  private transactions: Map<string, Transaction>;
  
  currentUserId: number;
  currentOrdinalId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.ordinals = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentOrdinalId = 1;
    this.currentTransactionId = 1;
    
    // Add some sample ordinals for testing
    this.initializeOrdinals();
  }
  
  private initializeOrdinals() {
    const pixelFoxes = [
      {
        ordinalId: "ord1:pixel-fox-1",
        collectionName: "Pixel Foxes",
        imageUrl: "https://via.placeholder.com/200x200/f97316/ffffff?text=Fox%201",
        metadata: { name: "Pixel Fox #1", traits: { background: "Orange", eyes: "Blue" } },
        mintFee: 10000,
        isMinted: false
      },
      {
        ordinalId: "ord1:pixel-fox-2", 
        collectionName: "Pixel Foxes",
        imageUrl: "https://via.placeholder.com/200x200/3b82f6/ffffff?text=Fox%202",
        metadata: { name: "Pixel Fox #2", traits: { background: "Blue", eyes: "Green" } },
        mintFee: 10000,
        isMinted: false
      },
      {
        ordinalId: "ord1:pixel-fox-3",
        collectionName: "Pixel Foxes",
        imageUrl: "https://via.placeholder.com/200x200/10b981/ffffff?text=Fox%203",
        metadata: { name: "Pixel Fox #3", traits: { background: "Green", eyes: "Yellow" } },
        mintFee: 10000,
        isMinted: false
      },
      {
        ordinalId: "ord1:pixel-fox-4",
        collectionName: "Pixel Foxes",
        imageUrl: "https://via.placeholder.com/200x200/f59e0b/ffffff?text=Fox%204",
        metadata: { name: "Pixel Fox #4", traits: { background: "Yellow", eyes: "Red" } },
        mintFee: 10000,
        isMinted: false
      },
      {
        ordinalId: "ord1:pixel-fox-5",
        collectionName: "Pixel Foxes",
        imageUrl: "https://via.placeholder.com/200x200/6366f1/ffffff?text=Fox%205",
        metadata: { name: "Pixel Fox #5", traits: { background: "Indigo", eyes: "Purple" } },
        mintFee: 10000,
        isMinted: false
      }
    ];
    
    pixelFoxes.forEach(fox => {
      const ordinal: Ordinal = {
        id: this.currentOrdinalId++,
        ...fox
      };
      this.ordinals.set(ordinal.ordinalId, ordinal);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Ordinals methods
  async getOrdinalById(ordinalId: string): Promise<Ordinal | undefined> {
    return this.ordinals.get(ordinalId);
  }
  
  async getOrdinalsByCollection(collectionName: string): Promise<Ordinal[]> {
    return Array.from(this.ordinals.values()).filter(
      (ordinal) => ordinal.collectionName === collectionName
    );
  }
  
  async createOrdinal(insertOrdinal: InsertOrdinal): Promise<Ordinal> {
    const id = this.currentOrdinalId++;
    const ordinal: Ordinal = { ...insertOrdinal, id, isMinted: false };
    this.ordinals.set(ordinal.ordinalId, ordinal);
    return ordinal;
  }
  
  async updateOrdinalMintStatus(ordinalId: string, isMinted: boolean): Promise<Ordinal | undefined> {
    const ordinal = this.ordinals.get(ordinalId);
    if (!ordinal) {
      return undefined;
    }
    
    const updatedOrdinal = { ...ordinal, isMinted };
    this.ordinals.set(ordinalId, updatedOrdinal);
    return updatedOrdinal;
  }
  
  async getRandomUnmintedOrdinal(collectionName: string): Promise<Ordinal | undefined> {
    const unmintedOrdinals = Array.from(this.ordinals.values()).filter(
      (ordinal) => ordinal.collectionName === collectionName && !ordinal.isMinted
    );
    
    if (unmintedOrdinals.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * unmintedOrdinals.length);
    return unmintedOrdinals[randomIndex];
  }
  
  // Transactions methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.transactions.set(transaction.txId, transaction);
    return transaction;
  }
  
  async getTransactionByTxId(txId: string): Promise<Transaction | undefined> {
    return this.transactions.get(txId);
  }
  
  async updateTransactionStatus(txId: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(txId);
    if (!transaction) {
      return undefined;
    }
    
    const updatedTransaction = { 
      ...transaction, 
      status, 
      updatedAt: new Date() 
    };
    this.transactions.set(txId, updatedTransaction);
    return updatedTransaction;
  }
  
  async getTransactionsByWalletAddress(walletAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.walletAddress === walletAddress
    );
  }
}

export const storage = new MemStorage();
