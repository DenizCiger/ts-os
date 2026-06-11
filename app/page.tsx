"use client";

import { Taskbar, TaskbarApp } from "@/components/taskbar";
import { Window } from "@/components/window";
import { apps, WindowInstance } from "@/lib/apps";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString(),
  );
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  function restoreWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, status: "open", zIndex: nextZIndex }
          : windowInstance,
      ),
    );
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function launchApp(appId: string) {
    const app = apps.find((app) => app.id === appId);
    if (!app) return;

    const existingWindow = windows.find(
      (windowInstance) => windowInstance.appId === appId,
    );

    if (existingWindow) {
      restoreWindow(existingWindow.id);
      return;
    }

    setWindows((currentWindows) => [
      ...currentWindows,
      {
        id: crypto.randomUUID(),
        appId: app.id,
        title: app.title,
        status: "open",
        zIndex: nextZIndex,
      },
    ]);
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function minimizeWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, status: "minimized" }
          : windowInstance,
      ),
    );
  }

  function closeWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.filter((windowInstance) => windowInstance.id !== windowId),
    );
  }

  function focusWindow(windowId: string) {
    const targetWindow = windows.find(
      (windowInstance) => windowInstance.id === windowId,
    );

    if (!targetWindow) return;

    if (targetWindow.zIndex === nextZIndex - 1) return; // Already focused

    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, zIndex: nextZIndex }
          : windowInstance,
      ),
    );
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  return (
    <>
      <Taskbar
        leftElements={<p>TsOS</p>}
        centerElements={apps
          .filter((app) => app.pinnedToTaskbar)
          .map((app) => {
            const appWindow = windows.find(
              (windowInstance) => windowInstance.appId === app.id,
            );

            return (
              <TaskbarApp
                key={app.id}
                title={app.title}
                icon={app.icon}
                isRunning={Boolean(appWindow)}
                isMinimized={appWindow?.status === "minimized"}
                onClick={() => launchApp(app.id)}
              />
            );
          })}
        rightElements={<span>{currentTime}</span>}
      />
      {windows.map((windowInstance) => {
        const app = apps.find((app) => app.id === windowInstance.appId);
        if (!app) return null;

        const AppComponent = app.component;
        return (
          <Window
            key={windowInstance.id}
            title={windowInstance.title}
            onClose={() => closeWindow(windowInstance.id)}
            onMinimize={() => minimizeWindow(windowInstance.id)}
            zIndex={windowInstance.zIndex}
            onFocus={() => focusWindow(windowInstance.id)}
            isMinimized={windowInstance.status === "minimized"}
          >
            <AppComponent />
          </Window>
        );
      })}
    </>
  );
}
