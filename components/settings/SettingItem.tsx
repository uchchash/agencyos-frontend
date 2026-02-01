import React, { useState } from 'react';

export interface SystemSetting {
    key: string;
    name: string;
    description: string;
    category: string;
    value: string;
    value_type: 'string' | 'integer' | 'boolean' | 'json' | 'text' | 'email' | 'url' | 'file';
    default_value: string;
    is_required: boolean;
    help_text: string;
    placeholder: string;
    is_editable: boolean;
}

interface SettingItemProps {
    setting: SystemSetting;
    onUpdate: (key: string, value: string) => Promise<void>;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
    const [value, setValue] = useState(setting.value || setting.default_value);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(e.target.value);
    };

    const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.checked.toString());
        // Auto-save for boolean toggles
        handleSave(e.target.checked.toString());
    };

    const handleSave = async (overrideValue?: string) => {
        setIsUpdating(true);
        setError('');
        try {
            await onUpdate(setting.key, overrideValue !== undefined ? overrideValue : value);
        } catch (err) {
            setError('Failed to update setting');
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && setting.value_type !== 'text' && setting.value_type !== 'json') {
             e.preventDefault();
             handleSave();
        }
    }

    const renderInput = () => {
        switch (setting.value_type) {
            case 'boolean':
                const isChecked = value.toLowerCase() === 'true' || value === '1';
                return (
                    <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isChecked}
                                onChange={handleBooleanChange}
                                disabled={!setting.is_editable || isUpdating}
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-slate-300">
                                {isChecked ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                );
            
            case 'text':
            case 'json':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={value}
                            onChange={handleChange}
                            disabled={!setting.is_editable || isUpdating}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
                            rows={5}
                            placeholder={setting.placeholder}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave()}
                                disabled={!setting.is_editable || isUpdating}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                );

            case 'integer':
                return (
                    <div className="flex gap-2">
                         <input
                            type="number"
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => handleSave()}
                            disabled={!setting.is_editable || isUpdating}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            placeholder={setting.placeholder}
                        />
                         {isUpdating && <span className="text-slate-400 text-sm flex items-center">Saving...</span>}
                    </div>
                );

            default: // string, email, url, etc.
                return (
                    <div className="flex gap-2">
                        <input
                            type={setting.value_type === 'email' ? 'email' : setting.value_type === 'url' ? 'url' : 'text'}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => handleSave()}
                            disabled={!setting.is_editable || isUpdating}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            placeholder={setting.placeholder}
                        />
                         {isUpdating && <span className="text-slate-400 text-sm flex items-center">Saving...</span>}
                    </div>
                );
        }
    };

    return (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-white">{setting.name}</h3>
                    {setting.is_required && (
                        <span className="text-xs text-red-400" title="Required">*</span>
                    )}
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {setting.key}
                    </span>
                </div>
                {setting.description && (
                    <p className="text-sm text-slate-400 mb-3">{setting.description}</p>
                )}
            </div>

            {renderInput()}

            {setting.help_text && (
                 <p className="mt-2 text-xs text-slate-500">{setting.help_text}</p>
            )}
            
            {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
};

export default SettingItem;
