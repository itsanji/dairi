import { exchangeRateJob } from "./exchange.job";

// List of all jobs
const jobs = [exchangeRateJob];

// Function to initialize and start all jobs
export function startJobs() {
    console.log("Starting all jobs...");

    // Trigger initial run of jobs
    jobs.forEach(async (job, index) => {
        try {
            // Execute job immediately
            await job.trigger();
            console.log(`Job ${index + 1} started, Next time run is: ${job.nextRun()}`);
        } catch (error) {
            console.error(`Error running job ${index + 1}:`, error);
        }
    });
}

// Function to stop all jobs
export function stopJobs() {
    console.log("Stopping all jobs...");

    jobs.forEach((job, index) => {
        job.stop();
        console.log(`Job ${index + 1} stopped`);
    });
}
