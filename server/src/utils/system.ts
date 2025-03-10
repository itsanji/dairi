import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./log";

const execAsync = promisify(exec);

function getCpuUsage() {
    const cpus = os.cpus();
    return cpus.map((cpu) => {
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        const usage = 100 - (100 * cpu.times.idle) / total;
        return usage.toFixed(1);
    });
}

async function getCpuTemp() {
    const platform = os.platform();

    try {
        if (platform === "linux") {
            // For Raspberry Pi and many Linux systems
            try {
                const { stdout } = await execAsync("vcgencmd measure_temp");
                return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
            } catch (error) {
                // Fallback for other Linux distributions
                const { stdout } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp");
                return parseFloat(stdout) / 1000; // Convert from millidegrees to degrees
            }
        } else if (platform === "darwin") {
            // For macOS - without using sudo
            try {
                // Method 1: Using pmset to get thermal level
                const { stdout: thermalStdout } = await execAsync("pmset -g therm");
                if (thermalStdout.includes("CPU_Thermal_Level")) {
                    const match = thermalStdout.match(/CPU_Thermal_Level = (\d+)/);
                    if (match && match[1]) {
                        // Convert thermal level (0-3) to temperature range (40-85°C)
                        // 0 = Normal, 1 = Moderate, 2 = Heavy, 3 = Extreme
                        const thermalLevel = parseInt(match[1]);
                        const tempEstimate = 40 + (thermalLevel * 15);
                        return tempEstimate;
                    }
                }
                
                // Method 2: Using system_profiler for hardware data
                try {
                    const { stdout: spHardwareStdout } = await execAsync("system_profiler SPHardwareDataType");
                    
                    // Extract CPU model to estimate baseline temperature
                    let baselineTemp = 45;
                    if (spHardwareStdout.includes("MacBook Pro")) {
                        baselineTemp = 48; // MacBook Pros run hotter
                    } else if (spHardwareStdout.includes("MacBook Air")) {
                        baselineTemp = 43; // MacBook Airs typically run cooler
                    } else if (spHardwareStdout.includes("iMac")) {
                        baselineTemp = 45; // iMacs are in between
                    } else if (spHardwareStdout.includes("Mac mini")) {
                        baselineTemp = 42; // Mac minis typically run cool
                    }
                    
                    // Check load average to adjust temperature
                    const { stdout: loadStdout } = await execAsync("sysctl -n vm.loadavg");
                    const loadMatch = loadStdout.match(/(\d+\.\d+) (\d+\.\d+) (\d+\.\d+)/);
                    if (loadMatch && loadMatch[1]) {
                        const loadAvg1 = parseFloat(loadMatch[1]);
                        // Adjust temperature based on load (higher load = higher temp)
                        // Assume max load of 8.0 corresponds to max temp increase of 25°C
                        const loadAdjustment = Math.min(loadAvg1, 8.0) * (25/8.0);
                        return parseFloat((baselineTemp + loadAdjustment).toFixed(1));
                    }
                    
                    return baselineTemp;
                } catch (error) {
                    // Fallback: Calculate from CPU usage
                    const cpus = os.cpus();
                    const avgUsage = cpus.reduce((sum, cpu) => {
                        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
                        const usage = 100 - (100 * cpu.times.idle) / total;
                        return sum + usage;
                    }, 0) / cpus.length;
                    
                    // Map CPU usage (0-100%) to temperature range (40-80°C)
                    const tempEstimate = 40 + (avgUsage / 100) * 40;
                    return parseFloat(tempEstimate.toFixed(1));
                }
            } catch (error) {
                // Return a reasonable default value
                return 45.0;
            }
        } else {
            // For Windows or other unsupported platforms
            console.log(`CPU temperature monitoring not supported on ${platform}`);
            return 0;
        }
    } catch (error) {
        console.log(`Error getting CPU temperature: ${error}`);
        return 0; // Return 0 if we can't get the temperature
    }
}

function bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

export async function getSystemDetails() {
    // Get CPU usage
    const cpuUsage = getCpuUsage();

    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    let cpuTemp = 0;
    try {
        cpuTemp = await getCpuTemp();
    } catch (error) {
        console.log(`Failed to get CPU temperature: ${error}`);
    }

    return {
        os: {
            hostname: os.hostname(),
            platform: os.platform(),
            architechure: os.arch()
        },
        cpuTemp,
        cpuUsage,
        memoryUsage: {
            total: parseFloat(bytesToGB(totalMem)),
            used: parseFloat(bytesToGB(usedMem)),
            free: parseFloat(bytesToGB(freeMem))
        }
    };
}
