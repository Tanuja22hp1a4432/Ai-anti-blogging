'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      blogApi.getStats(session.accessToken)
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Blogs', value: stats?.totalBlogs || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published', value: stats?.publishedBlogs || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Raw News', value: stats?.pendingNews || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Recent Status', value: stats?.lastJob?.status || 'idle', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 uppercase">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4 text-sm text-gray-600">
            {stats?.lastJob ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">Last Job: {stats.lastJob.job_name}</p>
                <p className="mt-1">Status: <span className="uppercase text-blue-600 font-bold">{stats.lastJob.status}</span></p>
                <p className="mt-1">Message: {stats.lastJob.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(stats.lastJob.started_at).toLocaleString()}</p>
              </div>
            ) : (
              <p>No recent activity logs found.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <Globe className="w-12 h-12 text-blue-100 mb-4" />
            <h2 className="text-lg font-bold text-gray-900">System is Active</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              Schedulers are running daily to fetch fresh news and generate content.
            </p>
        </div>
      </div>
    </div>
  );
}

function Globe(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
