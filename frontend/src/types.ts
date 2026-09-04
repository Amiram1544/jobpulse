// This MUST match the payload shape from backend/jobs/tasks.py and consumers.py
export type JobStatus = 'pending' | 'running' | 'done' | 'failed';

export interface JobPayload {
    id: string;
    name?: string;      // Only present in snapshot
    status: JobStatus;
    progress: number;   // 0 to 100
    error?: string;     // Only present if failed
}

// The envelope structure Django Channels sends over the WebSocket
export interface WsMessage {
    type: 'job.snapshot' | 'job.update';
    payload: JobPayload;
}