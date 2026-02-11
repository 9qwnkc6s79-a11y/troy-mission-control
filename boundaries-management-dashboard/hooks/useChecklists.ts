'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChecklistSubmission,
  ChecklistTrend,
  MissedTask,
  subscribeToChecklists,
  fetchChecklistTrends,
  getExpectedChecklists
} from '@/services/firebase'

// Real-time checklist status hook
interface ChecklistStatus {
  id: string
  name: string
  type: 'OPENING' | 'CLOSING' | 'WEEKLY'
  status: 'completed' | 'pending' | 'overdue' | 'in_progress'
  completedAt?: string
  deadline: string
  completedTasks: number
  totalTasks: number
  criticalTasksPending: string[]
  location: string
}

interface UseChecklistsResult {
  checklists: ChecklistStatus[]
  loading: boolean
  lastUpdated: Date
}

export function useChecklists(): UseChecklistsResult {
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToChecklists((newSubmissions) => {
      setSubmissions(newSubmissions)
      setLastUpdated(new Date())
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Build checklist status from expected checklists and submissions
  const checklists: ChecklistStatus[] = []
  const expected = getExpectedChecklists()
  const now = new Date()
  const hour = now.getHours()

  expected.forEach((exp) => {
    const locationKey = exp.location.toLowerCase().replace(' ', '-') as 'little-elm' | 'prosper'
    const submission = submissions.find(
      s => s.checklistType === exp.type && s.location === locationKey
    )

    const deadlineHour = parseInt(exp.deadline.split(':')[0])
    const isPM = exp.deadline.includes('PM')
    const deadlineHour24 = isPM && deadlineHour !== 12 ? deadlineHour + 12 : deadlineHour

    let status: 'completed' | 'pending' | 'overdue' | 'in_progress' = 'pending'

    if (submission) {
      if (submission.completedTasks === submission.totalTasks) {
        status = 'completed'
      } else if (submission.completedTasks > 0) {
        status = 'in_progress'
      }
    } else if (hour > deadlineHour24) {
      status = 'overdue'
    }

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

    checklists.push({
      id: `${exp.type.toLowerCase()}-${locationKey}`,
      name: exp.type === 'WEEKLY' ? `${dayName} Deep Clean` : exp.type.charAt(0) + exp.type.slice(1).toLowerCase(),
      type: exp.type,
      status,
      completedAt: submission && status === 'completed'
        ? submission.submittedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : undefined,
      deadline: exp.deadline,
      completedTasks: submission?.completedTasks || 0,
      totalTasks: submission?.totalTasks || (exp.type === 'OPENING' ? 11 : exp.type === 'CLOSING' ? 9 : 2),
      criticalTasksPending: status !== 'completed' ? ['Clean steam wands', 'Lock doors'] : [],
      location: exp.location
    })
  })

  return { checklists, loading, lastUpdated }
}

// Checklist trends hook
interface UseChecklistTrendsResult {
  trends: ChecklistTrend[]
  missedTasks: MissedTask[]
  weeklyData: number[]
  loading: boolean
  error: Error | null
}

export function useChecklistTrends(weeks: number = 4): UseChecklistTrendsResult {
  const [trends, setTrends] = useState<ChecklistTrend[]>([])
  const [missedTasks, setMissedTasks] = useState<MissedTask[]>([])
  const [weeklyData, setWeeklyData] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchChecklistTrends(weeks)
      setTrends(data.trends)
      setMissedTasks(data.missedTasks)
      setWeeklyData(data.weeklyData)
      setError(null)
    } catch (err) {
      console.error('Error fetching checklist trends:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [weeks])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { trends, missedTasks, weeklyData, loading, error }
}
