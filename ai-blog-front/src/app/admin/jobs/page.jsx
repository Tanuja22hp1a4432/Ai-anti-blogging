'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import { Play, RefreshCw, FileText, Search, Cpu, CheckCircle, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function JobsManager() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(null);

  useEffect(() => {
    if (session?.accessToken) {
      loadLogs();
      const interval = setInterval(loadLogs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [session]);

  const loadLogs = async () => {
    try {
      const data = await blogApi.getLogs(session.accessToken);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleRunJob = async (jobName) => {
    setTriggering(jobName);
    try {
      await blogApi.triggerJob(jobName, session.accessToken);
      alert(`${jobName} job triggered successfully! Check logs for progress.`);
      loadLogs();
    } catch (err) {
      alert(`Failed to trigger ${jobName} job`);
    } finally {
      setTriggering(null);
    }
  };

  const jobCards = [
    { 
        name: 'scrape', 
        label: 'Step 1: Scrape TOI', 
        desc: 'Fetches the latest headline from Times of India homepage.', 
        icon: Search, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
    },
    { 
        name: 'enrich', 
        label: 'Step 2: Enrich Content', 
        desc: 'Searches Google for pending news and scrapes external sources.', 
        icon: Database, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50' 
    },
    { 
        name: 'generate', 
        label: 'Step 3: Generate Blog', 
        desc: 'Uses Groq LLM to synthesize sources and write an SEO blog post.', 
        icon: Cpu, 
        color: 'text-green-600', 
        bg: 'bg-green-50' 
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Automation Jobs</h1>
        <p className="text-gray-500 mt-1">Manually run scraping and generation tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobCards.map((job) => (
          <div key={job.name} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`${job.bg} ${job.color} p-4 rounded-2xl mb-6`}>
              <job.icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{job.label}</h3>
            <p className="mt-2 text-sm text-gray-500 mb-8 max-w-xs">{job.desc}</p>
            <button
              onClick={() => handleRunJob(job.name)}
              disabled={triggering === job.name}
              className="mt-auto w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50"
            >
              {triggering === job.name ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              <span className="font-semibold">Run {job.name}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span>Job Execution Logs</span>
            </h2>
            <button onClick={loadLogs} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <RefreshCw className="w-5 h-5" />
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Message</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Started At</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-6 py-4 font-bold text-gray-900 uppercase">{log.job_name.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                      log.status === 'success' ? "bg-green-50 text-green-700" : 
                      log.status === 'failed' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700 animate-pulse"
                    )}>
                      {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : 
                       log.status === 'failed' ? <XCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.message}</td>
                  <td className="px-6 py-4 text-gray-400">{format(new Date(log.started_at), 'MMM d, HH:mm:ss')}</td>
                  <td className="px-6 py-4 text-right text-gray-400">
                    {log.ended_at ? `${Math.round((new Date(log.ended_at) - new Date(log.started_at)) / 1000)}s` : '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No logs found. Run a job to see activity.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
