/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Home from './components/Home';
import Room from './components/Room';

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const id = path.startsWith('/') ? path.slice(1) : null;
    if (id && id.length > 0) {
      setRoomId(id);
    } else {
      setRoomId(null);
    }

    const handlePopState = () => {
      const newPath = window.location.pathname;
      const newId = newPath.startsWith('/') ? newPath.slice(1) : null;
      setRoomId(newId && newId.length > 0 ? newId : null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoom = (id: string) => {
    window.history.pushState({}, '', `/${id}`);
    setRoomId(id);
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setRoomId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {roomId ? (
        <Room roomId={roomId} onExit={navigateToHome} />
      ) : (
        <Home onRoomCreated={navigateToRoom} />
      )}
    </div>
  );
}
