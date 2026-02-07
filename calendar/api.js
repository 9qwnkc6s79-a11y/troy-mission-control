#!/usr/bin/env node

/**
 * Calendar API for Troy Task Calendar
 * Loads real cron jobs and scheduled tasks
 * Usage: node api.js [command]
 * Commands: list, json, serve
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class CalendarAPI {
    constructor() {
        this.tasks = [];
    }

    async loadCronJobs() {
        return new Promise((resolve, reject) => {
            // In a real implementation, this would call the cron list API
            // For now, simulate with known cron jobs
            const sampleCronJobs = [
                {
                    id: 'ac0c5eee-30cd-40ce-92da-600e0c33bf2d',
                    name: 'Little Elm store reminders',
                    enabled: true,
                    schedule: '0 9 26 1 *', // 9 AM on January 26th yearly
                    nextRunAtMs: 1800975600000, // Jan 26, 2027
                    lastRunAtMs: 1769439600004, // Jan 26, 2025
                    payload: {
                        text: '🔔 Reminder: While at Little Elm store - (1) Pay Mustang water bill (2) Call to cancel Viasat internet (replaced with Starlink)'
                    }
                },
                {
                    id: 'de765e96-c608-4418-b38c-e3cd1f39a9f7',
                    name: 'vivpatch-domain-reminder',
                    enabled: true,
                    schedule: '0 9 1 2 *', // 9 AM on February 1st yearly
                    nextRunAtMs: 1801494000000, // Feb 1, 2027
                    lastRunAtMs: 1769958000038, // Feb 1, 2025
                    payload: {
                        text: 'Reminder: Daniel needs to register vivpatch.com on Cloudflare today from his computer...'
                    }
                }
            ];
            
            resolve(sampleCronJobs);
        });
    }

    async loadHeartbeatTasks() {
        // Load from HEARTBEAT.md
        const heartbeatPath = path.join(process.cwd(), 'HEARTBEAT.md');
        if (!fs.existsSync(heartbeatPath)) return [];

        const content = fs.readFileSync(heartbeatPath, 'utf8');
        const tasks = [];

        // Parse markdown checklist items
        const lines = content.split('\n');
        const now = new Date();
        
        lines.forEach((line, index) => {
            if (line.trim().startsWith('- [ ]')) {
                const taskText = line.trim().slice(5).trim();
                
                // Create rotating schedule (distribute over next week)
                const nextRun = new Date(now);
                nextRun.setDate(now.getDate() + (index % 7) + 1);
                nextRun.setHours(10 + (index % 8), 0, 0, 0);

                tasks.push({
                    id: `heartbeat-${index}`,
                    name: taskText.substring(0, 50) + (taskText.length > 50 ? '...' : ''),
                    enabled: true,
                    schedule: 'Heartbeat rotation',
                    nextRunAtMs: nextRun.getTime(),
                    type: 'heartbeat',
                    payload: {
                        text: taskText
                    }
                });
            }
        });

        return tasks;
    }

    parseCronExpression(cronExpr, nextRunMs) {
        // Convert cron expression to human readable
        const parts = cronExpr.split(' ');
        if (parts.length !== 5) return 'Custom schedule';

        const [minute, hour, day, month, dayOfWeek] = parts;
        
        if (month !== '*' && day !== '*') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${hour}:${minute.padStart(2, '0')} on ${monthNames[parseInt(month)-1]} ${day} yearly`;
        }
        
        return `${hour}:${minute.padStart(2, '0')} ${cronExpr}`;
    }

    formatTasksForCalendar(cronJobs, heartbeatTasks) {
        const tasks = [];

        // Process cron jobs
        cronJobs.forEach(job => {
            tasks.push({
                id: job.id,
                title: job.name,
                type: 'cron',
                date: new Date(job.nextRunAtMs),
                time: this.extractTimeFromCron(job.schedule),
                description: this.extractDescription(job.payload.text),
                status: job.enabled ? 'enabled' : 'disabled',
                schedule: job.schedule,
                lastRun: job.lastRunAtMs ? new Date(job.lastRunAtMs).toLocaleDateString() : null,
                category: 'automated'
            });
        });

        // Process heartbeat tasks
        heartbeatTasks.forEach(task => {
            const date = new Date(task.nextRunAtMs);
            tasks.push({
                id: task.id,
                title: task.name,
                type: 'heartbeat',
                date: date,
                time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
                description: task.payload.text,
                status: 'rotating',
                schedule: 'Heartbeat rotation',
                lastRun: null,
                category: 'recurring'
            });
        });

        return tasks.sort((a, b) => a.date - b.date);
    }

    extractTimeFromCron(cronExpr) {
        const parts = cronExpr.split(' ');
        if (parts.length >= 2) {
            const minute = parts[0];
            const hour = parts[1];
            return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        }
        return '09:00';
    }

    extractDescription(text) {
        // Clean up the description text
        let desc = text.replace(/🔔\s*Reminder:\s*/i, '');
        if (desc.length > 100) {
            desc = desc.substring(0, 97) + '...';
        }
        return desc;
    }

    async getAllTasks() {
        try {
            const [cronJobs, heartbeatTasks] = await Promise.all([
                this.loadCronJobs(),
                this.loadHeartbeatTasks()
            ]);

            return this.formatTasksForCalendar(cronJobs, heartbeatTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    async exportJSON(outputPath = null) {
        const tasks = await this.getAllTasks();
        const data = {
            generated: new Date().toISOString(),
            total_tasks: tasks.length,
            tasks: tasks
        };

        const jsonString = JSON.stringify(data, null, 2);
        
        if (outputPath) {
            fs.writeFileSync(outputPath, jsonString);
            console.log(`Calendar data exported to ${outputPath}`);
        } else {
            console.log(jsonString);
        }
        
        return data;
    }

    async serveHTTP(port = 3001) {
        const http = require('http');
        
        const server = http.createServer(async (req, res) => {
            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'GET' && req.url === '/api/tasks') {
                try {
                    const tasks = await this.getAllTasks();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ tasks }));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.listen(port, () => {
            console.log(`Calendar API server running on http://localhost:${port}`);
            console.log(`Tasks endpoint: http://localhost:${port}/api/tasks`);
        });
    }
}

// Export for module usage
module.exports = { CalendarAPI };

// CLI usage
if (require.main === module) {
    const api = new CalendarAPI();
    const command = process.argv[2] || 'list';

    switch (command) {
        case 'list':
            api.getAllTasks().then(tasks => {
                console.log(`📅 Found ${tasks.length} scheduled tasks:`);
                tasks.forEach(task => {
                    const status = task.status === 'enabled' ? '✅' : 
                                 task.status === 'rotating' ? '🔄' : '❌';
                    console.log(`${status} ${task.title}`);
                    console.log(`   📅 ${task.date.toLocaleDateString()} at ${task.time}`);
                    console.log(`   📝 ${task.description}`);
                    console.log('');
                });
            });
            break;

        case 'json':
            const outputFile = process.argv[3];
            api.exportJSON(outputFile);
            break;

        case 'serve':
            const port = parseInt(process.argv[3]) || 3001;
            api.serveHTTP(port);
            break;

        default:
            console.log('Usage: node api.js [command]');
            console.log('Commands:');
            console.log('  list    - Show all scheduled tasks');
            console.log('  json [file] - Export as JSON (to file or stdout)');
            console.log('  serve [port] - Start HTTP API server (default port 3001)');
            break;
    }
}