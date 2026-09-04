import { useEffect, useRef, useState, useCallback } from 'react';
import type { JobPayload, WsMessage } from './types';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function useJobWebSocket(jobId: string | null) {
    const [job, setJob] = useState<JobPayload | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs hold mutable values that DON'T trigger re-renders
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number>(0);
    const reconnectAttemptRef = useRef(0);

    const connect = useCallback(() => {
        if (!jobId) return;

        // Clean up any existing connection first
        if (wsRef.current) {
            wsRef.current.close();
        }

        const url = `${WS_BASE}/ws/jobs/${jobId}/`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] Connected');
            setIsConnected(true);
            reconnectAttemptRef.current = 0; // Reset backoff on success
        };

        ws.onmessage = (event) => {
            try {
                // 🔥 THIS IS THE BRIDGE: Parse Django's JSON into our TS contract
                const message: WsMessage = JSON.parse(event.data);

                if (message.type === 'job.snapshot' || message.type === 'job.update') {
                    setJob(message.payload);
                }
            } catch (err) {
                console.error('[WS] Failed to parse message:', err);
            }
        };

        ws.onclose = () => {
            console.log('[WS] Disconnected');
            setIsConnected(false);
            wsRef.current = null;

            // Exponential backoff reconnection (max 10 seconds)
            if (jobId) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
                reconnectAttemptRef.current += 1;
                console.log(`[WS] Reconnecting in ${delay}ms...`);

                reconnectTimeoutRef.current = window.setTimeout(connect, delay);
            }
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
            ws.close(); // Trigger onclose to start reconnection
        };
    }, [jobId]);

    // Start connection when jobId changes, cleanup on unmount
    useEffect(() => {
        connect();

        return () => {
            clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { job, isConnected };
}