import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Camera, Car, Clock, Users } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useRef } from 'react';



// 세종시청 좌표 (공통 관리)
export const SEJONG_CITY_HALL_COORD = { lat: 36.479359, lng: 127.287068 };

// Mock data for parking lots
export const parkingLots = [
  {
    id: 1,
    name: '세종시청 주차장 A동',
    totalSpaces: 120,
    occupiedSpaces: 85,
    coordinates: { lat: 36.479359, lng: 127.287068 },
    lastUpdated: new Date(),
    type: 'public'
  },
  {
    id: 2,
    name: '세종시청 주차장 B동',
    totalSpaces: 80,
    occupiedSpaces: 62,
    coordinates: { lat: 36.480324, lng: 127.290896 },
    lastUpdated: new Date(),
    type: 'public'
  },
  // {
  //   id: 3,
  //   name: '세종시청 방문객 주차장',
  //   totalSpaces: 150,
  //   occupiedSpaces: 134,
  //   coordinates: { lat: 36.479748, lng: 127.288955 },
  //   lastUpdated: new Date(),
  //   type: 'visitor'
  // }
];

// Mock CCTV data
export const cctvCameras = [
  // {
  //   id: 1,
  //   name: '세종로 교차로 CCTV',
  //   coordinates: { lat: 36.478991, lng: 127.289528 },
  //   status: 'active',
  //   direction: 'north',
  //   lastUpdated: new Date().toISOString()
  // },
  {
    id: 1,
    name: '시청앞 대로 CCTV',
    coordinates: { lat: 36.479200, lng: 127.288800 },
    status: 'active', 
    direction: 'east',
    lastUpdated: new Date().toISOString()
  },
  
];

interface ParkingDashboardProps {}

export default function ParkingDashboard({}: ParkingDashboardProps) {
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState(parkingLots);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1Ijoic3lraW0wNTA4IiwiYSI6ImNtZDZvb3E1NzAyOWcybHB5N3F1YjVkdHcifQ.bxzRFIVXGnh4EzRhjXHx8Q';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/sykim0508/cmde130k503d201rf2ivhccls',
      center: [SEJONG_CITY_HALL_COORD.lng, SEJONG_CITY_HALL_COORD.lat],
      zoom: 15,
      minZoom: 12,
      maxZoom: 18,
      projection: 'mercator'
    });

    let markerObjs: mapboxgl.Marker[] = [];

    const addMarkers = () => {
      markerObjs.forEach(m => m.remove());
      markerObjs = [];

      // 주차장 마커
      realTimeData.forEach((parking) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="background:#2563eb;border:3px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0002;">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb"/><rect x="8" y="8" width="8" height="8" rx="2" fill="#fff"/></svg>
          </div>
        `;
        el.style.cursor = 'pointer';
        console.log('주차장 마커 생성 좌표:', parking.coordinates.lng, parking.coordinates.lat);
        const marker = new mapboxgl.Marker(el, { anchor: 'bottom' })
          .setLngLat([parking.coordinates.lng, parking.coordinates.lat])
          .addTo(map.current!);
        markerObjs.push(marker);
        el.addEventListener('click', () => {
          setSelectedParking(parking);
          map.current!.flyTo({ center: [parking.coordinates.lng, parking.coordinates.lat], zoom: 17, duration: 1000 });
        });
      });

      // CCTV 마커
      cctvCameras.forEach((cctv) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="background:#ef4444;border:3px solid #fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0002;">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444"/><rect x="8" y="8" width="8" height="8" rx="2" fill="#fff"/></svg>
          </div>
        `;
        el.style.cursor = 'pointer';
        console.log('CCTV 마커 생성 좌표:', cctv.coordinates.lng, cctv.coordinates.lat);
        const marker = new mapboxgl.Marker(el, { anchor: 'bottom' })
          .setLngLat([cctv.coordinates.lng, cctv.coordinates.lat])
          .addTo(map.current!);
        markerObjs.push(marker);
        el.addEventListener('click', () => {
          map.current!.flyTo({ center: [cctv.coordinates.lng, cctv.coordinates.lat], zoom: 17, duration: 1000 });
        });
      });
    };

    map.current.on('style.load', addMarkers);

    return () => {
      markerObjs.forEach(m => m.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [realTimeData]);

  // 실시간 데이터 업데이트 (기존 유지)
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev.map(lot => ({
        ...lot,
        occupiedSpaces: Math.max(0, Math.min(lot.totalSpaces, 
          lot.occupiedSpaces + Math.floor(Math.random() * 6) - 3)),
        lastUpdated: new Date()
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleParkingClick = (parking: any) => {
    setSelectedParking(parking);
  };

  const handleCCTVClick = (cctv: any) => {
    // In a real app, this would navigate to a CCTV streaming page
    window.open(`/cctv/${cctv.id}`, '_blank');
  };

  const getOccupancyRate = (occupied: number, total: number) => {
    return Math.round((occupied / total) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 60) return 'bg-green-500';
    if (rate < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-900 text-white">
      {/* Mapbox 지도 컨테이너 */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        {/* 범례 등 기존 UI 필요시 추가 */}
      </div>
      {/* 사이드 패널 등 기존 UI 유지 */}
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
                    {/* {realTimeData.reduce((sum, lot) => sum + lot.totalSpaces, 0)} */}
                    n
                  </p>
                </div>
              </div>
            </Card>
            <Card className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <div>
               ata<p className="text-sm text-gray-400">사용중</p>
                  <p className="text-xl">
                    {/* {realTimeData.reduce((sum, lot) => sum + lot.occupiedSpaces, 0)} */}
                    m
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