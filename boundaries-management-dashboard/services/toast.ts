// Toast POS API Service
// Documentation: https://doc.toasttab.com/

const TOAST_API_BASE = 'https://ws-api.toasttab.com'

interface ToastConfig {
  apiKey: string
  clientId: string
  clientSecret: string
  restaurantGuidLittleElm: string
  restaurantGuidProsper: string
}

function getConfig(): ToastConfig {
  return {
    apiKey: process.env.TOAST_API_KEY || '',
    clientId: process.env.TOAST_CLIENT_ID || '',
    clientSecret: process.env.TOAST_CLIENT_SECRET || '',
    restaurantGuidLittleElm: process.env.TOAST_RESTAURANT_GUID_LITTLE_ELM || '',
    restaurantGuidProsper: process.env.TOAST_RESTAURANT_GUID_PROSPER || ''
  }
}

// Types
export interface SalesData {
  todaySales: number
  todayOrders: number
  avgOrderValue: number
  weeklyRevenue: number
  monthlyRevenue: number
  todaySalesLastYear?: number
  monthlyRevenueLastYear?: number
}

export interface OrderSummary {
  netSales: number
  grossSales: number
  discounts: number
  tips: number
  orderCount: number
  averageOrderValue: number
}

export interface DailySalesPoint {
  date: string
  sales: number
  orders: number
}

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

// Sales data cache (5 minute TTL)
interface CachedSalesData {
  data: SalesData
  expiresAt: number
}
const salesCache: Map<string, CachedSalesData> = new Map()
const SALES_CACHE_TTL = 300000 // 5 minutes

// Get OAuth token for Toast API (with caching)
async function getAuthToken(): Promise<string | null> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token
  }

  const config = getConfig()

  if (!config.clientId || !config.clientSecret) {
    console.error('Toast API credentials not configured')
    return null
  }

  try {
    const response = await fetch(`${TOAST_API_BASE}/authentication/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Toast auth failed:', response.status, responseText.substring(0, 200))
      throw new Error(`Auth failed: ${response.status}`)
    }

    const data = JSON.parse(responseText)
    const token = data.token?.accessToken

    if (token) {
      // Cache token for 1 hour (Toast tokens typically last longer)
      cachedToken = {
        token,
        expiresAt: Date.now() + 3600000
      }
      console.log('Toast auth success, token cached')
    }

    return token || null
  } catch (error) {
    console.error('Error getting Toast auth token:', error)
    return null
  }
}

// Get restaurant GUID based on location
function getRestaurantGuid(location: 'little-elm' | 'prosper' | 'all'): string[] {
  const config = getConfig()
  if (location === 'all') {
    return [config.restaurantGuidLittleElm, config.restaurantGuidProsper].filter(Boolean)
  }
  return location === 'little-elm'
    ? [config.restaurantGuidLittleElm].filter(Boolean)
    : [config.restaurantGuidProsper].filter(Boolean)
}

// Format date for Toast API (yyyyMMdd format)
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// Fetch orders for a date range using ordersBulk endpoint (includes full details)
export async function fetchOrders(
  location: 'little-elm' | 'prosper' | 'all',
  startDate: Date,
  endDate: Date
): Promise<OrderSummary | null> {
  const token = await getAuthToken()
  if (!token) return null

  const guids = getRestaurantGuid(location)
  if (guids.length === 0) {
    console.error('No restaurant GUIDs configured')
    return null
  }

  try {
    let totalSales = 0
    let totalOrders = 0
    let totalDiscounts = 0
    let totalTips = 0

    for (const guid of guids) {
      // Use ordersBulk endpoint which returns full order details
      const startISO = startDate.toISOString()
      const endISO = endDate.toISOString()

      let page = 1
      const pageSize = 100
      let hasMore = true

      while (hasMore) {
        const url = `${TOAST_API_BASE}/orders/v2/ordersBulk?startDate=${startISO}&endDate=${endISO}&pageSize=${pageSize}&page=${page}`

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Toast-Restaurant-External-ID': guid,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 404) break
          const errorText = await response.text()
          console.error(`Orders fetch failed for ${guid}: ${response.status}`, errorText.substring(0, 200))
          break
        }

        const orders = await response.json()

        if (Array.isArray(orders) && orders.length > 0) {
          for (const order of orders) {
            // Skip voided orders
            if (order.voided) continue

            // Process each check in the order
            const checks = order.checks || []
            for (const check of checks) {
              // Only include CLOSED checks (completed transactions)
              if (check.voided || check.paymentStatus !== 'CLOSED') continue

              totalOrders++
              totalSales += check.amount || 0
              totalTips += check.tipAmount || 0
              totalDiscounts += check.appliedDiscountAmount || 0
            }
          }

          if (orders.length < pageSize) {
            hasMore = false
          } else {
            page++
          }
        } else {
          hasMore = false
        }

        // Safety limit
        if (page > 50) {
          console.warn('Hit pagination safety limit')
          break
        }
      }

      console.log(`${guid}: ${totalOrders} closed orders, $${totalSales.toFixed(2)} net sales`)
    }

    return {
      netSales: totalSales,
      grossSales: totalSales + totalDiscounts,
      discounts: totalDiscounts,
      tips: totalTips,
      orderCount: totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return null
  }
}

// Fetch sales summary with today + month-to-date data (with caching)
export async function fetchTodaySales(location: 'little-elm' | 'prosper' | 'all'): Promise<SalesData | null> {
  const cacheKey = `sales-${location}`
  const cached = salesCache.get(cacheKey)

  // Return cached data if still valid
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`Using cached sales data for ${location}`)
    return cached.data
  }

  const today = new Date()
  const startOfToday = new Date(today)
  startOfToday.setHours(0, 0, 0, 0)

  // Get month-to-date data (from 1st of current month)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // Fetch both in parallel to reduce time
  const [todayData, monthData] = await Promise.all([
    fetchOrders(location, startOfToday, today),
    fetchOrders(location, startOfMonth, today)
  ])

  if (!monthData) return null

  const avgOrderValue = monthData.orderCount > 0 ? monthData.netSales / monthData.orderCount : 0

  const result: SalesData = {
    todaySales: todayData?.netSales || 0,
    todayOrders: todayData?.orderCount || 0,
    avgOrderValue: avgOrderValue,
    weeklyRevenue: 0,
    monthlyRevenue: monthData.netSales,
    todaySalesLastYear: undefined,
    monthlyRevenueLastYear: undefined
  }

  // Cache the result
  salesCache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + SALES_CACHE_TTL
  })
  console.log(`Cached sales data for ${location}`)

  return result
}

// Fetch daily sales for a month (for chart)
export async function fetchMonthlySalesChart(
  location: 'little-elm' | 'prosper' | 'all',
  year: number,
  month: number
): Promise<DailySalesPoint[]> {
  const token = await getAuthToken()
  if (!token) return []

  const guids = getRestaurantGuid(location)
  if (guids.length === 0) return []

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0) // Last day of month

  try {
    const salesByDay: Record<string, { sales: number, orders: number }> = {}

    for (const guid of guids) {
      const response = await fetch(
        `${TOAST_API_BASE}/orders/v2/orders?` +
        `businessDate=${formatDate(startDate)}&` +
        `businessDateEnd=${formatDate(endDate)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Toast-Restaurant-External-ID': guid,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) continue

      const orders = await response.json()

      if (Array.isArray(orders)) {
        orders.forEach((order: any) => {
          const orderDate = order.businessDate || formatDate(new Date(order.createdDate))
          if (!salesByDay[orderDate]) {
            salesByDay[orderDate] = { sales: 0, orders: 0 }
          }
          salesByDay[orderDate].sales += order.amount?.netAmount || 0
          salesByDay[orderDate].orders++
        })
      }
    }

    // Convert to array and sort by date
    return Object.entries(salesByDay)
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Error fetching monthly sales chart:', error)
    return []
  }
}

// Staff on duty cache (1 minute TTL)
interface CachedStaffData {
  count: number
  expiresAt: number
}
const staffCache: Map<string, CachedStaffData> = new Map()
const STAFF_CACHE_TTL = 60000 // 1 minute

// Get labor data (staff clocked in)
export async function fetchStaffOnDuty(location: 'little-elm' | 'prosper' | 'all'): Promise<number> {
  const cacheKey = `staff-${location}`
  const cached = staffCache.get(cacheKey)

  // Return cached data if still valid
  if (cached && cached.expiresAt > Date.now()) {
    return cached.count
  }

  const token = await getAuthToken()
  if (!token) {
    console.log('Staff on duty: No auth token')
    return 0
  }

  const guids = getRestaurantGuid(location)
  if (guids.length === 0) {
    console.log('Staff on duty: No GUIDs for location', location)
    return 0
  }

  try {
    let totalStaff = 0

    // Get today's date range in ISO format
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    for (const guid of guids) {
      // Use the shifts endpoint which gives us current active shifts
      const response = await fetch(
        `${TOAST_API_BASE}/labor/v1/shifts?` +
        `startDate=${startOfDay.toISOString()}&` +
        `endDate=${endOfDay.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Toast-Restaurant-External-ID': guid,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`Staff API failed for ${guid}: ${response.status}`, errorText.substring(0, 100))
        continue
      }

      const shifts = await response.json()
      if (Array.isArray(shifts)) {
        // Count shifts that are currently active (clocked in but not clocked out)
        const activeshifts = shifts.filter((shift: any) =>
          shift.inDate && !shift.outDate
        )
        totalStaff += activeshifts.length
        console.log(`Staff on duty at ${guid}: ${activeshifts.length} (of ${shifts.length} shifts today)`)
      }
    }

    // Cache the result
    staffCache.set(cacheKey, {
      count: totalStaff,
      expiresAt: Date.now() + STAFF_CACHE_TTL
    })

    return totalStaff
  } catch (error) {
    console.error('Error fetching staff on duty:', error)
    return 0
  }
}

// Fetch sales for both locations at once (more efficient than separate calls)
export interface LocationSalesData {
  littleElm: SalesData | null
  prosper: SalesData | null
}

export async function fetchAllLocationSales(): Promise<LocationSalesData> {
  // Check cache for both locations
  const littleElmCached = salesCache.get('sales-little-elm')
  const prosperCached = salesCache.get('sales-prosper')

  const now = Date.now()
  const littleElmValid = littleElmCached && littleElmCached.expiresAt > now
  const prosperValid = prosperCached && prosperCached.expiresAt > now

  // If both are cached, return immediately
  if (littleElmValid && prosperValid) {
    console.log('Using cached sales data for both locations')
    return {
      littleElm: littleElmCached.data,
      prosper: prosperCached.data
    }
  }

  // Fetch only the locations that need updating
  const promises: Promise<SalesData | null>[] = []
  if (!littleElmValid) promises.push(fetchTodaySales('little-elm'))
  if (!prosperValid) promises.push(fetchTodaySales('prosper'))

  const results = await Promise.all(promises)

  let resultIndex = 0
  return {
    littleElm: littleElmValid ? littleElmCached.data : results[resultIndex++] || null,
    prosper: prosperValid ? prosperCached.data : results[resultIndex] || null
  }
}
