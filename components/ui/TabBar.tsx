/**
 * TabBar - Navegação por tabs mobile-first
 */

interface Tab {
  id: string;
  icon: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 min-w-[100px] px-3 py-2.5 font-medium rounded-lg transition-all ${
            activeTab === tab.id
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs whitespace-nowrap">
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
