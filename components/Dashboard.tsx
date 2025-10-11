import React, { useState } from 'react';
import { Role, Tab } from '../types';
import SystemArchitecture from './SystemArchitecture';
import SupportCenter from './SupportCenter';
import KnowledgeEngine from './KnowledgeEngine';
import DatasetGenerator from './DatasetGenerator';
import IntegratedSupportHub from './IntegratedSupportHub';
import { ArrowLeftIcon, BrainCircuitIcon, LifeBuoyIcon, MessageSquareIcon, DatabaseIcon, BookOpenCheckIcon, MenuIcon, XIcon } from './common/Icons';

interface DashboardProps {
  role: Role;
  onBack: () => void;
}

const TABS_INFO: Record<Tab, { id: Tab; icon: React.ReactNode; description: string; }> = {
    [Tab.SystemArchitecture]: { 
        id: Tab.SystemArchitecture, 
        icon: <BrainCircuitIcon className="w-5 h-5 mr-3" />,
        description: "Visually explore system components, data flows, and integration points."
    },
    [Tab.SupportCenter]: { 
        id: Tab.SupportCenter, 
        icon: <LifeBuoyIcon className="w-5 h-5 mr-3" />,
        description: "Use interactive tools to diagnose issues and find escalation procedures."
     },
    [Tab.KnowledgeEngine]: { 
        id: Tab.KnowledgeEngine, 
        icon: <MessageSquareIcon className="w-5 h-5 mr-3" />,
        description: "Ask questions and get answers from the support documentation using AI."
    },
    [Tab.DatasetGenerator]: {
        id: Tab.DatasetGenerator,
        icon: <DatabaseIcon className="w-5 h-5 mr-3" />,
        description: "Generate structured Q&A datasets for model training and validation."
    },
    [Tab.IntegratedSupportHub]: {
        id: Tab.IntegratedSupportHub,
        icon: <BookOpenCheckIcon className="w-5 h-5 mr-3" />,
        description: "A unified view for diagnostics, AI chat, and documentation generation."
    }
};

const Dashboard = ({ role, onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(
    role === Role.SupportEngineer ? Tab.IntegratedSupportHub : Tab.SystemArchitecture
  );
  const [isNavOpen, setIsNavOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SystemArchitecture:
        return <SystemArchitecture />;
      case Tab.SupportCenter:
        return <SupportCenter role={role} />;
      case Tab.KnowledgeEngine:
        return <KnowledgeEngine role={role} />;
      case Tab.DatasetGenerator:
        return <DatasetGenerator />;
      case Tab.IntegratedSupportHub:
        return <IntegratedSupportHub role={role} />;
      default:
        return <SystemArchitecture />;
    }
  };
  
  const activeTabInfo = TABS_INFO[activeTab];

  const getVisibleTabs = () => {
    if (role === Role.SupportEngineer) {
      return [TABS_INFO[Tab.IntegratedSupportHub], TABS_INFO[Tab.SystemArchitecture]];
    }
    
    const allTabs = [TABS_INFO[Tab.SystemArchitecture], TABS_INFO[Tab.SupportCenter], TABS_INFO[Tab.KnowledgeEngine], TABS_INFO[Tab.DatasetGenerator]];
    
    return allTabs.filter(tab => {
        if (tab.id === Tab.DatasetGenerator) {
            return role === Role.LMTrainer;
        }
        return tab.id !== Tab.IntegratedSupportHub;
    });
  };

  const visibleTabs = getVisibleTabs();
  
  const NavLinks = () => (
    <ul className="space-y-2">
      {visibleTabs.map(({ id, icon }) => (
        <li key={id}>
          <button
            onClick={() => {
              setActiveTab(id);
              setIsNavOpen(false); // Close nav on selection
            }}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === id
                ? 'bg-brand-accent text-brand-bg font-semibold shadow-lg'
                : 'text-brand-text opacity-70 hover:bg-white/5 hover:opacity-100'
            }`}
          >
            {icon}
            {id}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col h-screen bg-brand-bg">
      <header className="flex items-center justify-between p-3 md:p-4 bg-brand-surface shadow-md border-b border-brand-bg z-30">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors md:mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-brand-text opacity-70" />
          </button>
           <div className="md:hidden ml-2">
            <button onClick={() => setIsNavOpen(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <MenuIcon className="w-5 h-5 text-brand-text opacity-70" />
            </button>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-brand-text ml-2 md:ml-0">Knowledge Navigator</h1>
        </div>
        <div className="text-xs sm:text-sm text-brand-text opacity-80">
          Role: <span className="font-semibold text-brand-accent">{role}</span>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div className={`fixed inset-0 z-40 transition-transform transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsNavOpen(false)}></div>
          <div className="relative w-64 h-full bg-brand-surface p-4 border-r border-brand-bg flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-brand-text">Navigation</h2>
                   <button onClick={() => setIsNavOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <XIcon className="w-5 h-5 text-brand-text opacity-70" />
                  </button>
              </div>
              <NavLinks />
          </div>
      </div>


      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden md:block w-64 bg-brand-surface p-4 border-r border-brand-bg">
          <NavLinks />
        </nav>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-brand-accent">{activeTabInfo.id}</h2>
              <p className="text-brand-text opacity-80 text-sm md:text-base">{activeTabInfo.description}</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;