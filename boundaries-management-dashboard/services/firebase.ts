import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
  Firestore
} from 'firebase/firestore'

// Firebase configuration from boundaries-logbook-app
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDbOuTQGRW2LtQUpRFHmcXj782Zp4tEKvQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "boundaries-logbook-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "boundaries-logbook-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "boundaries-logbook-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "240460663130",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:240460663130:web:8976e8a967f8a101898b63"
}

// Initialize Firebase
let app: FirebaseApp
let db: Firestore

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
}

export { db }

// Types
export interface ChecklistSubmission {
  id: string
  checklistType: 'OPENING' | 'CLOSING' | 'WEEKLY'
  location: 'little-elm' | 'prosper'
  submittedBy: string
  submittedAt: Date
  completedTasks: number
  totalTasks: number
  status: 'completed' | 'pending' | 'overdue' | 'in_progress'
  tasks: {
    name: string
    completed: boolean
    photo?: string
    notes?: string
  }[]
}

export interface ChecklistTrend {
  type: string
  completionRate: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

export interface MissedTask {
  task: string
  count: number
  location: string
}

// Helper to get today's date range
function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// Helper to get date range for past N days
function getPastDaysRange(days: number) {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

// Fetch today's checklist submissions
export async function fetchTodayChecklists(location?: 'little-elm' | 'prosper'): Promise<ChecklistSubmission[]> {
  if (!db) return []

  const { start, end } = getTodayRange()

  try {
    let q = query(
      collection(db, 'submissions'),
      where('submittedAt', '>=', Timestamp.fromDate(start)),
      where('submittedAt', '<=', Timestamp.fromDate(end)),
      orderBy('submittedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date()
    })) as ChecklistSubmission[]

    if (location) {
      return submissions.filter(s => s.location === location)
    }
    return submissions
  } catch (error) {
    console.error('Error fetching today checklists:', error)
    return []
  }
}

// Subscribe to real-time checklist updates
export function subscribeToChecklists(
  callback: (checklists: ChecklistSubmission[]) => void,
  location?: 'little-elm' | 'prosper'
) {
  if (!db) {
    callback([])
    return () => {}
  }

  const { start, end } = getTodayRange()

  const q = query(
    collection(db, 'submissions'),
    where('submittedAt', '>=', Timestamp.fromDate(start)),
    where('submittedAt', '<=', Timestamp.fromDate(end)),
    orderBy('submittedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date()
    })) as ChecklistSubmission[]

    if (location) {
      callback(submissions.filter(s => s.location === location))
    } else {
      callback(submissions)
    }
  }, (error) => {
    console.error('Error subscribing to checklists:', error)
    callback([])
  })
}

// Fetch checklist trends for past N weeks
export async function fetchChecklistTrends(weeks: number = 4): Promise<{
  trends: ChecklistTrend[]
  missedTasks: MissedTask[]
  weeklyData: number[]
}> {
  if (!db) {
    return { trends: [], missedTasks: [], weeklyData: [] }
  }

  const { start, end } = getPastDaysRange(weeks * 7)

  try {
    const q = query(
      collection(db, 'submissions'),
      where('submittedAt', '>=', Timestamp.fromDate(start)),
      where('submittedAt', '<=', Timestamp.fromDate(end)),
      orderBy('submittedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date()
    })) as ChecklistSubmission[]

    // Calculate trends by type
    const typeGroups: Record<string, ChecklistSubmission[]> = {}
    submissions.forEach(s => {
      const type = s.checklistType
      if (!typeGroups[type]) typeGroups[type] = []
      typeGroups[type].push(s)
    })

    const trends: ChecklistTrend[] = Object.entries(typeGroups).map(([type, subs]) => {
      const avgCompletion = subs.reduce((sum, s) => {
        return sum + (s.completedTasks / s.totalTasks) * 100
      }, 0) / subs.length

      // Simple trend calculation - compare first half to second half
      const midpoint = Math.floor(subs.length / 2)
      const firstHalf = subs.slice(midpoint)
      const secondHalf = subs.slice(0, midpoint)

      const firstAvg = firstHalf.length > 0
        ? firstHalf.reduce((sum, s) => sum + (s.completedTasks / s.totalTasks) * 100, 0) / firstHalf.length
        : 0
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((sum, s) => sum + (s.completedTasks / s.totalTasks) * 100, 0) / secondHalf.length
        : 0

      const diff = secondAvg - firstAvg

      return {
        type: type.charAt(0) + type.slice(1).toLowerCase(),
        completionRate: Math.round(avgCompletion),
        trend: diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable',
        trendValue: Math.abs(Math.round(diff))
      }
    })

    // Calculate missed tasks
    const missedTaskCounts: Record<string, { count: number, location: string }> = {}
    submissions.forEach(s => {
      s.tasks?.forEach(task => {
        if (!task.completed) {
          const key = task.name
          if (!missedTaskCounts[key]) {
            missedTaskCounts[key] = { count: 0, location: s.location === 'little-elm' ? 'Little Elm' : 'Prosper' }
          }
          missedTaskCounts[key].count++
        }
      })
    })

    const missedTasks: MissedTask[] = Object.entries(missedTaskCounts)
      .map(([task, data]) => ({ task, count: data.count, location: data.location }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate weekly completion rates
    const weeklyData: number[] = []
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i * 7)

      const weekSubs = submissions.filter(s => {
        const date = s.submittedAt
        return date >= weekStart && date < weekEnd
      })

      if (weekSubs.length > 0) {
        const avgCompletion = weekSubs.reduce((sum, s) => {
          return sum + (s.completedTasks / s.totalTasks) * 100
        }, 0) / weekSubs.length
        weeklyData.unshift(Math.round(avgCompletion))
      } else {
        weeklyData.unshift(0)
      }
    }

    return { trends, missedTasks, weeklyData }
  } catch (error) {
    console.error('Error fetching checklist trends:', error)
    return { trends: [], missedTasks: [], weeklyData: [] }
  }
}

// Get expected checklists for today based on current time
export function getExpectedChecklists(): { type: 'OPENING' | 'CLOSING' | 'WEEKLY', deadline: string, location: string }[] {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  const expected: { type: 'OPENING' | 'CLOSING' | 'WEEKLY', deadline: string, location: string }[] = []

  // Opening checklists - both locations
  expected.push(
    { type: 'OPENING', deadline: '7:00 AM', location: 'Little Elm' },
    { type: 'OPENING', deadline: '7:00 AM', location: 'Prosper' }
  )

  // Closing checklists - both locations
  expected.push(
    { type: 'CLOSING', deadline: '9:00 PM', location: 'Little Elm' },
    { type: 'CLOSING', deadline: '9:00 PM', location: 'Prosper' }
  )

  // Weekly deep clean based on day
  const weeklyDays: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  }

  expected.push({
    type: 'WEEKLY',
    deadline: '11:00 PM',
    location: 'Little Elm'
  })

  return expected
}
