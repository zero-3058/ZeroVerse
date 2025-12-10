import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  ChevronRight,
  X
} from 'lucide-react';

const accountItems = [
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Privacy & Security', modal: 'privacy' },
];

const supportItems = [
  { icon: FileText, label: 'Terms of Service', modal: 'terms' },
];

interface MenuSectionProps {
  title: string;
  items: typeof accountItems;
  onOpenModal: (type: 'privacy' | 'terms') => void;
}

function MenuSection({ title, items, onOpenModal }: MenuSectionProps) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button 
              key={index} 
              className="menu-item w-full text-left"
              onClick={() => item.modal && onOpenModal(item.modal as any)}
            >
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

function CenterModal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
      <div className="bg-background p-5 rounded-2xl w-11/12 max-w-sm shadow-xl border border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  );
}

export function SettingsMenu() {
  const [openModal, setOpenModal] = useState<null | 'privacy' | 'terms'>(null);

  return (
    <div className="space-y-6">
      <MenuSection 
        title="Account" 
        items={accountItems} 
        onOpenModal={setOpenModal} 
      />
      <MenuSection 
        title="Support" 
        items={supportItems} 
        onOpenModal={setOpenModal} 
      />

      {/* Privacy Modal */}
      {openModal === 'privacy' && (
        <CenterModal 
          title="Privacy & Security"
          onClose={() => setOpenModal(null)}
        >
          <p>Your privacy is important. We store minimal data and never share it with third parties.</p>
          <p>Security practices follow encryption and permission-based access.</p>
        </CenterModal>
      )}

      {/* Terms Modal */}
      {openModal === 'terms' && (
        <CenterModal 
          title="Terms of Service"
          onClose={() => setOpenModal(null)}
        >
          <p>By using ZeroVerse, you agree to fair gameplay and no misuse of the platform.</p>
          <p>Violations can result in temporary or permanent restrictions.</p>
        </CenterModal>
      )}
    </div>
  );
}
