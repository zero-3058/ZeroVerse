import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { Achievements } from '@/components/profile/Achievements';
import { ReferralSection } from '@/components/profile/ReferralSection';
import { SettingsMenu } from '@/components/profile/SettingsMenu';

export function ProfileScreen() {
  return (
    <div className="pb-24 space-y-6">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Stats */}
      <StatsGrid />

      {/* Achievements */}
      <Achievements />

      {/* Referral */}
      <ReferralSection />

      {/* Settings */}
      <SettingsMenu />
    </div>
  );
}
