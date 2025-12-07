import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Copy, Users, Trophy } from "lucide-react";

export function ReferralSection() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  // ✅ Your bot username (NO @ symbol, this MUST be exactly your BotFather username)
  const BOT_USERNAME = "Zeroverse_app_bot";

  // ✅ This is the only place the link is generated
  const referralLink = `https://t.me/${BOT_USERNAME}?start=${user.tg_id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border shadow-sm space-y-5">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Invite & Earn</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Invite your friends using your unique link and earn{" "}
        <span className="font-semibold text-primary">200 points</span> for each friend
        who joins. Your friend also receives{" "}
        <span className="font-semibold text-primary">200 points</span>.
      </p>

      {/* Referral Link Box */}
      <div className="p-3 rounded-md bg-background border flex items-center justify-between gap-3">
        <span className="text-sm font-mono break-all flex-1">{referralLink}</span>
        <Button size="sm" variant="secondary" onClick={handleCopy} className="whitespace-nowrap">
          {copied ? "Copied!" : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Stats Section */}
      <div className="p-4 rounded-lg bg-background border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Invited</span>
          <span className="text-lg font-semibold">{user.referral_count ?? 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reward Points Earned</span>
          <span className="text-lg font-semibold text-primary">
            {user.referral_points_earned ?? 0}
          </span>
        </div>
      </div>

      {/* Achievement Teaser */}
      <div className="flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 p-4">
        <Trophy className="w-6 h-6 text-primary" />
        <p className="text-sm text-primary">
          The more you invite, the more you earn. Reach higher ranks and unlock bonuses soon!
        </p>
      </div>
    </div>
  );
}
