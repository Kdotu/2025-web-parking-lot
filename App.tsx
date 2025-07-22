import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { MapPin, Camera, Car, Clock, Users } from 'lucide-react';
import CCTVModal from './components/CCTVModal';

// Types
type ParkingLot = {
  id: number;
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  position: { left: string; top: string };
  coordinates: { lat: number; lng: number };
  lastUpdated: Date;
};

type CCTVCamera = {
  id: number;
  name: string;
  position: { left: string; top: string };
  coordinates: { lat: number; lng: number };
  status: string;
  direction: string;
  lastUpdated: string;
};

// Mock data for parking lots with real coordinates
const parkingLots: ParkingLot[] = [
  {
    id: 1,
    name: '세종시청 주차장 A동',
    totalSpaces: 120,
    occupiedSpaces: 85,
    position: { left: '35%', top: '40%' },
    coordinates: { lat: 36.479359, lng: 127.287068 },
    lastUpdated: new Date(),
  },
  {
    id: 2,
    name: '세종시청 주차장 B동',
    totalSpaces: 80,
    occupiedSpaces: 62,
    position: { left: '50%', top: '50%' },
    coordinates: { lat: 36.480324, lng: 127.290896 },
    lastUpdated: new Date(),
  }
];

// Mock CCTV data with real coordinates
const cctvCameras: CCTVCamera[] = [
  {
    id: 1,
    name: '시청앞 대로 CCTV',
    position: { left: '69%', top: '56%' },
    coordinates: { lat: 36.478991, lng: 127.289528 },
    status: 'active',
    direction: 'northwest',
    lastUpdated: new Date().toISOString()
  }
];

// Mapbox 설정
mapboxgl.accessToken = 'pk.eyJ1Ijoic3lraW0wNTA4IiwiYSI6ImNtZDZvb3E1NzAyOWcybHB5N3F1YjVkdHcifQ.bxzRFIVXGnh4EzRhjXHx8Q';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);
  const [isCCTVModalOpen, setIsCCTVModalOpen] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTVCamera | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (map.current) return; // 이미 초기화되었으면 실행하지 않음
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/sykim0508/cmde130k503d201rf2ivhccls',
        center: [127.288955, 36.479748], // 새로운 중심 좌표 [lng, lat]
        zoom: 15,
        minZoom: 12, // 최소 줌 레벨
        maxZoom: 18  // 최대 줌 레벨 (3단계씩: 12, 15, 18)
      });

      // 마커 추가 함수 (여러 이벤트에서 호출)
      const addAllMarkers = () => {
        console.log('마커 추가 시작 - 지도 상태:', {
          mapExists: !!map.current,
          isStyleLoaded: map.current?.isStyleLoaded(),
          isLoaded: map.current?.loaded()
        });

        if (!map.current) {
          console.error('지도 객체가 없습니다');
          return;
        }

        try {
          // 세종시청 중심 마커 (노란색, 큰 크기)
          console.log('세종시청 마커 생성 중...');
          const centerMarker = new mapboxgl.Marker({ 
            color: '#fbbf24', 
            scale: 1.5 
          })
            .setLngLat([127.288955, 36.479748])
            .setPopup(new mapboxgl.Popup().setHTML(
              '<div style="color: #1f2937; font-weight: 600;">세종시청</div>'
            ))
            .addTo(map.current!);
          
          console.log('✅ 세종시청 마커 추가 완료:', [127.288955, 36.479748]);

          // 주차장 마커들 (파란색)
          parkingLots.forEach((parking, index) => {
            console.log(`주차장 마커 ${index + 1} 생성 중:`, parking.name);
            
            const marker = new mapboxgl.Marker({ 
              color: '#3b82f6', 
              scale: 1.2 
            })
              .setLngLat([parking.coordinates.lng, parking.coordinates.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <div style="color: #1f2937;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${parking.name}</div>
                  <div style="font-size: 0.875rem; color: #4b5563;">
                    사용가능: ${parking.totalSpaces - parking.occupiedSpaces}면 / 총 ${parking.totalSpaces}면
                  </div>
                </div>
              `))
              .addTo(map.current!);

            console.log(`✅ ${parking.name} 마커 추가 완료:`, [parking.coordinates.lng, parking.coordinates.lat]);

            // 마커 클릭 이벤트
            marker.getElement().addEventListener('click', () => {
              setSelectedParking(parking);
            });
          });

          // CCTV 마커들 (빨간색)
          cctvCameras.forEach((cctv, index) => {
            console.log(`CCTV 마커 ${index + 1} 생성 중:`, cctv.name);
            
            const marker = new mapboxgl.Marker({ 
              color: '#ef4444', 
              scale: 1.0 
            })
              .setLngLat([cctv.coordinates.lng, cctv.coordinates.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <div style="color: #1f2937;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${cctv.name}</div>
                  <div style="font-size: 0.875rem; color: #4b5563;">
                    상태: ${cctv.status === 'active' ? '정상' : '오류'}
                  </div>
                </div>
              `))
              .addTo(map.current!);

            console.log(`✅ ${cctv.name} 마커 추가 완료:`, [cctv.coordinates.lng, cctv.coordinates.lat]);
          });

          console.log('🎉 모든 마커 추가 완료!');

        } catch (error) {
          console.error('마커 추가 중 오류:', error);
        }
      };

      // 여러 이벤트에서 마커 추가 시도
      map.current.on('load', () => {
        console.log('지도 load 이벤트 발생');
        setTimeout(addAllMarkers, 1000);
      });

      map.current.on('style.load', () => {
        console.log('지도 style.load 이벤트 발생');
        setTimeout(addAllMarkers, 500);
      });

      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log('지도 sourcedata 이벤트 발생');
          setTimeout(addAllMarkers, 200);
        }
      });

      // 강제로 일정 시간 후 마커 추가 시도
      setTimeout(() => {
        console.log('강제 마커 추가 시도 (3초 후)');
        addAllMarkers();
      }, 3000);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 지도 위치 이동 함수
  const flyToLocation = (lng: number, lat: number, zoom: number = 16) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 1000
      });
    }
  };

  // 줌 조절 함수 (1단계씩)
  const zoomIn = () => {
    if (map.current) {
      const currentZoom = map.current.getZoom();
      const newZoom = Math.min(currentZoom + 1, 18);
      map.current.zoomTo(newZoom);
    }
  };

  const zoomOut = () => {
    if (map.current) {
      const currentZoom = map.current.getZoom();
      const newZoom = Math.max(currentZoom - 1, 12);
      map.current.zoomTo(newZoom);
    }
  };

  // CCTV 모달 열기 함수
  const openCCTVModal = (cctv: CCTVCamera) => {
    setSelectedCCTV(cctv);
    setIsCCTVModalOpen(true);
  };

  const getOccupancyRate = (occupied: number, total: number): number => {
    return Math.round((occupied / total) * 100);
  };

  const getOccupancyColor = (rate: number): string => {
    if (rate >= 85) return 'bg-red-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0);
  const totalOccupied = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpaces, 0);
  const totalAvailable = totalSpaces - totalOccupied;

  return (
    <div className="dark h-screen flex flex-col lg:flex-row bg-gray-900 text-white">
              {/* Map Container */}
        <div className="flex-1 relative">
          {/* Mapbox 지도 컨테이너 */}
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map Legend */}
          <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg z-10">
            <h3 className="text-lg font-medium mb-2 text-white">범례</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-white">주차장</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-white">CCTV</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-white">세종시청</span>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
            <Button
              onClick={zoomIn}
              className="w-10 h-10 bg-gray-800 bg-opacity-90 border border-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
              variant="outline"
            >
              <span className="text-lg font-bold">+</span>
            </Button>
            <Button
              onClick={zoomOut}
              className="w-10 h-10 bg-gray-800 bg-opacity-90 border border-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
              variant="outline"
            >
              <span className="text-lg font-bold">−</span>
            </Button>
          </div>
        </div>

      {/* Side Panel */}
      <div className="w-full lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
                    {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-medium mb-2">세종시청 주차장 현황</h1>
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
                  <p className="text-xl font-medium">{totalSpaces}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">사용중</p>
                  <p className="text-xl font-medium">{totalOccupied}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Parking Lots List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-medium mb-4">주차장 목록</h2>
          <div className="space-y-4">
            {parkingLots.map((parking) => {
              const rate = getOccupancyRate(parking.occupiedSpaces, parking.totalSpaces);
              const available = parking.totalSpaces - parking.occupiedSpaces;
              
              return (
                                    <Card
                      key={parking.id}
                      className={`bg-gray-700 border-gray-600 cursor-pointer transition-all hover:bg-gray-600 p-4 ${
                        selectedParking?.id === parking.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedParking(parking);
                        flyToLocation(parking.coordinates.lng, parking.coordinates.lat, 17);
                      }}
                    >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{parking.name}</h3>
                    <Badge className={`${getOccupancyColor(rate)} text-white`}>
                      {rate}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">사용가능</span>
                      <span className="text-red-400">{available}면</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">총 주차면</span>
                      <span>{parking.totalSpaces}면</span>
                    </div>
                    
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getOccupancyColor(rate)}`}
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{currentTime.toLocaleTimeString('ko-KR')}</span> 업데이트
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CCTV Section */}
        <div className="p-6 border-t border-gray-700">
          <h2 className="text-lg font-medium mb-4">CCTV 현황</h2>
          <div className="space-y-2">
            {cctvCameras.map((cctv) => (
                    <Button
                    key={cctv.id}
                    variant="outline"
                    className="w-full flex items-center justify-start p-3 border-gray-600 hover:bg-gray-600 transition-colors text-left"
                    onClick={() => flyToLocation(cctv.coordinates.lng, cctv.coordinates.lat, 18)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    <span className="flex-1">{cctv.name}</span>
                    <Badge 
                      className="bg-gray-600 text-gray-300 ml-2 cursor-pointer hover:bg-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCCTVModal(cctv);
                      }}
                    >
                      실시간
                    </Badge>
                  </Button>
            ))}
          </div>
                  </div>
        </div>

        {/* CCTV Modal */}
        <CCTVModal
          isOpen={isCCTVModalOpen}
          onClose={() => setIsCCTVModalOpen(false)}
          camera={selectedCCTV ? {
            ...selectedCCTV,
            coordinates: [selectedCCTV.coordinates.lng, selectedCCTV.coordinates.lat]
          } : null}
        />
      </div>
    );
  }