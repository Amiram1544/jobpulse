import type { JobPayload } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function createJob(name: string): Promise<JobPayload> {
    const response = await fetch(`${API_BASE}/api/jobs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create job: ${response.status}`);
    }

    return response.json();
}