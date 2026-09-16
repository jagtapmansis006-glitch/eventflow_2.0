/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, Zone, Gate, TransportHub, Hotel, AIAction, SystemAlert } from './types';
import {
  INITIAL_ZONES,
  INITIAL_GATES,
  INITIAL_TRANSPORTS,
  INITIAL_HOTELS,
  INITIAL_ACTIONS,
  INITIAL_ALERTS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { InteractiveMap } from './components/InteractiveMap';
import { ZoneBottomSheet } from './components/ZoneBottomSheet';
import { AlertsScreen } from './components/AlertsScreen';
import { ActionsScreen } from './components/ActionsScreen';
import { SimulationModal } from './components/SimulationModal';
import { MoreScreen } from './components/MoreScreen';
import { DesktopLayout } from './components/DesktopLayout';
import { AttendeeDashboard } from './components/AttendeeDashboard';
import { AttendeeLoginModal } from './components/AttendeeLoginModal';
import { ZPIEngineView } from './components/ZPIEngineView';
import { computeZPI } from './engine/fusionEngine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [userMode, setUserMode] = useState<'operator' | 'attendee'>('operator');
  const [isAttendeeLoginOpen, setIsAttendeeLoginOpen] = useState<boolean>(false);
  const [isZPIEngineOpen, setIsZPIEngineOpen] = useState<boolean>(false);
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [gates, setGates] = useState<Gate[]>(INITIAL_GATES);
  const [transports, setTransports] = useState<TransportHub[]>(INITIAL_TRANSPORTS);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [actions, setActions] = useState<AIAction[]>(INITIAL_ACTIONS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [activeSimAction, setActiveSimAction] = useState<AIAction>(INITIAL_ACTIONS[0]);

  const [liveTime, setLiveTime] = useState<string>('18:42');
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<boolean>(true);
  const [interventionApplied, setInterventionApplied] = useState<boolean>(false);

  // Live clock simulation
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setLiveTime(`${hours}:${minutes}`);
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  // Live pressure telemetry updates (every 3.5 seconds as requested)
  useEffect(() => {
    if (!isSimulatingTelemetry) return;

    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          if (zone.id === 'zone-a') {
            if (interventionApplied) {
              // Post-intervention: stabilized around 71%
              const jitter = Math.floor(Math.random() * 3) - 1;
              const newPressure = Math.min(74, Math.max(68, zone.pressure + jitter));
              return {
                ...zone,
                pressure: newPressure,
                projectedPressure: 72,
                status: 'SAFE',
              };
            } else {
              // Pre-intervention: pressure builds up (78% -> 79% -> 81% -> 85% -> 91% -> 94%)
              const delta = Math.floor(Math.random() * 2) + 1;
              const newPressure = Math.min(96, zone.pressure + (zone.pressure < 94 ? delta : 0));
              return {
                ...zone,
                pressure: newPressure,
                status: newPressure >= 80 ? 'CRITICAL' : 'WARNING',
              };
            }
          }

          // Subtle background jitter for other zones to keep map feeling alive
          const jitter = Math.floor(Math.random() * 3) - 1;
          const updatedPressure = Math.min(95, Math.max(20, zone.pressure + jitter));
          return {
            ...zone,
            pressure: updatedPressure,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulatingTelemetry, interventionApplied]);

  // Handler: Selecting a zone (opens bottom sheet on mobile)
  const handleSelectZone = (zone: Zone) => {
    setSelectedZone(zone);
    setIsBottomSheetOpen(true);
  };

  // Handler: Triggering simulation for an action
  const handleTriggerSimulation = (actionId: string) => {
    const targetAction = actions.find((a) => a.id === actionId) || actions[0];
    setActiveSimAction(targetAction);
    setIsSimulationOpen(true);
    setIsBottomSheetOpen(false);
  };

  // Handler: Committing intervention
  const handleApplyIntervention = (actionId: string, redirectedCount: number) => {
    setInterventionApplied(true);

    // 1. Update Action Status
    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId ? { ...a, status: 'applied' } : a
      )
    );

    // 2. Reduce Zone A Pressure and Queue
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === 'zone-a') {
          return {
            ...z,
            pressure: 71,
            projectedPressure: 71,
            criticalInMinutes: 180,
            gateQueueMin: 8,
            inflow: 180,
            status: 'SAFE',
          };
        }
        return z;
      })
    );

    // 3. Update Gate 3 load
    setGates((prev) =>
      prev.map((g) => {
        if (g.id === 'gate-3') {
          return {
            ...g,
            queueMin: 12,
            capacity: 68,
            status: 'MODERATE',
          };
        }
        return g;
      })
    );

    // 4. Resolve Alert
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        level: 'INFO',
        title: 'Intervention Deployed: Gate 3 Bypass Active',
        subtitle: `${redirectedCount.toLocaleString()} attendees successfully diverted. Zone A pressure stabilized at 71%.`,
        timestamp: 'Just now',
        actionText: 'CONFIRMED',
      },
      ...prev.filter((a) => a.id !== 'alert-1'),
    ]);
  };

  // Handler: Respond to alert
  const handleRespondToAlert = (alert: SystemAlert) => {
    if (alert.zoneId) {
      const targetZone = zones.find((z) => z.id === alert.zoneId) || zones[0];
      setSelectedZone(targetZone);
      setIsBottomSheetOpen(true);
    } else {
      setCurrentTab('actions');
    }
  };

  // Reset demo state
  const handleResetDemo = () => {
    setZones(INITIAL_ZONES);
    setGates(INITIAL_GATES);
    setTransports(INITIAL_TRANSPORTS);
    setHotels(INITIAL_HOTELS);
    setActions(INITIAL_ACTIONS);
    setAlerts(INITIAL_ALERTS);
    setInterventionApplied(false);
    setSelectedZone(null);
    setIsBottomSheetOpen(false);
    setIsSimulationOpen(false);
  };

  const criticalZone = zones.find((z) => z.id === 'zone-a') || zones[0];
  const unreadAlerts = alerts.filter((a) => a.level === 'CRITICAL' || a.level === 'WARNING').length;
  const activeActionsCount = actions.filter((a) => a.status === 'recommended').length;
  const criticalZoneZPI = computeZPI(criticalZone).zpi;

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. DESKTOP VIEW (Displayed on screens >= 1024px) */}
      <DesktopLayout
        zones={zones}
        gates={gates}
        transports={transports}
        hotels={hotels}
        actions={actions}
        alerts={alerts}
        selectedZone={selectedZone || criticalZone}
        onSelectZone={handleSelectZone}
        onSimulateAction={handleTriggerSimulation}
        onOpenAlerts={() => setCurrentTab('alerts')}
        onResetDemo={handleResetDemo}
        liveTime={liveTime}
        onOpenAttendeeAccess={() => setIsAttendeeLoginOpen(true)}
        onOpenZPIEngine={() => setIsZPIEngineOpen(true)}
      />

      {/* 2. DEDICATED MOBILE VIEW (Strictly active on mobile screens <= 1023px, designed specifically for 390x844 and 412x915) */}
      <div className="lg:hidden flex flex-col w-full min-h-screen bg-[#0a0a0c] overflow-x-hidden relative">
        {userMode === 'attendee' ? (
          /* ======================================================== */
          /* COMPLETE ATTENDEE EXPERIENCE (Separate Header & Nav) */
          /* ======================================================== */
          <AttendeeDashboard
            zones={zones}
            gates={gates}
            transports={transports}
            hotels={hotels}
            actions={actions}
            liveTime={liveTime}
            onSwitchToOperator={() => setUserMode('operator')}
            onSimulateAction={handleTriggerSimulation}
            interventionApplied={interventionApplied}
          />
        ) : (
          /* ======================================================== */
          /* OPERATOR COMMAND CENTER EXPERIENCE */
          /* ======================================================== */
          <>
            {/* Mobile Header (Height ~64px, clean, uncluttered) */}
            <Header
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              unreadAlertCount={unreadAlerts}
              liveTime={liveTime}
              isSimulating={isSimulatingTelemetry}
              onToggleSimulating={() => setIsSimulatingTelemetry((prev) => !prev)}
              userMode={userMode}
              onOpenAttendeeAccess={() => setIsAttendeeLoginOpen(true)}
              onSwitchToOperator={() => setUserMode('operator')}
              onOpenZPIEngine={() => setIsZPIEngineOpen(true)}
              criticalZPI={criticalZoneZPI}
            />

            {/* Mobile Main Content Area */}
            <main className="flex-1 w-full flex flex-col overflow-x-hidden">
              {/* TAB 1: HOME SCREEN */}
              {currentTab === 'home' && (
                <HomeScreen
                  criticalZone={criticalZone}
                  onNavigateTab={setCurrentTab}
                  onSelectZone={handleSelectZone}
                  onTriggerAction={handleTriggerSimulation}
                  topAction={actions[0]}
                  cvStreamsOnline={24}
                  totalCvStreams={24}
                  onOpenZPIEngine={() => setIsZPIEngineOpen(true)}
                />
              )}

              {/* TAB 2: FULL-SCREEN DESTINATION MAP */}
              {currentTab === 'map' && (
                <div className="w-full flex-1 flex flex-col">
                  <InteractiveMap
                    zones={zones}
                    gates={gates}
                    transports={transports}
                    hotels={hotels}
                    selectedZoneId={selectedZone?.id || null}
                    onSelectZone={handleSelectZone}
                    onSelectGate={(gate) => {
                      const relatedZone = zones.find((z) => z.id === 'zone-a') || zones[0];
                      handleSelectZone(relatedZone);
                    }}
                    onSimulateAction={() => handleTriggerSimulation(actions[0].id)}
                    isFullScreenMobile={true}
                  />
                </div>
              )}

              {/* TAB 3: ALERTS SCREEN */}
              {currentTab === 'alerts' && (
                <AlertsScreen
                  alerts={alerts}
                  onRespondToAlert={handleRespondToAlert}
                  onSelectZoneById={(id) => {
                    const z = zones.find((item) => item.id === id);
                    if (z) handleSelectZone(z);
                  }}
                />
              )}

              {/* TAB 4: ACTIONS SCREEN */}
              {currentTab === 'actions' && (
                <ActionsScreen
                  actions={actions}
                  onSimulateAction={handleTriggerSimulation}
                  onApplyAction={(id) => handleApplyIntervention(id, 1800)}
                  zones={zones}
                  gates={gates}
                  transports={transports}
                />
              )}

              {/* TAB 5: MORE / SETTINGS SCREEN */}
              {currentTab === 'more' && (
                <MoreScreen
                  onResetDemo={handleResetDemo}
                  isSimulating={isSimulatingTelemetry}
                  onToggleSimulating={() => setIsSimulatingTelemetry((prev) => !prev)}
                  onOpenAttendeeAccess={() => setIsAttendeeLoginOpen(true)}
                  onOpenZPIEngine={() => setIsZPIEngineOpen(true)}
                />
              )}
            </main>

            {/* Fixed Mobile Bottom Navigation (5 items, 48px touch targets, zero overflow) */}
            <BottomNav
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              alertCount={unreadAlerts}
              actionCount={activeActionsCount}
            />
          </>
        )}

        {/* Zone Intelligence Bottom Sheet (slides up from bottom when any zone tapped) */}
        {isBottomSheetOpen && selectedZone && (
          <ZoneBottomSheet
            zone={selectedZone}
            onClose={() => setIsBottomSheetOpen(false)}
            onSimulateAction={handleTriggerSimulation}
            recommendedAction={actions[0]}
            onOpenZPIEngine={() => setIsZPIEngineOpen(true)}
          />
        )}

        {/* Multi-Modal Event State Fusion & ZPI Engine Modal */}
        <ZPIEngineView
          zones={zones}
          isOpen={isZPIEngineOpen}
          onClose={() => setIsZPIEngineOpen(false)}
          onSimulateAction={handleTriggerSimulation}
        />

        {/* Interactive Simulation Sandbox Modal */}
        <SimulationModal
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          action={activeSimAction}
          onApplyIntervention={handleApplyIntervention}
          zones={zones}
          gates={gates}
          transports={transports}
        />

        {/* Attendee Login / Access Modal */}
        <AttendeeLoginModal
          isOpen={isAttendeeLoginOpen}
          onClose={() => setIsAttendeeLoginOpen(false)}
          onContinueAsAttendee={() => {
            setUserMode('attendee');
            setCurrentTab('home');
            setIsAttendeeLoginOpen(false);
          }}
        />
      </div>
    </div>
  );
}
