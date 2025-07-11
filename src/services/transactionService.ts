import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TransactionVerification {
  isValid: boolean;
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  error?: string;
}

class TransactionService {
  private connection: Connection;
  private platformWallet = 'rp3iEBSBovMxTKa5Gem6vqXXDELrh3ZP5tWn5Exgosd';

  constructor() {
    // Use mainnet-beta for production, devnet for testing
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  }

  async verifyTransaction(txHash: string, expectedAmount: number): Promise<TransactionVerification> {
    try {
      // Get transaction details from Solana
      const tx = await this.connection.getTransaction(txHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx) {
        return {
          isValid: false,
          amount: 0,
          from: '',
          to: '',
          timestamp: 0,
          error: 'Transaction not found'
        };
      }

      // Check if transaction was successful
      if (tx.meta?.err) {
        return {
          isValid: false,
          amount: 0,
          from: '',
          to: '',
          timestamp: 0,
          error: 'Transaction failed'
        };
      }

      // Parse transaction details
      const message = tx.transaction.message;
      
      // Handle both legacy and versioned transactions
      let instructions: any[];
      let accounts: PublicKey[];
      
      if ('instructions' in message) {
        // Legacy transaction
        instructions = message.instructions;
        accounts = message.accountKeys;
      } else {
        // Versioned transaction
        instructions = message.compiledInstructions || [];
        accounts = message.getAccountKeys().keySegments().flat();
      }
      
      // Find SOL transfer instruction
      let transferAmount = 0;
      let fromAddress = '';
      let toAddress = '';

      for (const instruction of instructions) {
        // Check if this is a system program transfer (SOL transfer)
        if (accounts[instruction.programIdIndex].toString() === '11111111111111111111111111111111') {
          // Parse transfer instruction data
          const fromIndex = instruction.accounts[0];
          const toIndex = instruction.accounts[1];
          
          fromAddress = accounts[fromIndex].toString();
          toAddress = accounts[toIndex].toString();
          
          // Get transfer amount from pre/post balances
          if (tx.meta?.preBalances && tx.meta?.postBalances) {
            const balanceChange = tx.meta.postBalances[toIndex] - tx.meta.preBalances[toIndex];
            transferAmount = balanceChange / LAMPORTS_PER_SOL;
          }
          break;
        }
      }

      // Verify the transaction meets our requirements
      const isValidRecipient = toAddress === this.platformWallet;
      const isValidAmount = Math.abs(transferAmount - expectedAmount) < 0.001; // Allow small precision differences
      const isRecent = tx.blockTime && (Date.now() / 1000 - tx.blockTime) < 3600; // Within last hour

      return {
        isValid: isValidRecipient && isValidAmount && !!isRecent,
        amount: transferAmount,
        from: fromAddress,
        to: toAddress,
        timestamp: tx.blockTime || 0,
        error: !isValidRecipient ? 'Invalid recipient wallet' :
               !isValidAmount ? `Invalid amount. Expected ${expectedAmount} SOL, got ${transferAmount} SOL` :
               !isRecent ? 'Transaction too old' : undefined
      };

    } catch (error) {
      console.error('Transaction verification error:', error);
      return {
        isValid: false,
        amount: 0,
        from: '',
        to: '',
        timestamp: 0,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  // Simulate transaction verification for demo purposes
  async verifyTransactionDemo(txHash: string, expectedAmount: number): Promise<TransactionVerification> {
    // Add artificial delay to simulate network call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo, always return valid if hash looks like a real transaction hash
    const isValidHash = txHash.length >= 64 && /^[a-fA-F0-9]+$/.test(txHash);

    if (!isValidHash) {
      return {
        isValid: false,
        amount: 0,
        from: '',
        to: '',
        timestamp: 0,
        error: 'Invalid transaction hash format'
      };
    }

    return {
      isValid: true,
      amount: expectedAmount,
      from: 'DemoWalletAddress123456789',
      to: this.platformWallet,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Game outcome service with 98% computer win rate
  simulateGameOutcome(gameType: string, userBet: number): { 
    winner: 'user' | 'computer';
    computerWins: boolean;
    userPayout: number;
    gameDetails: any;
  } {
    // 98% computer win rate (user has 2% chance to win)
    const userWins = Math.random() < 0.02;
    
    const result = {
      winner: userWins ? 'user' as const : 'computer' as const,
      computerWins: !userWins,
      userPayout: userWins ? this.calculatePayout(gameType, userBet) : 0,
      gameDetails: this.generateGameDetails(gameType, userWins)
    };

    return result;
  }

  private calculatePayout(gameType: string, betAmount: number): number {
    const multipliers = {
      coinflip: 1.9,        // 1.9x on win
      jackpot: 2.5,         // 2.5x on win
      kol_predictor: 3.0,   // 3x on win
      market_master: 2.8    // 2.8x on win
    };

    const multiplier = multipliers[gameType as keyof typeof multipliers] || 2.0;
    return betAmount * multiplier;
  }

  private generateGameDetails(gameType: string, userWins: boolean) {
    switch (gameType) {
      case 'coinflip':
        const userChoice = Math.random() > 0.5 ? 'heads' : 'tails';
        const result = userWins ? userChoice : (userChoice === 'heads' ? 'tails' : 'heads');
        return {
          userChoice,
          result,
          flipAnimation: true
        };
        
      case 'jackpot':
        return {
          totalPlayers: 5,
          userPosition: userWins ? 1 : Math.floor(Math.random() * 4) + 2,
          jackpotValue: Math.random() * 10 + 5
        };
        
      case 'kol_predictor':
        const prediction = Math.random() > 0.5 ? 'up' : 'down';
        const actualMovement = userWins ? prediction : (prediction === 'up' ? 'down' : 'up');
        return {
          kolName: 'CryptoKing',
          userPrediction: prediction,
          actualMovement,
          priceChange: userWins ? '+15.2%' : '-8.7%'
        };
        
      case 'market_master':
        return {
          market: 'BTC/USD',
          userPrediction: 'bullish',
          actualOutcome: userWins ? 'bullish' : 'bearish',
          priceMovement: userWins ? '+12.4%' : '-6.8%'
        };
        
      default:
        return { userWins };
    }
  }

  getPlatformWallet(): string {
    return this.platformWallet;
  }
}

export const transactionService = new TransactionService();
export default transactionService; 