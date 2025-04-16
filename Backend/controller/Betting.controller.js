import Bet from "../model/Bet.model.js";
import User from "../model/Usermodel.js";

export const placeBet = async (req, res) => {
  try {
    const {
      matchId,
      homeTeam,
      awayTeam,
      competition,
      betAmount,
      odds,
      selectedOutcome,
      matchDate,
    } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }

    // Check virtual currency
    if (user.virtualCurrency < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const potentialWinnings = amount * odds;

    const bet = new Bet({
      userId,
      username: user.username,
      matchId,
      homeTeam,
      awayTeam,
      competition,
      betAmount: amount,
      odds,
      selectedOutcome,
      potentialWinnings,
      matchDate: new Date(matchDate),
    });

    user.virtualCurrency -= amount;
    await user.save();

    await bet.save();

    res.status(201).json({
      message: "Bet placed successfully",
      bet,
      newBalance: user.virtualCurrency,
    });
  } catch (error) {
    console.error("Error placing bet:", error);
    res.status(500).json({ message: "Error placing bet" });
  }
};

export const getBettingHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const bets = await Bet.find({ userId }).sort({ placedAt: -1 }).limit(50);

    res.json(bets);
  } catch (error) {
    console.error("Error fetching betting history:", error);
    res.status(500).json({ message: "Error fetching betting history" });
  }
};

export const getUserBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ balance: user.virtualCurrency });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({ message: "Error fetching user balance" });
  }
};

export const resolveBets = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pendingBets = await Bet.find({ username, status: "PENDING" });
    let totalWinnings = 0;
    const resolvedBets = [];

    for (const bet of pendingBets) {
      // Simulate match result (replace with actual match result check)
      const matchResult = Math.random() > 0.5 ? "HOME" : "AWAY"; // Example: Random result

      if (bet.outcome === matchResult) {
        bet.status = "WON";
        bet.winnings = bet.potential;
        totalWinnings += bet.winnings;
      } else {
        bet.status = "LOST";
        bet.winnings = 0;
      }

      bet.actualOutcome = matchResult;
      await bet.save();
      resolvedBets.push(bet);
    }

    // Update user balance
    if (totalWinnings > 0) {
      user.balance += totalWinnings;
      await user.save();
    }

    res.json({
      message: "Bets resolved successfully",
      resolvedBets,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error resolving bets:", error);
    res.status(500).json({ message: error.message });
  }
};
