# Next.js API Routes for ZeroVerse

When you migrate to Next.js, create these API routes in your `pages/api/` or `app/api/` folder.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## Supabase Client Setup

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// For frontend
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For backend (API routes) - uses service key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

---

## POST /api/login

```typescript
// pages/api/login.ts or app/api/login/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tg_id, tg_name, tg_username, start_param } = req.body;

  if (!tg_id || !tg_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('tg_id', tg_id)
      .single();

    if (existingUser) {
      // Update name if changed
      await supabaseAdmin
        .from('users')
        .update({ tg_name, tg_username, updated_at: new Date().toISOString() })
        .eq('tg_id', tg_id);

      // Get transactions
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('user_id', existingUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return res.json({ user: existingUser, transactions });
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        tg_id,
        tg_name,
        tg_username,
        zero_points: 0,
        referrer_id: null,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Handle referral
    if (start_param && start_param !== tg_id) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id, zero_points')
        .eq('tg_id', start_param)
        .single();

      if (referrer) {
        // Update new user's referrer_id
        await supabaseAdmin
          .from('users')
          .update({ referrer_id: start_param })
          .eq('id', newUser.id);

        // Give referrer 200 points
        await supabaseAdmin
          .from('users')
          .update({ zero_points: referrer.zero_points + 200 })
          .eq('id', referrer.id);

        // Add transaction for referrer
        await supabaseAdmin.from('transactions').insert({
          user_id: referrer.id,
          type: 'referral',
          description: `Referral: ${tg_name} joined`,
          amount: 200,
        });
      }
    }

    return res.json({ user: newUser, transactions: [] });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## POST /api/game-complete

```typescript
// pages/api/game-complete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Anti-cheat: track last submission time per user
const lastSubmission = new Map<string, number>();
const MIN_GAME_DURATION = 5000; // 5 seconds minimum

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tg_id, game_type, score } = req.body;

  if (!tg_id || !game_type || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Anti-cheat: validate score
  if (typeof score !== 'number' || score < 0 || score > 10000) {
    await supabaseAdmin.from('cheat_attempts').insert({
      user_id: null,
      type: 'score',
      reason: `Invalid score: ${score}`,
    });
    return res.status(400).json({ error: 'Invalid score' });
  }

  // Anti-cheat: check submission frequency
  const lastTime = lastSubmission.get(tg_id) || 0;
  const now = Date.now();
  if (now - lastTime < MIN_GAME_DURATION) {
    await supabaseAdmin.from('cheat_attempts').insert({
      user_id: null,
      type: 'score',
      reason: `Too frequent: ${now - lastTime}ms`,
    });
    return res.status(429).json({ error: 'Too many requests' });
  }
  lastSubmission.set(tg_id, now);

  try {
    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('tg_id', tg_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate points (1:1 with score for simplicity)
    const pointsEarned = Math.floor(score);

    // Insert game session
    await supabaseAdmin.from('game_sessions').insert({
      user_id: user.id,
      game_type,
      score,
      points_earned: pointsEarned,
    });

    // Add transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'game',
      description: `${game_type} Game Reward`,
      amount: pointsEarned,
    });

    // Update user points
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({ 
        zero_points: user.zero_points + pointsEarned,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    return res.json({ user: updatedUser, points_earned: pointsEarned });
  } catch (error) {
    console.error('Game complete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## POST /api/complete-task

```typescript
// pages/api/complete-task.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Define task rewards server-side (never trust frontend)
const TASK_REWARDS: Record<string, number> = {
  task_join_channel: 150,
  task_follow_twitter: 100,
  task_join_discord: 120,
  task_watch_tutorial: 80,
  task_visit_website: 50,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tg_id, task_id } = req.body;

  if (!tg_id || !task_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reward = TASK_REWARDS[task_id];
  if (!reward) {
    return res.status(400).json({ error: 'Invalid task' });
  }

  try {
    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('tg_id', tg_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already completed
    const { data: existing } = await supabaseAdmin
      .from('completed_tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', task_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    // Insert completed task
    await supabaseAdmin.from('completed_tasks').insert({
      user_id: user.id,
      task_id,
      reward,
    });

    // Add transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'task',
      description: task_id.replace('task_', '').replace(/_/g, ' '),
      amount: reward,
    });

    // Update user points
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({ 
        zero_points: user.zero_points + reward,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## POST /api/save-wallet-address

```typescript
// pages/api/save-wallet-address.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tg_id, ton_wallet_address } = req.body;

  if (!tg_id || !ton_wallet_address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic TON address validation
  if (!ton_wallet_address.startsWith('UQ') && !ton_wallet_address.startsWith('EQ')) {
    await supabaseAdmin.from('cheat_attempts').insert({
      type: 'wallet',
      reason: `Invalid wallet format: ${ton_wallet_address}`,
    });
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ 
        ton_wallet_address,
        updated_at: new Date().toISOString()
      })
      .eq('tg_id', tg_id)
      .select()
      .single();

    if (error) throw error;

    // Add transaction record
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'wallet_link',
      description: 'Linked TON wallet',
      amount: 0,
    });

    return res.json({ user });
  } catch (error) {
    console.error('Save wallet error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Supabase Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_id TEXT UNIQUE NOT NULL,
  tg_name TEXT NOT NULL,
  tg_username TEXT,
  zero_points BIGINT DEFAULT 0,
  ton_wallet_address TEXT,
  referrer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Completed tasks
CREATE TABLE completed_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  reward BIGINT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INT NOT NULL,
  points_earned BIGINT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cheat attempts
CREATE TABLE cheat_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_tg_id ON users(tg_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_completed_tasks_user_id ON completed_tasks(user_id);
```

---

## TON Connect Integration

For the wallet screen, add the TON Connect SDK:

```bash
npm install @tonconnect/sdk
```

Create `lib/tonconnect.ts`:

```typescript
import { TonConnect } from '@tonconnect/sdk';

export const tonConnect = new TonConnect({
  manifestUrl: 'https://your-domain.com/tonconnect-manifest.json'
});
```

Create `public/tonconnect-manifest.json`:

```json
{
  "url": "https://your-domain.com",
  "name": "ZeroVerse",
  "iconUrl": "https://your-domain.com/icon.png"
}
```

Use in your wallet component:

```typescript
import { tonConnect } from '@/lib/tonconnect';

const handleConnect = async () => {
  const wallets = await tonConnect.getWallets();
  // Show wallet selection UI
  await tonConnect.connect(wallets[0]);
};

// Listen for connection
tonConnect.onStatusChange((wallet) => {
  if (wallet) {
    const address = wallet.account.address;
    // Call /api/save-wallet-address
  }
});
```
