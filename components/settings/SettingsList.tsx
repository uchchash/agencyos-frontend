import React, { useState, useMemo } from 'react';
import SettingItem, { SystemSetting } from './SettingItem';

interface SettingsListProps {
    settings: SystemSetting[];
    onUpdateSetting: (key: string, value: string) => Promise<void>;
}

const SettingsList: React.FC<SettingsListProps> = ({ settings, onUpdateSetting }) => {
    const [activeTab, setActiveTab] = useState<string>('general');

    // Group settings by category
    const groupedSettings = useMemo(() => {
        const groups: Record<string, SystemSetting[]> = {};
        settings.forEach(setting => {
            const category = setting.category || 'general';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(setting);
        });
        return groups;
    }, [settings]);

    const categories = Object.keys(groupedSettings).sort((a, b) => {
        // Force 'general' to be first
        if (a === 'general') return -1;
        if (b === 'general') return 1;
        return a.localeCompare(b);
    });

    // Set active tab if current not exists
    React.useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeTab)) {
            setActiveTab(categories[0]);
        }
    }, [categories, activeTab]);

    if (settings.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">No settings found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-1">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-4">
                {groupedSettings[activeTab]?.map(setting => (
                    <SettingItem
                        key={setting.key}
                        setting={setting}
                        onUpdate={onUpdateSetting}
                    />
                ))}
            </div>
        </div>
    );
};

export default SettingsList;
