import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS 설정
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))
app.use('*', logger(console.log))

// 주차장 초기 데이터 설정
const initializeParkingData = async () => {
  const existingData = await kv.get('parking_lots')
  if (!existingData) {
    const initialParkingLots = [
      {
        id: 1,
        name: '세종시청 주차장 A동',
        totalSpaces: 120,
        occupiedSpaces: 85,
        coordinates: [-73.990593, 40.740121],
        lastUpdated: new Date().toISOString(),
        type: 'public'
      },
      {
        id: 2,
        name: '세종시청 주차장 B동',
        totalSpaces: 80,
        occupiedSpaces: 62,
        coordinates: [-73.991593, 40.741121],
        lastUpdated: new Date().toISOString(),
        type: 'public'
      },
      {
        id: 3,
        name: '세종시청 방문객 주차장',
        totalSpaces: 150,
        occupiedSpaces: 134,
        coordinates: [-73.989593, 40.739121],
        lastUpdated: new Date().toISOString(),
        type: 'visitor'
      }
    ]
    await kv.set('parking_lots', initialParkingLots)
  }

  const existingCCTV = await kv.get('cctv_cameras')
  if (!existingCCTV) {
    const initialCCTV = [
      {
        id: 1,
        name: '세종로 교차로 CCTV',
        coordinates: [-73.992593, 40.741621],
        status: 'active',
        direction: 'north',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        name: '시청앞 대로 CCTV',
        coordinates: [-73.988593, 40.738621],
        status: 'active',
        direction: 'east',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 3,
        name: '정부청사로 CCTV',
        coordinates: [-73.991093, 40.742121],
        status: 'active',
        direction: 'west',
        lastUpdated: new Date().toISOString()
      }
    ]
    await kv.set('cctv_cameras', initialCCTV)
  }
}

// 실시간 주차장 데이터 업데이트 (시뮬레이션)
const updateParkingData = async () => {
  try {
    const parkingLots = await kv.get('parking_lots')
    if (parkingLots) {
      const updatedLots = parkingLots.map(lot => {
        const change = Math.floor(Math.random() * 6) - 3 // -3 to +2 change
        const newOccupied = Math.max(0, Math.min(lot.totalSpaces, lot.occupiedSpaces + change))
        return {
          ...lot,
          occupiedSpaces: newOccupied,
          lastUpdated: new Date().toISOString()
        }
      })
      await kv.set('parking_lots', updatedLots)
      console.log('Parking data updated:', updatedLots)
    }
  } catch (error) {
    console.error('Error updating parking data:', error)
  }
}

// Initialize data on startup
initializeParkingData()

// Set up periodic updates every 30 seconds
setInterval(updateParkingData, 30000)

// API Routes

// 모든 주차장 정보 조회
app.get('/make-server-3c019203/parking-lots', async (c) => {
  try {
    const parkingLots = await kv.get('parking_lots')
    if (!parkingLots) {
      return c.json({ error: 'No parking data found' }, 404)
    }
    return c.json({ data: parkingLots, success: true })
  } catch (error) {
    console.error('Error fetching parking lots:', error)
    return c.json({ error: 'Failed to fetch parking lots' }, 500)
  }
})

// 특정 주차장 정보 조회
app.get('/make-server-3c019203/parking-lots/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const parkingLots = await kv.get('parking_lots')
    
    if (!parkingLots) {
      return c.json({ error: 'No parking data found' }, 404)
    }

    const parking = parkingLots.find(lot => lot.id === id)
    if (!parking) {
      return c.json({ error: 'Parking lot not found' }, 404)
    }

    return c.json({ data: parking, success: true })
  } catch (error) {
    console.error('Error fetching parking lot:', error)
    return c.json({ error: 'Failed to fetch parking lot' }, 500)
  }
})

// CCTV 정보 조회
app.get('/make-server-3c019203/cctv-cameras', async (c) => {
  try {
    const cctvCameras = await kv.get('cctv_cameras')
    if (!cctvCameras) {
      return c.json({ error: 'No CCTV data found' }, 404)
    }
    return c.json({ data: cctvCameras, success: true })
  } catch (error) {
    console.error('Error fetching CCTV cameras:', error)
    return c.json({ error: 'Failed to fetch CCTV cameras' }, 500)
  }
})

// 특정 CCTV 정보 조회
app.get('/make-server-3c019203/cctv-cameras/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const cctvCameras = await kv.get('cctv_cameras')
    
    if (!cctvCameras) {
      return c.json({ error: 'No CCTV data found' }, 404)
    }

    const cctv = cctvCameras.find(camera => camera.id === id)
    if (!cctv) {
      return c.json({ error: 'CCTV camera not found' }, 404)
    }

    return c.json({ data: cctv, success: true })
  } catch (error) {
    console.error('Error fetching CCTV camera:', error)
    return c.json({ error: 'Failed to fetch CCTV camera' }, 500)
  }
})

// 주차장 데이터 수동 업데이트 (관리자용)
app.put('/make-server-3c019203/parking-lots/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const parkingLots = await kv.get('parking_lots')
    
    if (!parkingLots) {
      return c.json({ error: 'No parking data found' }, 404)
    }

    const lotIndex = parkingLots.findIndex(lot => lot.id === id)
    if (lotIndex === -1) {
      return c.json({ error: 'Parking lot not found' }, 404)
    }

    // 업데이트할 수 있는 필드만 허용
    const allowedFields = ['occupiedSpaces', 'status']
    const updates = {}
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    parkingLots[lotIndex] = {
      ...parkingLots[lotIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    }

    await kv.set('parking_lots', parkingLots)
    
    return c.json({ 
      data: parkingLots[lotIndex], 
      success: true,
      message: 'Parking lot updated successfully'
    })
  } catch (error) {
    console.error('Error updating parking lot:', error)
    return c.json({ error: 'Failed to update parking lot' }, 500)
  }
})

// 전체 통계 조회
app.get('/make-server-3c019203/statistics', async (c) => {
  try {
    const parkingLots = await kv.get('parking_lots')
    const cctvCameras = await kv.get('cctv_cameras')
    
    if (!parkingLots) {
      return c.json({ error: 'No parking data found' }, 404)
    }

    const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0)
    const occupiedSpaces = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpaces, 0)
    const availableSpaces = totalSpaces - occupiedSpaces
    const occupancyRate = Math.round((occupiedSpaces / totalSpaces) * 100)
    
    const activeCCTV = cctvCameras ? cctvCameras.filter(camera => camera.status === 'active').length : 0

    return c.json({
      data: {
        totalSpaces,
        occupiedSpaces,
        availableSpaces,
        occupancyRate,
        totalParkingLots: parkingLots.length,
        activeCCTV,
        totalCCTV: cctvCameras ? cctvCameras.length : 0,
        lastUpdated: new Date().toISOString()
      },
      success: true
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// Health check
app.get('/make-server-3c019203/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Sejong City Hall Parking Dashboard API is running'
  })
})

Deno.serve(app.fetch)