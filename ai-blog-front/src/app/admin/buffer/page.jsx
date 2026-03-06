'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import { Database, Search, FileText, ChevronRight, Hash } from 'lucide-react';

export default function BufferViewer() {
  const { data: session } = useSession();
  const [buffer, setBuffer] = useState([]);
  const [rawNews, setRawNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buffer');

  useEffect(() => {
    if (session?.accessToken) {
      Promise.all([
        blogApi.getBuffer(session.accessToken),
        blogApi.getRawNews(session.accessToken)
      ]).then(([bufferData, rawNewsData]) => {
        setBuffer(bufferData);
        setRawNews(rawNewsData);
      }).finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div className="text-gray-500">Loading buffer data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Buffer</h1>
        <p className="text-gray-500 mt-1">Inspect raw scraped data and enriched sources</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('buffer')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'buffer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Enriched Buffer ({buffer.length})
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'raw' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Raw Headlines ({rawNews.length})
        </button>
      </div>

      {activeTab === 'buffer' ? (
        <div className="grid grid-cols-1 gap-6">
          {buffer.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{item.source_title}</h3>
                        <p className="text-xs text-blue-500 flex items-center space-x-1 mt-0.5">
                            <Hash className="w-3 h-3" />
                            <span>Linked to: {item.raw_title}</span>
                        </p>
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded italic uppercase">
                    {item.status}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 line-clamp-4 leading-relaxed font-mono">
                {item.content}
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">
                <a href={item.source_url} target="_blank" className="hover:text-blue-600 flex items-center space-x-1">
                    <span>View Source</span>
                    <ChevronRight className="w-3 h-3" />
                </a>
                <span>Scraped {new Date(item.scraped_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {buffer.length === 0 && <div className="py-20 text-center text-gray-400">Enriched buffer is empty.</div>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Headline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawNews.map((news) => (
                <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{news.title}</div>
                    <a href={news.url} target="_blank" className="text-xs text-blue-500 hover:underline">{news.url}</a>
                  </td>
                  <td className="px-6 py-4 uppercase">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${news.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                      {news.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 text-xs">
                    {new Date(news.scraped_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
