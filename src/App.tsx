import { Clock } from './components/Clock';
import { Weather } from './components/Weather';
import { Finance } from './components/Finance';
import { News } from './components/News';
import { SystemStats } from './components/SystemStats';
import { QuickLaunch } from './components/QuickLaunch';

import { TaskManager } from './components/TaskManager';
import { YouTubeLive } from './components/YouTubeLive';
import { MapBackground } from './components/MapBackground';

function App() {
  return (
    <div className="relative h-screen w-screen bg-transparent text-white pt-[86px] pb-[150px] pr-[86px] pl-[calc(34vw-10px)] grid grid-cols-12 grid-rows-6 gap-8 overflow-hidden box-border">
      <MapBackground />

      {/* 
         LAYOUT OPTION B: "Productivity Focus" 
         12 Cols x 6 Rows
      */}

      {/* --- TOP ROW (Rows 1-2) --- 
          4 Widgets, Span 3 each (Total 12)
      */}

      {/* 1. Clock (Span 3) */}
      <div className="col-span-3 row-span-2">
        <Clock />
      </div>

      {/* 2. Finance (Span 3) */}
      <div className="col-span-3 row-span-2">
        {/* Note: Finance previously expected height. App.css/Finance.tsx might need minor adjust if height feels weird, but grid auto-fit helps. */}
        <Finance />
      </div>

      {/* 3. Weather (Span 2) - Compressed to make room for Yahoo News alignment */}
      <div className="col-span-2 row-span-2">
        <Weather />
      </div>

      <div className="col-span-4 row-span-3">
        <News />
      </div>


      {/* --- MIDDLE ROW (Row 3) --- 
          3 Widgets, Span 4 each (Total 12)
      */}

      {/* 5. Quick Launch (Span 4) */}
      <div className="col-span-4 row-span-1">
        <QuickLaunch />
      </div>

      {/* 6. System Stats (Span 4) */}
      <div className="col-span-4 row-span-1">
        <SystemStats />
      </div>




      {/* --- BOTTOM ZONE (Rows 4-6) --- 
          Split: Left 1/3 (Task Manager), Right 2/3 (Video)
      */}

      {/* Task Manager (Span 4) - Compact Mode */}
      <div className="col-span-4 row-span-3 relative">
        <TaskManager />
      </div>

      {/* Video Player (Span 8) - Restored */}
      <div className="col-span-8 row-span-3 overflow-hidden rounded-3xl shadow-2xl relative bg-black">
        <YouTubeLive />
      </div>

    </div>
  );
}

export default App;
