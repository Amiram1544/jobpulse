import { useState } from "react";
import { createJob } from "./api";
import { useJobWebSocket } from "./useJobWebSocket";
import type { JobStatus } from "./types";

function StatusBadge({ status }: { status: JobStatus }) {
	const colors: Record<JobStatus, string> = {
		pending: "bg-gray-100 text-gray-700",
		running: "bg-blue-100 text-blue-700 animate-pulse",
		done: "bg-green-100 text-green-700",
		failed: "bg-red-100 text-red-700",
	};

	return (
		<span
			className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status]}`}
		>
			{status}
		</span>
	);
}

export default function App() {
	const [activeJobId, setActiveJobId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 🔥 THE LIVE CONNECTION: Hook activates only when we have a jobId
	const { job, isConnected } = useJobWebSocket(activeJobId);

	const handleCreateJob = async () => {
		setIsCreating(true);
		setError(null);
		try {
			const newJob = await createJob("Real-time Demo Job");
			setActiveJobId(newJob.id); // Triggers WebSocket connection
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsCreating(false);
		}
	};

	const handleReset = () => {
		setActiveJobId(null);
		setError(null);
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-black tracking-tight text-white">
						Job<span className="text-blue-500">Pulse</span>
					</h1>
					<p className="text-slate-400 text-sm">
						Django + Channels + Celery + React
					</p>
				</div>

				{/* Error Display */}
				{error && (
					<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
						{error}
					</div>
				)}

				{/* Active Job Dashboard */}
				{activeJobId && job ? (
					<div className="space-y-6">
						<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
							{/* Status Row */}
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
										Job ID
									</p>
									<p className="font-mono text-sm text-slate-300">
										{job.id.slice(0, 8)}...
									</p>
								</div>
								<StatusBadge status={job.status} />
							</div>

							{/* Progress Bar */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-slate-400">Progress</span>
									<span className="font-mono text-white">{job.progress}%</span>
								</div>
								<div className="h-3 bg-slate-800 rounded-full overflow-hidden">
									<div
										className={`h-full transition-all duration-500 ease-out rounded-full ${
											job.status === "failed"
												? "bg-red-500"
												: job.status === "done"
													? "bg-green-500"
													: "bg-blue-500"
										}`}
										style={{ width: `${job.progress}%` }}
									/>
								</div>
							</div>

							{/* Connection Indicator */}
							<div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800">
								<div
									className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
								/>
								<span className="text-slate-500">
									{isConnected ? "Live WebSocket Connected" : "Reconnecting..."}
								</span>
							</div>
						</div>

						{/* Done/Failed Actions */}
						{(job.status === "done" || job.status === "failed") && (
							<button
								onClick={handleReset}
								className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
							>
								Start New Job
							</button>
						)}
					</div>
				) : (
					/* Empty State / Create Button */
					<button
						onClick={handleCreateJob}
						disabled={isCreating}
						className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
					>
						{isCreating ? "Creating Job..." : "🚀 Start Background Job"}
					</button>
				)}
			</div>
		</div>
	);
}
