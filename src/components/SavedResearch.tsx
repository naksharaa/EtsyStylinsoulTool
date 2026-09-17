import { useState } from 'react';
import { Bookmark, Folder, Tag, Search, Plus, MoreHorizontal } from 'lucide-react';

interface SavedItem {
  id: string;
  type: 'keyword' | 'niche' | 'competitor' | 'listing_idea' | 'optimization';
  title: string;
  folder: 'researching' | 'design_needed' | 'ready_to_list' | 'listed' | 'rejected';
  tags: string[];
  createdAt: number;
}

export function SavedResearch() {
  const [activeFolder, setActiveFolder] = useState<string>('all');

  const savedItems: SavedItem[] = [
    { id: '1', type: 'keyword', title: 'Doctor metal sign keywords', folder: 'researching', tags: ['doctor', 'medical'], createdAt: Date.now() - 86400000 },
    { id: '2', type: 'niche', title: 'NICU Nurse personalized sign opportunity', folder: 'design_needed', tags: ['nurse', 'nicu'], createdAt: Date.now() - 172800000 },
    { id: '3', type: 'competitor', title: 'Garage sign competitor analysis', folder: 'researching', tags: ['garage', 'man cave'], createdAt: Date.now() - 259200000 },
    { id: '4', type: 'listing_idea', title: '25th Anniversary metal sign concept', folder: 'ready_to_list', tags: ['anniversary', 'wedding'], createdAt: Date.now() - 345600000 },
    { id: '5', type: 'keyword', title: 'Horse equestrian keyword cluster', folder: 'listed', tags: ['horse', 'equestrian'], createdAt: Date.now() - 432000000 },
    { id: '6', type: 'niche', title: 'Retired mechanic gift niche', folder: 'researching', tags: ['mechanic', 'retirement'], createdAt: Date.now() - 518400000 },
  ];

  const folders = [
    { id: 'all', label: 'All', count: savedItems.length },
    { id: 'researching', label: 'Researching', count: savedItems.filter(i => i.folder === 'researching').length },
    { id: 'design_needed', label: 'Design Needed', count: savedItems.filter(i => i.folder === 'design_needed').length },
    { id: 'ready_to_list', label: 'Ready to List', count: savedItems.filter(i => i.folder === 'ready_to_list').length },
    { id: 'listed', label: 'Listed', count: savedItems.filter(i => i.folder === 'listed').length },
    { id: 'rejected', label: 'Rejected', count: savedItems.filter(i => i.folder === 'rejected').length },
  ];

  const filtered = activeFolder === 'all' ? savedItems : savedItems.filter(i => i.folder === activeFolder);

  const typeIcons: Record<string, string> = {
    keyword: '🔑',
    niche: '🎯',
    competitor: '👥',
    listing_idea: '💡',
    optimization: '⚡',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Research</h1>
          <p className="text-sm text-gray-500">Your saved keywords, niches, competitor research, and listing ideas</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 flex items-center gap-2">
          <Plus className="w-3 h-3" /> New Save
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Folders */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-500 mb-2 px-2">Folders</p>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                  activeFolder === folder.id ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{folder.label}</span>
                <span className="text-gray-400">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{typeIcons[item.type]}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.type}</span>
                        <span className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No saved items in this folder</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
