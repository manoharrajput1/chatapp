'use client';
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";

export default function Home() {
  // Auth state
  const [authMode, setAuthMode] = useState<'login'|'register'>('login');
  const [authContact, setAuthContact] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // Chat state
  const [myNumber, setMyNumber] = useState("");
  const [peerNumber, setPeerNumber] = useState("");
  const [messages, setMessages] = useState<{ from: string; to: string; text: string; timestamp: number }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    try {
      const res = await axios.post(endpoint, { contact: authContact, password: authPassword });
      if (res.data && res.data.success) {
        setLoggedIn(true);
        setMyNumber(authContact);
      } else {
        setAuthError(res.data?.error || 'This Error');
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Error');
    }
  };

  // Fetch messages
  useEffect(() => {
    if (myNumber && peerNumber) {
      const fetchMessages = async () => {
        const res = await fetch(`/api/chat?from=${myNumber}&to=${peerNumber}`);
        const data = await res.json();
        setMessages(data.messages || []);
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [myNumber, peerNumber]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !myNumber || !peerNumber) return;
    setLoading(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myNumber, to: peerNumber, text: input }),
    });
    setInput("");
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-xs bg-white dark:bg-black/40 rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-center">{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <input
              className="border rounded px-2 py-1"
              placeholder="Contact number"
              value={authContact}
              onChange={e => setAuthContact(e.target.value)}
              required
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Password"
              type="password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              required
            />
            {authError && <div className="text-red-500 text-sm">{authError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded mt-2">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <button
            className="mt-4 text-blue-600 underline text-sm w-full"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? 'No account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    );
  }

  // Chat UI (only if logged in)
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
        <div className="flex w-full justify-end mb-2">
          <button
            className="text-sm text-blue-600 underline px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
            onClick={() => {
              setLoggedIn(false);
              setAuthContact("");
              setAuthPassword("");
              setMyNumber("");
              setPeerNumber("");
              setMessages([]);
              setInput("");
            }}
          >
            Logout
          </button>
        </div>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        {/* Chat UI */}
        <div className="w-full bg-white dark:bg-black/40 rounded-xl shadow p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Your contact number"
              value={myNumber}
              onChange={e => setMyNumber(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Peer contact number"
              value={peerNumber}
              onChange={e => setPeerNumber(e.target.value)}
            />
          </div>
          <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded p-2 mb-2">
            {messages.length === 0 && <div className="text-center text-gray-400">No messages yet.</div>}
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 flex ${msg.from === myNumber ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-1 rounded-lg max-w-[70%] text-sm ${msg.from === myNumber ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"}`}>
                  <span>{msg.text}</span>
                  <div className="text-[10px] opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!myNumber || !peerNumber}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
              disabled={loading || !input.trim() || !myNumber || !peerNumber}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
