'use client'

import { ClipboardCheck, CheckCircle, Clock, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { useChecklists } from '@/hooks/useChecklists'

export function OperationsHealth() {
  const { checklists, loading, lastUpdated } = useChecklists()

  // Group by location
  const littleElmChecklists = checklists.filter(c => c.location === 'Little Elm')
  const prosperChecklists = checklists.filter(c => c.location === 'Prosper')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'overdue':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
    }
  }

  const renderChecklist = (checklist: typeof checklists[0]) => (
    <div
      key={checklist.id}
      className={`p-3 rounded-lg border ${getStatusBg(checklist.status)}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {getStatusIcon(checklist.status)}
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {checklist.name}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {checklist.status === 'completed' ? checklist.completedAt : `Due ${checklist.deadline}`}
        </span>
      </div>
      {checklist.status !== 'completed' && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{checklist.completedTasks}/{checklist.totalTasks} tasks</span>
          {checklist.criticalTasksPending.length > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{checklist.criticalTasksPending.length} critical pending</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
      <div className="boundaries-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Operations Health</h3>
          <ClipboardCheck className="h-5 w-5 text-white opacity-80" />
        </div>
        <p className="text-sm text-white/70 mt-1">
          Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading checklists...</span>
          </div>
        ) : (
          <>
            {/* Little Elm */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-boundaries-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Little Elm</span>
              </div>
              <div className="space-y-2">
                {littleElmChecklists.length > 0 ? (
                  littleElmChecklists.map(renderChecklist)
                ) : (
                  <p className="text-sm text-gray-500 italic">No checklists scheduled</p>
                )}
              </div>
            </div>

            {/* Prosper */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-boundaries-secondary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prosper</span>
              </div>
              <div className="space-y-2">
                {prosperChecklists.length > 0 ? (
                  prosperChecklists.map(renderChecklist)
                ) : (
                  <p className="text-sm text-gray-500 italic">No checklists scheduled</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
