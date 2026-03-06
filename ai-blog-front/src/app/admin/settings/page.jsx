'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import { Save, RefreshCw, Clock, Bot, Layout, Sliders } from 'lucide-react';

export default function SettingsManager() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (session?.accessToken) {
      loadSettings();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const data = await blogApi.getSettings(session.accessToken);
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    setSaving(key);
    try {
      await blogApi.updateSetting(key, value, session.accessToken);
      loadSettings();
    } catch (err) {
      alert('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="text-gray-500">Loading settings...</div>;

  const settingGroups = [
    {
      title: 'Schedule Configuration',
      icon: Clock,
      items: settings.filter(s => s.key.includes('time')),
      labels: {
        scrape_time: 'Daily Scrape Time (HH:mm)',
        generate_time: 'Daily Generation Time (HH:mm)',
      }
    },
    {
      title: 'Generation Preferences',
      icon: Bot,
      items: settings.filter(s => ['blog_tone', 'blog_word_count', 'max_buffer_sources'].includes(s.key)),
      labels: {
        blog_tone: 'Writing Tone (e.g. Professional, Casual)',
        blog_word_count: 'Target Word Count',
        max_buffer_sources: 'Max Google Sources to Use'
      }
    },
    {
      title: 'Automation Rules',
      icon: Sliders,
      items: settings.filter(s => s.key === 'auto_publish'),
      labels: {
        auto_publish: 'Auto-Publish Generated Blogs'
      }
    }
  ];

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure automation behavior and LLM preferences</p>
      </div>

      <div className="space-y-8">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b bg-gray-50 flex items-center space-x-3 text-gray-900 font-bold">
              <group.icon className="w-5 h-5 text-blue-600" />
              <h2>{group.title}</h2>
            </div>
            <div className="p-8 space-y-8">
              {group.items.map((setting) => (
                <div key={setting.key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="max-w-md">
                    <label className="block text-sm font-bold text-gray-700 tracking-tight">
                        {group.labels[setting.key] || setting.key}
                    </label>
                    <p className="text-xs text-gray-400 mt-1 uppercase italic">Internal Key: {setting.key}</p>
                  </div>
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    {setting.key === 'auto_publish' ? (
                        <select 
                            value={setting.value}
                            onChange={(e) => handleUpdate(setting.key, e.target.value)}
                            disabled={saving === setting.key}
                            className="bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-32"
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    ) : (
                        <input
                            type="text"
                            defaultValue={setting.value}
                            onBlur={(e) => {
                                if (e.target.value !== setting.value) handleUpdate(setting.key, e.target.value);
                            }}
                            className="bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48 text-right"
                        />
                    )}
                    {saving === setting.key && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
