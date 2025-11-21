


import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetCategory, GroundingSource, Account, CreditScore, FinancialGoal, VoiceCommandResponse, TaxStrategy } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFinances = async (
  message: string,
  transactions: Transaction[],
  budgets: BudgetCategory[],
  accounts?: Account[],
  creditScore?: CreditScore,
  goals?: FinancialGoal[]
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  const client = getClient();
  if (!client) return { text: "I'm unable to connect to the AI service right now due to a missing API key." };

  // Prepare context
  const contextData = {
    recentTransactions: transactions.slice(0, 10),
    budgetStatus: budgets.map(b => ({
      category: b.name,
      allocated: b.allocated,
      spent: b.spent,
      remaining: b.allocated - b.spent
    })),
    accounts: accounts?.map(a => ({
      name: a.name,
      type: a.type,
      balance: a.balance,
      apr: a.apr || 'N/A'
    })),
    creditScore: creditScore ? {
      score: creditScore.currentScore,
      factors: creditScore.factors.map(f => `${f.name}: ${f.status}`)
    } : 'Not available',
    goals: goals
  };

  const systemInstruction = `
    You are "Pocket Ledger AI", a world-class Certified Financial Planner (CFP) and strategic wealth advisor.
    
    YOUR ROLE:
    1. **Strategic Planning:** Don't just report numbers. Connect spending habits to long-term goals (e.g., "Your dining spend is slowing down your debt payoff").
    2. **Credit Coach:** Advise on how to improve FICO scores (e.g., lowering utilization, increasing age of accounts).
    3. **Action Oriented:** Give specific steps (e.g., "Pay $50 extra on your Chase card this month to save $12 in interest").
    4. **Educator:** Explain complex financial terms (APR, Compound Interest, Schedule C) simply.
    
    CONTEXT PROVIDED:
    ${JSON.stringify(contextData)}
    
    CAPABILITIES:
    - Analyze spending trends vs goals.
    - Suggest debt payoff strategies (Avalanche vs Snowball).
    - Use Google Search to find current loan rates, credit card offers, or tax laws.
    
    If the user asks about their credit score, analyze their utilization rate (Credit Card Balance / Credit Limit) if you can infer limits, otherwise give general best practices based on their score of ${creditScore?.currentScore || 'unknown'}.
    
    Keep responses professional, encouraging, and concise. Use bolding for important numbers.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract grounding sources if available
    let sources: GroundingSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => {
            if (chunk.web) {
                return { title: chunk.web.title || 'Source', uri: chunk.web.uri };
            }
            return null;
        })
        .filter((source: any) => source !== null) as GroundingSource[];
    }

    return {
        text: response.text || "I analyzed the data but couldn't generate a response.",
        sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Sorry, I encountered an error analyzing your finances. Please check your API connection." };
  }
};

// Simulated function to parse receipt text
export const parseReceiptWithAI = async (base64Image: string): Promise<Partial<Transaction> | null> => {
   const client = getClient();
   if (!client) return null;

   try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: "Extract the merchant name, total amount, and date from this receipt. Return ONLY a JSON object with keys: merchant (string), amount (number), date (YYYY-MM-DD string)." }
            ]
        }
      });
      
      const text = response.text || "";
      // Clean up markdown code blocks if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
   } catch (error) {
     console.error("Receipt parsing error", error);
     return null;
   }
}

export const processVoiceCommand = async (base64Audio: string): Promise<VoiceCommandResponse | null> => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
                    { text: `
                        You are the voice interface for the 'Pocket Ledger' finance app. 
                        Listen to the user's command and classify it into one of three types:
                        
                        1. **NAVIGATION**: The user wants to go to a specific screen.
                           - Available Screens (ids): 'dashboard' (Overview), 'shop_mode' (Shop Mode/Deals), 'challenges' (Quests), 'dream_vault' (Dreams/Goals), 'squad_split' (Split Bill), 'transactions' (Transactions), 'budget' (Budgets), 'planning' (Credit/Strategy), 'wealth' (Cards/Treasury), 'tax' (Tax Center), 'forecast' (Forecast).
                        
                        2. **TRANSACTION**: The user is reporting a purchase or income.
                           - Extract: merchant, amount, category (infer), and notes.
                        
                        3. **CHAT**: The user is asking a question or asking for advice.
                           - Provide a brief, helpful answer.

                        RETURN ONLY JSON matching this structure:
                        {
                          "type": "NAVIGATION" | "TRANSACTION" | "CHAT",
                          "destination": "string (screen id if NAVIGATION)",
                          "transactionData": { "merchant": "string", "amount": number, "category": "string", "notes": "string" } (if TRANSACTION),
                          "responseText": "string (spoken confirmation or answer)"
                        }
                    `}
                ]
            }
        });

        const text = response.text || "";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Voice processing error", error);
        return null;
    }
}

// NEW: Search Grounding for Tax Strategies
export const getTaxStrategies = async (): Promise<TaxStrategy[]> => {
    const client = getClient();
    if (!client) return [];

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Find the latest tax strategies for the 2026 tax year, specifically focusing on the expiration of the Tax Cuts and Jobs Act (TCJA) sunset provisions. Return key strategies.",
            config: {
                systemInstruction: `
                    You are a tax strategist. 
                    Use Google Search to find the latest information on the 2026 Tax Cuts and Jobs Act (TCJA) expiration.
                    Identify 3 key strategies users should consider (e.g., Roth Conversions, Estate Planning, SALT deductions).
                    
                    RETURN A JSON ARRAY of objects with this schema:
                    {
                        "id": "string",
                        "title": "string",
                        "description": "string (2 sentences max)",
                        "impact": "High" | "Medium" | "Low",
                        "yearTarget": 2026
                    }
                `,
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text || "";
        let strategies: TaxStrategy[] = [];
        try {
            strategies = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse tax strategies JSON", e);
            return [];
        }
        
        return strategies;

    } catch (error) {
        console.error("Tax strategy error", error);
        return [];
    }
}