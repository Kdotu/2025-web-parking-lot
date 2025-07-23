import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Camera, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Camera as CameraIcon, 
  Maximize,
  MapPin,
  Settings,
  Signal,
  Wifi,
  AlertTriangle
} from 'lucide-react';

interface CCTVCamera {
  id: number;
  name: string;
  coordinates: [number, number];
  status: string;
  direction: string;
  lastUpdated: string;
}

interface CCTVModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: CCTVCamera | null;
}

export default function CCTVModal({ isOpen, onClose, camera }: CCTVModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Pyodide 관련 상태
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyResult, setPyResult] = useState<string>('');
  const [pyodideLoading, setPyodideLoading] = useState(false);

  useEffect(() => {
    // pyodide가 window에 이미 로드되어 있는지 확인
    if (!(window as any).loadPyodide) {
      // pyodide.js가 없으면 동적으로 추가
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
      script.onload = () => {
        (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' }).then((py: any) => {
          setPyodide(py);
        });
      };
      document.body.appendChild(script);
    } else {
      (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' }).then((py: any) => {
        setPyodide(py);
      });
    }
  }, []);

  const runPython = async () => {
    if (!pyodide) return;
    setPyodideLoading(true);
    try {
      const result = await pyodide.runPythonAsync(`\nimport math\nmath.sqrt(16)\n`);
      setPyResult(result.toString());
    } catch (e) {
      setPyResult('에러: ' + (e as Error).message);
    }
    setPyodideLoading(false);
  };

  if (!camera) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    // 실제 구현에서는 영상 전체화면 처리
    console.log('Fullscreen requested');
  };

  const handleScreenshot = () => {
    // 실제 구현에서는 스크린샷 캡처
    console.log('Screenshot captured');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 bg-gray-900 text-white border-gray-700 p-0"
        style={{ maxWidth: '95vw', width: '95vw', height: '90vh' }}
      >
        <DialogHeader className="border-b border-gray-700 pb-4 p-6">
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Camera className="w-6 h-6 text-red-500" />
            {camera.name}
            <Badge 
              className={`ml-2 ${
                camera.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              {camera.status === 'active' ? '실시간' : '오프라인'}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            실시간 CCTV 영상 스트리밍 및 카메라 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col xl:flex-row gap-6 flex-1 overflow-hidden p-6">
          {/* Pyodide 테스트 UI */}
          {/* <div className="mb-4">
            <button
              className="px-3 py-1 bg-blue-600 rounded text-white mr-2 disabled:opacity-50"
              onClick={runPython}
              disabled={!pyodide || pyodideLoading}
            >
              {pyodideLoading ? '실행 중...' : '파이썬 실행 (math.sqrt(16))'}
            </button>
            <span className="ml-2 text-green-400">결과: {pyResult}</span>
          </div> */}
          {/* Video Section */}
          <div className="flex-1 flex flex-col">
            {/* Video Container */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex-1 min-h-[400px]">
              {/* Video Placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10">
                <video src="components/CCTV/input_video.mp4" className="w-full h-full object-cover" autoPlay muted />
                  {/* <div className="grid grid-cols-20 grid-rows-15 h-full w-full"> 
                     {Array.from({ length: 300 }).map((_, i) => (
                      <div key={i} className="border border-gray-600 border-opacity-30"></div>
                    ))} 
                  </div> */}
                </div>

                {/* Video Status */}
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-6 animate-pulse">
                    <Camera className="w-10 h-10 text-white" />                    
                  </div>
                  <h3 className="text-2xl mb-3">실시간 영상 스트리밍</h3>
                  <p className="text-gray-400 max-w-md">
                    실제 환경에서는 여기에 CCTV 실시간 영상이 표시됩니다.<br/>
                    현재는 데모 모드로 실행 중입니다.
                  </p>
                </div>

                {/* Live Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm">LIVE</span>
                </div>

                {/* Timestamp */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded">
                  <span className="text-sm font-mono">
                    {currentTime.toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      실시간
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleScreenshot}
                      className="text-white hover:bg-white/20"
                    >
                      <CameraIcon className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full xl:w-96 flex flex-col gap-4 overflow-y-auto">
            {/* Camera Info */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="flex items-center gap-2 mb-4 text-blue-400">
                <MapPin className="w-5 h-5" />
                카메라 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">카메라 ID</span>
                  <span>CCTV-{camera.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">위치</span>
                  <span>{camera.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">방향</span>
                  <span className="capitalize">{camera.direction}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">상태</span>
                  <Badge 
                    className={`${
                      camera.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    {camera.status === 'active' ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Technical Info */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="flex items-center gap-2 mb-4 text-green-400">
                <Settings className="w-5 h-5" />
                기술 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">해상도</span>
                  <span>1920x1080 (Full HD)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">프레임률</span>
                  <span>30 FPS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">비트레이트</span>
                  <span>2.5 Mbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">지연 시간</span>
                  <span>&lt; 2초</span>
                </div>
              </div>
            </Card>

            {/* Connection Status */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="flex items-center gap-2 mb-4 text-yellow-400">
                <Signal className="w-5 h-5" />
                연결 상태
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">신호 강도</span>
                  <span className="text-green-400">양호 (95%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">네트워크</span>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-green-400" />
                    <span>유선 연결</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">업타임</span>
                  <span>99.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">마지막 업데이트</span>
                  <span>{new Date(camera.lastUpdated).toLocaleTimeString('ko-KR')}</span>
                </div>
              </div>
            </Card>

            {/* Alerts */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="flex items-center gap-2 mb-4 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                알림 및 경고
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">시스템 상태</span>
                  <span className="text-green-400">정상</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">최근 경고</span>
                  <span>없음</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">유지보수</span>
                  <span>예정 없음</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">녹화 상태</span>
                  <span className="text-green-400">진행 중</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}