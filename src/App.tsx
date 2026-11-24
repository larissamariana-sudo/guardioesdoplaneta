/**
 * Guardiões 3D: Resiliência Climática
 * Main Application Entry Point & Game Shell
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { IsometricCityScene } from './three/IsometricCityScene';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { CitizenInspectorModal } from './components/CitizenInspectorModal';
import { BuildingInspectorModal } from './components/BuildingInspectorModal';
import { MarketModal } from './components/MarketModal';
import { ClanSystemModal } from './components/ClanSystemModal';
import { SocialFeedModal } from './components/SocialFeedModal';
import { InternalChatModal } from './components/InternalChatModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { CommanderProfileModal } from './components/CommanderProfileModal';

const GameViewport: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<IsometricCityScene | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const {
    citizens,
    currentWeather,
    selectCitizenById,
    selectBuildingById,
    switchWeatherScenario,
    isPaused,
    setIsPaused,
    setActiveModal,
    activeModal,
  } = useGame();

  // 1. Initialize Three.js Scene Once (Ref container pattern)
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new IsometricCityScene(canvasMountRef.current, {
      onSelectCitizen: (id) => {
        selectCitizenById(id);
      },
      onSelectBuilding: (id) => {
        selectBuildingById(id);
      },
    });

    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [selectCitizenById, selectBuildingById]);

  // 2. Sync living citizens with 3D simulation
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateCitizens(citizens);
    }
  }, [citizens]);

  // 3. Sync weather state and atmospheric fog/particles
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setWeatherState(
        currentWeather.type,
        currentWeather.temperature
      );
    }
  }, [currentWeather.type, currentWeather.temperature]);

  // 4. Keyboard Shortcuts (Space for pause, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && hasStarted) {
        // Toggle pause
        setIsPaused(!isPaused);
      } else if (e.key === 'Escape') {
        setActiveModal(null);
        selectCitizenById(null);
        selectBuildingById(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPaused, setIsPaused, setActiveModal, selectCitizenById, selectBuildingById]);

  const handleCameraPreset = (
    preset: 'overview' | 'residential' | 'community' | 'park' | 'river'
  ) => {
    if (sceneRef.current) {
      sceneRef.current.setCameraView(preset);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0" />

      {/* Title Screen Overlay */}
      {!hasStarted && (
        <TitleScreen
          onStart={() => {
            setHasStarted(true);
            if (sceneRef.current) {
              sceneRef.current.setCameraView('overview');
            }
          }}
        />
      )}

      {/* In-Game HUD (Visible after mission starts) */}
      {hasStarted && (
        <>
          <GameHud
            onSelectCameraPreset={handleCameraPreset}
            onSwitchWeather={switchWeatherScenario}
          />

          {/* Modal Overlays */}
          <CitizenInspectorModal />
          <BuildingInspectorModal />
          <MarketModal />
          <ClanSystemModal />
          <SocialFeedModal />
          <InternalChatModal />
          <WeeklyReportModal />
          <CommanderProfileModal />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameViewport />
    </GameProvider>
  );
}
