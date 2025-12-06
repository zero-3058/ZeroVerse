import React from 'react';
import { User, Bell, Shield, HelpCircle, MessageCircle, FileText, ChevronRight } from 'lucide-react';

const accountItems = [
  { icon: User, label: 'Edit Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Privacy & Security' },
];

const supportItems = [
  { icon: HelpCircle, label: 'Help Center' },
  { icon: MessageCircle, label: 'Contact Support' },
  { icon: FileText, label: 'Terms of Service' },
];

interface MenuSectionProps {
  title: string;
  items: typeof accountItems;
}

function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button key={index} className="menu-item w-full text-left">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsMenu() {
  return (
    <div className="space-y-6">
      <MenuSection title="Account" items={accountItems} />
      <MenuSection title="Support" items={supportItems} />
    </div>
  );
}
