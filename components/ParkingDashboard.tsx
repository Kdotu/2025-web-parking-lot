import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Camera, Car, Clock, Users } from 'lucide-react';

// Mock data for parking lots
const parkingLots = [
  {
    id: 1,
    name: '세종시청 주차장 A동',
    totalSpaces: 120,
    occupiedSpaces: 85,
    coordinates: [-73.990593, 40.740121],
    lastUpdated: new Date(),
    type: 'public'
  },
  {
    id: 2,
    name: '세종시청 주차장 B동',
    totalSpaces: 80,
    occupiedSpaces: 62,
    coordinates: [-73.991593, 40.741121],
    lastUpdated: new Date(),
    type: 'public'
  },
  {
    id: 3,
    name: '세종시청 방문객 주차장',
    totalSpaces: 150,
    occupiedSpaces: 134,
    coordinates: [-73.989593, 40.739121],
    lastUpdated: new Date(),
    type: 'visitor'
  }
];

// Mock CCTV data
const cctvCameras = [
  {
    id: 1,
    name: '세종로 교차로 CCTV',
    coordinates: [-73.992593, 40.741621],
    status: 'active',
    direction: 'north'
  },
  {
    id: 2,
    name: '시청앞 대로 CCTV',
    coordinates: [-73.988593, 40.738621],
    status: 'active', 
    direction: 'east'
  },
  {
    id: 3,
    name: '정부청사로 CCTV',
    coordinates: [-73.991093, 40.742121],
    status: 'active',
    direction: 'west'
  }
];

interface ParkingDashboardProps {}

export default function ParkingDashboard({}: ParkingDashboardProps) {
  const [selectedParking, setSelectedParking] = useState(null);
  const [realTimeData, setRealTimeData] = useState(parkingLots);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev.map(lot => ({
        ...lot,
        occupiedSpaces: Math.max(0, Math.min(lot.totalSpaces, 
          lot.occupiedSpaces + Math.floor(Math.random() * 6) - 3)),
        lastUpdated: new Date()
      })));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleParkingClick = (parking) => {
    setSelectedParking(parking);
  };

  const handleCCTVClick = (cctv) => {
    // In a real app, this would navigate to a CCTV streaming page
    window.open(`/cctv/${cctv.id}`, '_blank');
  };

  const getOccupancyRate = (occupied, total) => {
    return Math.round((occupied / total) * 100);
  };

  const getOccupancyColor = (rate) => {
    if (rate < 60) return 'bg-green-500';
    if (rate < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-900 text-white">
      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Mapbox Map Placeholder */}
        <div className="w-full h-full bg-gray-800 relative overflow-hidden">
          {/* Dark themed map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
          
          {/* Mock map grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-gray-600 border-opacity-30"></div>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg">
            <h3 className="mb-2">범례</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">주차장</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">CCTV</span>
              </div>
            </div>
          </div>

          {/* Parking Markers */}
          {realTimeData.map((parking) => (
            <div
              key={parking.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${50 + (parking.id - 2) * 15}%`,
                top: `${50 + (parking.id - 2) * 10}%`
              }}
              onClick={() => handleParkingClick(parking)}
            >
              <div className="relative group">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {parking.name}
                </div>
              </div>
            </div>
          ))}

          {/* CCTV Markers */}
          {cctvCameras.map((cctv) => (
            <div
              key={cctv.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${45 + cctv.id * 12}%`,
                top: `${40 + cctv.id * 8}%`
              }}
              onClick={() => handleCCTVClick(cctv)}
            >
              <div className="relative group">
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {cctv.name}
                </div>
              </div>
            </div>
          ))}

          {/* Center marker for 세종시청 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
              세종시청
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl mb-2">세종시청 주차장 현황</h1>
          <p className="text-gray-400">실시간 업데이트</p>
        </div>

        {/* Overall Stats */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">총 주차면</p>
                  <p className="text-xl">
                    {realTimeData.reduce((sum, lot) => sum + lot.totalSpaces, 0)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">사용중</p>
                  <p className="text-xl">
                    {realTimeData.reduce((sum, lot) => sum + lot.occupiedSpaces, 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Parking Lots List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="mb-4">주차장 목록</h2>
          <div className="space-y-4">
            {realTimeData.map((parking) => {
              const occupancyRate = getOccupancyRate(parking.occupiedSpaces, parking.totalSpaces);
              const availableSpaces = parking.totalSpaces - parking.occupiedSpaces;
              
              return (
                <Card 
                  key={parking.id}
                  className={`bg-gray-700 border-gray-600 cursor-pointer transition-all hover:bg-gray-600 ${
                    selectedParking?.id === parking.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleParkingClick(parking)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{parking.name}</h3>
                      <Badge 
                        className={`${getOccupancyColor(occupancyRate)} text-white`}
                      >
                        {occupancyRate}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">사용가능</span>
                        <span className={availableSpaces > 10 ? 'text-green-400' : 'text-red-400'}>
                          {availableSpaces}면
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">총 주차면</span>
                        <span>{parking.totalSpaces}면</span>
                      </div>
                      
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getOccupancyColor(occupancyRate)}`}
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {parking.lastUpdated.toLocaleTimeString()} 업데이트
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CCTV Section */}
        <div className="p-6 border-t border-gray-700">
          <h2 className="mb-4">CCTV 현황</h2>
          <div className="space-y-2">
            {cctvCameras.map((cctv) => (
              <Button
                key={cctv.id}
                variant="outline"
                className="w-full justify-start border-gray-600 hover:bg-gray-600"
                onClick={() => handleCCTVClick(cctv)}
              >
                <Camera className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">{cctv.name}</span>
                <Badge variant="secondary" className="ml-2">
                  실시간
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}