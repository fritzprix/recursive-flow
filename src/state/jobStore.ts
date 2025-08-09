import type { JobContext } from "../types";

const jobs = new Map<string, JobContext>();

export const jobStore = {
    get(jobId: string): JobContext | undefined {
        return jobs.get(jobId);
    },
    set(job: JobContext) {
        jobs.set(job.id, job);
    },
    has(jobId: string): boolean {
        return jobs.has(jobId);
    },
    all(): JobContext[] {
        return Array.from(jobs.values());
    },
};
