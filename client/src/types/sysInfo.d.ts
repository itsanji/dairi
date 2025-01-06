export interface SysInfo {
    os: OS;
    cpuTemp: number;
    cpuUsage: string[];
    memoryUsage: MemoryUsage;
}

export interface MemoryUsage {
    total: number;
    used: number;
    free: number;
}

export interface OS {
    architechure: string;
    hostname: string;
    platform: string;
}
