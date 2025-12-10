import React from "react";
import { Transaction } from "@/types/user";
import { GamepadIcon, PointsIcon, TonIcon } from "@/components/icons/GameIcons";
import { Users, CheckCircle, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
}

// ICON MAP
const typeIcons = {
  game: GamepadIcon,
  task: CheckCircle,
  referral: Users,
  withdraw: TonIcon,
  wallet_link: TonIcon,
  zrc_conversion: Star, // ⭐ NEW custom icon
};

// COLOR MAP
const typeColors = {
  game: "bg-blue-500/20 text-blue-400",
  task: "bg-green-500/20 text-green-400",
  referral: "bg-purple-500/20 text-purple-400",
  withdraw: "bg-orange-500/20 text-orange-400",
  wallet_link: "bg-cyan-500/20 text-cyan-400",
  zrc_conversion: "bg-yellow-500/20 text-yellow-400", // ⭐ conversion highlight
};

// UNIT MAP
const typeUnits = {
  zrc_conversion: "ZRC",
  withdraw: "ZRC",
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="game-card text-center py-8 animate-fade-in">
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Play games or complete tasks to earn zero points!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const Icon = typeIcons[tx.type] || PointsIcon;
        const colorClass = typeColors[tx.type] || "bg-muted text-muted-foreground";
        const unit = typeUnits[tx.type] ?? "pts"; // ⭐ auto unit
        const isPositive = tx.amount > 0;
        const timeAgo = formatDistanceToNow(new Date(tx.created_at), {
          addSuffix: true,
        });

        return (
          <div
            key={tx.id}
            className="game-card flex items-center gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            {/* ICON */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* DESCRIPTION */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">
                {tx.type === "zrc_conversion"
                  ? `Converted points → ${tx.amount} ZRC`
                  : tx.description}
              </h4>

              <p className="text-muted-foreground text-sm">{timeAgo}</p>
            </div>

            {/* AMOUNT */}
            <div
              className={`font-semibold ${
                isPositive ? "points-text" : "text-destructive"
              }`}
            >
              {isPositive ? "+" : ""}
              {tx.amount.toLocaleString()} {unit}
            </div>
          </div>
        );
      })}
    </div>
  );
}
