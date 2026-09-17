import { History, ArrowRight, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

interface ChangeRecord {
  id: string;
  listingId: number;
  listingTitle: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: number;
  rolledBack: boolean;
}

export function OptimizationHistory() {
  const changes: ChangeRecord[] = [
    {
      id: '1',
      listingId: 1001,
      listingTitle: 'Personalized Metal Sign Custom Family Name Wall Art',
      field: 'Tags',
      oldValue: 'metal sign, wall art, custom sign',
      newValue: 'personalized sign, metal wall art, custom family name, farmhouse decor',
      changedAt: Date.now() - 86400000,
      rolledBack: false,
    },
    {
      id: '2',
      listingId: 1002,
      listingTitle: 'Custom Doctor Metal Sign Personalized Physician Gift',
      field: 'Title',
      oldValue: 'Doctor Metal Sign Custom Physician Office Decor',
      newValue: 'Custom Doctor Metal Sign Personalized Physician Gift Office Decor Retirement',
      changedAt: Date.now() - 172800000,
      rolledBack: false,
    },
    {
      id: '3',
      listingId: 1004,
      listingTitle: 'Personalized Garage Sign Custom Man Cave Metal Wall Art',
      field: 'Description',
      oldValue: 'Garage sign for man cave.',
      newValue: 'The perfect personalized sign for any garage, workshop, or man cave. Customize with your family name...',
      changedAt: Date.now() - 259200000,
      rolledBack: false,
    },
    {
      id: '4',
      listingId: 1006,
      listingTitle: 'Mechanic Metal Sign Custom Garage Gift',
      field: 'Tags',
      oldValue: 'mechanic sign, garage, tool room',
      newValue: 'mechanic gift, mechanic sign, tool room decor, dad mechanic gift',
      changedAt: Date.now() - 345600000,
      rolledBack: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Optimization History</h1>
        <p className="text-sm text-gray-500">Track all changes made to your listings with rollback capability</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Changes</p>
          <p className="text-2xl font-bold text-gray-900">{changes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Applied</p>
          <p className="text-2xl font-bold text-green-600">{changes.filter(c => !c.rolledBack).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Rolled Back</p>
          <p className="text-2xl font-bold text-amber-600">{changes.filter(c => c.rolledBack).length}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Change Timeline</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {changes.map((change) => (
            <div key={change.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  change.rolledBack ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  {change.rolledBack ? (
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{change.field}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Listing #{change.listingId}</span>
                    {change.rolledBack && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Rolled Back</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-2">{change.listingTitle}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-[10px] text-red-600 font-medium mb-1">Previous</p>
                      <p className="text-xs text-red-700 truncate">{change.oldValue}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded border border-green-100">
                      <p className="text-[10px] text-green-600 font-medium mb-1">New</p>
                      <p className="text-xs text-green-700 truncate">{change.newValue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">{new Date(change.changedAt).toLocaleString()}</span>
                    {!change.rolledBack && (
                      <button className="ml-auto text-[10px] text-amber-600 hover:underline flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Rollback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Safe Update System:</strong> Every change creates a complete snapshot before modification. 
          You can rollback any change by restoring the previous values through the Etsy API. 
          No changes are ever made automatically — all require explicit confirmation.
        </p>
      </div>
    </div>
  );
}
