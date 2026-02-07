// System Monitor for Mission Control Dashboard
// Real-time system metrics and health monitoring

import { ConvexHttpClient } from "convex/browser";

class SystemMonitor {
    constructor() {
        this.convex = new ConvexHttpClient(process.env.CONVEX_URL || "http://127.0.0.1:3210");
        this.metrics = {
            uptime: 0,
            memoryUsage: 0,
            diskSpace: 0,
            networkLatency: 0,
            activeProcesses: 0,
            lastActivity: Date.now()
        };
        
        this.startMonitoring();
    }
    
    async startMonitoring() {
        setInterval(async () => {
            await this.collectMetrics();
            await this.updateDashboard();
        }, 30000); // Update every 30 seconds
    }
    
    async collectMetrics() {
        try {
            // System uptime
            const uptime = await this.getSystemUptime();
            this.metrics.uptime = uptime;
            
            // Memory usage
            const memory = await this.getMemoryUsage();
            this.metrics.memoryUsage = memory;
            
            // Disk space
            const disk = await this.getDiskSpace();
            this.metrics.diskSpace = disk;
            
            // Network latency to OpenClaw services
            const latency = await this.getNetworkLatency();
            this.metrics.networkLatency = latency;
            
            // Active process count
            const processes = await this.getActiveProcesses();
            this.metrics.activeProcesses = processes;
            
            this.metrics.lastActivity = Date.now();
            
        } catch (error) {
            console.error('Failed to collect system metrics:', error);
        }
    }
    
    async getSystemUptime() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('uptime');
            const match = stdout.match(/up\s+(.+?),/);
            return match ? match[1].trim() : 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }
    
    async getMemoryUsage() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('vm_stat');
            const lines = stdout.split('\n');
            let totalPages = 0;
            let freePages = 0;
            
            lines.forEach(line => {
                if (line.includes('Pages free:')) {
                    freePages = parseInt(line.match(/\d+/)[0]);
                }
                if (line.includes('Pages active:')) {
                    totalPages += parseInt(line.match(/\d+/)[0]);
                }
                if (line.includes('Pages inactive:')) {
                    totalPages += parseInt(line.match(/\d+/)[0]);
                }
                if (line.includes('Pages wired down:')) {
                    totalPages += parseInt(line.match(/\d+/)[0]);
                }
            });
            
            const pageSize = 4096; // 4KB per page on macOS
            const usedMemory = (totalPages * pageSize) / (1024 * 1024 * 1024); // GB
            const freeMemory = (freePages * pageSize) / (1024 * 1024 * 1024); // GB
            
            return {
                used: Math.round(usedMemory * 100) / 100,
                free: Math.round(freeMemory * 100) / 100,
                total: Math.round((usedMemory + freeMemory) * 100) / 100,
                percentage: Math.round((usedMemory / (usedMemory + freeMemory)) * 100)
            };
        } catch (error) {
            return { used: 0, free: 0, total: 0, percentage: 0 };
        }
    }
    
    async getDiskSpace() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('df -h /');
            const lines = stdout.split('\n');
            const diskLine = lines[1].split(/\s+/);
            
            return {
                total: diskLine[1],
                used: diskLine[2],
                available: diskLine[3],
                percentage: parseInt(diskLine[4])
            };
        } catch (error) {
            return { total: 'Unknown', used: 'Unknown', available: 'Unknown', percentage: 0 };
        }
    }
    
    async getNetworkLatency() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('ping -c 1 127.0.0.1');
            const match = stdout.match(/time=(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    async getActiveProcesses() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('ps aux | grep -E "(openclaw|node|tmux)" | grep -v grep | wc -l');
            return parseInt(stdout.trim()) || 0;
        } catch (error) {
            return 0;
        }
    }
    
    async updateDashboard() {
        try {
            // Log system metrics to Convex for real-time dashboard
            await this.convex.mutation("activities:log", {
                category: "system",
                action: "metrics_update",
                description: "System health metrics collected",
                metadata: {
                    ...this.metrics,
                    type: "system_monitor",
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.warn('Failed to update dashboard with metrics:', error);
        }
    }
    
    getHealthStatus() {
        const memPercentage = this.metrics.memoryUsage.percentage || 0;
        const diskPercentage = this.metrics.diskSpace.percentage || 0;
        
        if (memPercentage > 90 || diskPercentage > 90) {
            return 'critical';
        } else if (memPercentage > 80 || diskPercentage > 80) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }
}

export default SystemMonitor;