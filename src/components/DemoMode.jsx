// DemoMode.jsx - Add this as a new component
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function DemoMode({ penetrations, onUpdate, isActive, onToggle }) {
  const [speed, setSpeed] = useState(2000); // milliseconds between updates
  const [updatesRemaining, setUpdatesRemaining] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const [activityLog, setActivityLog] = useState([]);

  // Status progression logic
  const getNextStatus = (currentStatus) => {
    const progressions = {
      'not_started': 'open',
      'open': 'closed',
      'closed': 'verified',
      'verified': 'verified' // Already complete
    };
    return progressions[currentStatus] || 'open';
  };

  // Get random contractor name for realism
  const getRandomContractor = () => {
    const contractors = ['Maersk', 'Wartsila', 'ABB', 'Navicross', 'Roxtec'];
    return contractors[Math.floor(Math.random() * contractors.length)];
  };

  // Simulate a pen update
  const simulateUpdate = () => {
    // Filter pens that can still progress
    const eligiblePens = penetrations.filter(p => p.status !== 'verified');
    
    if (eligiblePens.length === 0) {
      console.log('All pens verified - demo complete!');
      setIsPaused(true);
      return;
    }

    // Pick random pen
    const randomPen = eligiblePens[Math.floor(Math.random() * eligiblePens.length)];
    const newStatus = getNextStatus(randomPen.status);
    
    // Create activity log entry
    const timestamp = new Date().toLocaleTimeString();
    const activity = {
      time: timestamp,
      penId: randomPen.pen_id,
      action: newStatus,
      contractor: randomPen.contractor_name || getRandomContractor()
    };
    
    setActivityLog(prev => [activity, ...prev].slice(0, 10)); // Keep last 10
    
    // Call the update function passed from parent
    onUpdate({
      ...randomPen,
      status: newStatus,
      opened_at: newStatus === 'open' ? new Date().toISOString() : randomPen.opened_at,
      completed_at: newStatus === 'closed' ? new Date().toISOString() : randomPen.completed_at
    });
    
    setUpdatesRemaining(prev => prev - 1);
  };

  // Demo simulation loop
  useEffect(() => {
    if (!isActive || isPaused || updatesRemaining <= 0) return;

    const interval = setInterval(() => {
      simulateUpdate();
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, isPaused, updatesRemaining, speed, penetrations]);

  // Reset demo
  const handleReset = () => {
    setUpdatesRemaining(20);
    setActivityLog([]);
    setIsPaused(false);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-purple-900 text-white rounded-lg shadow-2xl p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-bold">DEMO MODE</span>
        </div>
        <button
          onClick={onToggle}
          className="text-white/80 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="bg-purple-800 rounded p-2">
          <div className="text-purple-300 text-xs">Updates Remaining</div>
          <div className="text-xl font-bold">{updatesRemaining}</div>
        </div>
        <div className="bg-purple-800 rounded p-2">
          <div className="text-purple-300 text-xs">Speed</div>
          <div className="text-xl font-bold">{speed / 1000}s</div>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-3">
        <label className="text-xs text-purple-300 block mb-1">Update Speed</label>
        <input
          type="range"
          min="500"
          max="5000"
          step="500"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-purple-300 mt-1">
          <span>Fast (0.5s)</span>
          <span>Slow (5s)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex-1 bg-purple-700 hover:bg-purple-600 py-2 rounded flex items-center justify-center gap-2 transition"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Activity Log */}
      <div className="bg-purple-950 rounded p-2 max-h-40 overflow-y-auto">
        <div className="text-xs text-purple-300 mb-1 font-semibold">Activity Log</div>
        {activityLog.length === 0 ? (
          <div className="text-xs text-purple-400 italic">Waiting for updates...</div>
        ) : (
          <div className="space-y-1">
            {activityLog.map((activity, idx) => (
              <div key={idx} className="text-xs border-l-2 border-purple-600 pl-2 py-1">
                <div className="flex justify-between">
                  <span className="font-mono font-bold">{activity.penId}</span>
                  <span className="text-purple-400">{activity.time}</span>
                </div>
                <div className="text-purple-300">
                  {activity.contractor} → <span className={getStatusColor(activity.action)}>{activity.action.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-purple-400 text-center">
        Press <kbd className="bg-purple-800 px-1 rounded">Shift+D</kbd> to toggle
      </div>
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status) {
  const colors = {
    'open': 'text-red-400',
    'closed': 'text-blue-400',
    'verified': 'text-green-400',
    'not_started': 'text-gray-400'
  };
  return colors[status] || 'text-white';
}