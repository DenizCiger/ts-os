"use client";

import { Taskbar, TaskbarApp } from "@/components/taskbar";
import { Window } from "@/components/window";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString(),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <Taskbar
        leftElements={<p>TsOS</p>}
        centerElements={
          <>
            <TaskbarApp title="Notepad" />
            <TaskbarApp title="Explorer" />
          </>
        }
        rightElements={<span>{currentTime}</span>}
      />
      <Window title="Notepad">
        <textarea
          className="w-full h-full bg-transparent text-gray-300 outline-none resize-none"
          placeholder="Type here..."
        />
      </Window>
    </>
  );
}
