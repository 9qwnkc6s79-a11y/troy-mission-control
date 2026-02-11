// Cron Manager JavaScript
class CronManager {
    constructor() {
        this.cronJobs = [];
        this.init();
    }

    async init() {
        await this.loadCronJobs();
        this.renderStats();
        this.renderTimeline();
    }

    async loadCronJobs() {
        try {
            // In real implementation, this would call OpenClaw API
            this.cronJobs = this.getMockCronJobs();
        } catch (error) {
            console.error('Failed to load cron jobs:', error);
            this.cronJobs = this.getMockCronJobs();
        }
    }

    renderStats() {
        const activeJobs = this.cronJobs.filter(job => job.enabled).length;
        const disabledJobs = this.cronJobs.filter(job => !job.enabled).length;
        const totalJobs = this.cronJobs.length;
        
        // Find next run time
        const nextRuns = this.cronJobs
            .filter(job => job.enabled && job.state.nextRunAtMs)
            .map(job => job.state.nextRunAtMs)
            .sort();
        
        const nextRun = nextRuns.length > 0 ? new Date(nextRuns[0]) : null;
        
        document.getElementById('active-jobs').textContent = activeJobs;
        document.getElementById('disabled-jobs').textContent = disabledJobs;
        document.getElementById('total-jobs').textContent = totalJobs;
        document.getElementById('next-run').textContent = nextRun ? 
            nextRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    }

    renderTimeline() {
        const container = document.getElementById('timeline-container');
        container.innerHTML = '';

        // Group jobs by day for next 7 days
        const timeline = this.buildTimeline();
        
        timeline.forEach(day => {
            const dayElement = this.createTimelineDay(day);
            container.appendChild(dayElement);
        });
    }

    buildTimeline() {
        const timeline = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayEvents = this.getEventsForDay(date);
            
            timeline.push({
                date: new Date(date),
                isToday: i === 0,
                isTomorrow: i === 1,
                events: dayEvents
            });
        }

        return timeline;
    }

    getEventsForDay(date) {
        const events = [];
        
        this.cronJobs.forEach(job => {
            const nextRun = new Date(job.state.nextRunAtMs);
            
            // Check if this job runs on this day
            if (this.jobRunsOnDay(job, date)) {
                const scheduleTime = this.parseScheduleTime(job.schedule.expr);
                const eventTime = new Date(date);
                eventTime.setHours(scheduleTime.hour, scheduleTime.minute, 0, 0);
                
                events.push({
                    id: job.id,
                    name: job.name,
                    time: eventTime,
                    description: this.getJobDescription(job),
                    enabled: job.enabled,
                    job: job
                });
            }
        });

        return events.sort((a, b) => a.time - b.time);
    }

    jobRunsOnDay(job, date) {
        const cron = job.schedule.expr.split(' ');
        if (cron.length !== 5) return false;
        
        const [minute, hour, day, month, weekday] = cron;
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        const monthOfYear = date.getMonth() + 1;
        
        // Check weekday
        if (weekday !== '*' && parseInt(weekday) !== dayOfWeek) {
            return false;
        }
        
        // Check day of month
        if (day !== '*' && parseInt(day) !== dayOfMonth) {
            return false;
        }
        
        // Check month
        if (month !== '*' && parseInt(month) !== monthOfYear) {
            return false;
        }
        
        return true;
    }

    parseScheduleTime(cronExpr) {
        const parts = cronExpr.split(' ');
        return {
            minute: parseInt(parts[0]) || 0,
            hour: parseInt(parts[1]) || 0
        };
    }

    getJobDescription(job) {
        if (job.payload && job.payload.message) {
            return job.payload.message.substring(0, 100) + (job.payload.message.length > 100 ? '...' : '');
        }
        return 'Scheduled task';
    }

    createTimelineDay(day) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'timeline-day';
        
        let dayLabel = day.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
        
        if (day.isToday) dayLabel += ' (Today)';
        if (day.isTomorrow) dayLabel += ' (Tomorrow)';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'timeline-header';
        headerDiv.textContent = dayLabel;
        
        const eventsDiv = document.createElement('div');
        eventsDiv.className = 'timeline-events';
        
        if (day.events.length === 0) {
            eventsDiv.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">No scheduled tasks</div>';
        } else {
            day.events.forEach(event => {
                const eventElement = this.createTimelineEvent(event);
                eventsDiv.appendChild(eventElement);
            });
        }
        
        dayDiv.appendChild(headerDiv);
        dayDiv.appendChild(eventsDiv);
        
        return dayDiv;
    }

    createTimelineEvent(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = `timeline-event ${event.enabled ? '' : 'disabled'}`;
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'event-time';
        timeSpan.textContent = event.time.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'event-content';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'event-title';
        titleDiv.textContent = event.name;
        
        const descDiv = document.createElement('div');
        descDiv.className = 'event-description';
        descDiv.textContent = event.description;
        
        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(descDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'event-actions';
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `btn btn-sm ${event.enabled ? 'btn-warning' : 'btn-success'}`;
        toggleBtn.textContent = event.enabled ? '⏸️ Pause' : '▶️ Enable';
        toggleBtn.onclick = () => this.toggleJob(event.id);
        
        const runBtn = document.createElement('button');
        runBtn.className = 'btn btn-sm btn-primary';
        runBtn.textContent = '▶️ Run Now';
        runBtn.onclick = () => this.runJobNow(event.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.onclick = () => this.deleteJob(event.id);
        
        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(runBtn);
        actionsDiv.appendChild(deleteBtn);
        
        eventDiv.appendChild(timeSpan);
        eventDiv.appendChild(contentDiv);
        eventDiv.appendChild(actionsDiv);
        
        return eventDiv;
    }

    async toggleJob(jobId) {
        try {
            const job = this.cronJobs.find(j => j.id === jobId);
            if (job) {
                job.enabled = !job.enabled;
                showNotification(`Job ${job.enabled ? 'enabled' : 'disabled'}`, 'success');
                this.renderStats();
                this.renderTimeline();
            }
        } catch (error) {
            showNotification('Failed to toggle job', 'error');
        }
    }

    async runJobNow(jobId) {
        try {
            const job = this.cronJobs.find(j => j.id === jobId);
            if (job) {
                showNotification(`Running "${job.name}" now...`, 'info');
                // In real implementation: openclaw cron run --job-id jobId
            }
        } catch (error) {
            showNotification('Failed to run job', 'error');
        }
    }

    async deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            try {
                this.cronJobs = this.cronJobs.filter(j => j.id !== jobId);
                showNotification('Job deleted', 'success');
                this.renderStats();
                this.renderTimeline();
            } catch (error) {
                showNotification('Failed to delete job', 'error');
            }
        }
    }

    getMockCronJobs() {
        return [
            {
                id: 'c3b46ca1-980f-4638-9d46-ce4407be6366',
                name: 'Daily Weigh-In Reminder',
                enabled: true,
                schedule: { expr: '30 6 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: this.getNextRunTime(6, 30) },
                payload: { 
                    message: 'Good morning! Time for your daily weigh-in on the RENPHO scale. Message me your weight so I can track your progress toward the 185 lb goal.' 
                }
            },
            {
                id: '61339f7a-cda6-43b2-8f0e-d9f5a48539e1',
                name: 'Lunch Logging Reminder',
                enabled: true,
                schedule: { expr: '0 12 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: this.getNextRunTime(12, 0) },
                payload: { 
                    message: 'Lunch time! What are you having for lunch today? Message me the items and I will break down the macros.' 
                }
            },
            {
                id: '46306457-97c0-4fde-b7b6-c89c2a843df4',
                name: 'Dinner Logging Reminder',
                enabled: true,
                schedule: { expr: '0 18 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: this.getNextRunTime(18, 0) },
                payload: { 
                    message: 'Dinner time! What\'s on the menu tonight? Share your dinner items and I\'ll calculate the macros.' 
                }
            },
            {
                id: 'de765e96-c608-4418-b38c-e3cd1f39a9f7',
                name: 'VivPatch Domain Registration',
                enabled: true,
                schedule: { expr: '0 9 1 2 *' },
                delivery: { to: 'main' },
                state: { nextRunAtMs: new Date('2026-02-01T09:00:00').getTime() },
                payload: { 
                    message: 'Reminder: Register vivpatch.com domain today on Cloudflare using personal Gmail account.' 
                }
            },
            {
                id: 'sample-weekly',
                name: 'Weekly Business Review',
                enabled: false,
                schedule: { expr: '0 9 * * 1' },
                delivery: { to: '-5158435516' },
                state: { nextRunAtMs: this.getNextRunTime(9, 0, 1) },
                payload: { 
                    message: 'Time for the weekly Boundaries Coffee business review. Check sales, staffing, and operations.' 
                }
            }
        ];
    }

    getNextRunTime(hour, minute, weekday = null) {
        const now = new Date();
        const next = new Date();
        next.setHours(hour, minute, 0, 0);
        
        if (weekday !== null) {
            // Weekly job
            const daysUntilNext = (weekday + 7 - next.getDay()) % 7;
            next.setDate(next.getDate() + daysUntilNext);
        } else {
            // Daily job
            if (next <= now) {
                next.setDate(next.getDate() + 1);
            }
        }
        
        return next.getTime();
    }
}

// Global functions
function loadCronManager() {
    if (window.cronManager) {
        window.cronManager.init();
    } else {
        window.cronManager = new CronManager();
    }
}

function createQuickReminder(type) {
    const modal = document.getElementById('quick-reminder-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('quick-message');
    
    const templates = {
        health: {
            title: 'Health Reminder',
            message: 'Time to log your workout, meals, or take your vitamins!'
        },
        business: {
            title: 'Business Task',
            message: 'Check Boundaries Coffee sales, respond to team messages, or review operations.'
        },
        meeting: {
            title: 'Meeting Reminder',
            message: 'Upcoming meeting in 15 minutes. Review agenda and prepare materials.'
        },
        custom: {
            title: 'Custom Reminder',
            message: ''
        }
    };
    
    const template = templates[type] || templates.custom;
    title.textContent = template.title;
    message.value = template.message;
    
    modal.classList.add('active');
    message.focus();
}

function submitQuickReminder(event) {
    event.preventDefault();
    
    const message = document.getElementById('quick-message').value;
    const when = document.getElementById('quick-when').value;
    
    if (!message.trim()) {
        alert('Please enter a reminder message');
        return;
    }
    
    // Calculate reminder time
    let reminderTime = new Date();
    
    switch (when) {
        case '30min':
            reminderTime.setMinutes(reminderTime.getMinutes() + 30);
            break;
        case '1hour':
            reminderTime.setHours(reminderTime.getHours() + 1);
            break;
        case 'today':
            reminderTime.setHours(18, 0, 0, 0);
            if (reminderTime <= new Date()) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            break;
        case 'tomorrow':
            reminderTime.setDate(reminderTime.getDate() + 1);
            reminderTime.setHours(9, 0, 0, 0);
            break;
        case 'custom':
            const customDateTime = document.getElementById('custom-datetime').value;
            if (!customDateTime) {
                alert('Please select a custom date and time');
                return;
            }
            reminderTime = new Date(customDateTime);
            break;
    }
    
    console.log('Creating reminder:', { message, when, reminderTime });
    showNotification(`Reminder set for ${reminderTime.toLocaleString()}`, 'success');
    
    closeModal('quick-reminder-modal');
    
    // Reset form
    document.getElementById('quick-message').value = '';
    document.getElementById('quick-when').value = '30min';
}

function showCronForm() {
    document.getElementById('cron-form').style.display = 'block';
    document.getElementById('job-name').focus();
}

function hideCronForm() {
    document.getElementById('cron-form').style.display = 'none';
}

function updateScheduleFields() {
    const type = document.getElementById('schedule-type').value;
    const timeField = document.getElementById('time-field');
    const dayField = document.getElementById('day-field');
    const cronField = document.getElementById('cron-field');
    
    timeField.style.display = 'block';
    dayField.style.display = type === 'weekly' ? 'block' : 'none';
    cronField.style.display = type === 'custom' ? 'block' : 'none';
    
    updateCronPreview();
}

function updateCronPreview() {
    const type = document.getElementById('schedule-type').value;
    const time = document.getElementById('schedule-time').value;
    const day = document.getElementById('schedule-day').value;
    const customCron = document.getElementById('cron-expression').value;
    
    let cronExpression = '';
    
    if (type === 'custom') {
        cronExpression = customCron || '0 9 * * *';
    } else {
        const [hours, minutes] = time.split(':').map(n => parseInt(n));
        
        if (type === 'daily') {
            cronExpression = `${minutes} ${hours} * * *`;
        } else if (type === 'weekly') {
            cronExpression = `${minutes} ${hours} * * ${day}`;
        }
    }
    
    document.getElementById('preview-expression').textContent = cronExpression;
}

function createCronJob(event) {
    event.preventDefault();
    
    const name = document.getElementById('job-name').value;
    const message = document.getElementById('job-message').value;
    const target = document.getElementById('job-target').value;
    const priority = document.getElementById('job-priority').value;
    const cronExpression = document.getElementById('preview-expression').textContent;
    
    console.log('Creating cron job:', {
        name,
        message,
        target,
        priority,
        cronExpression
    });
    
    showNotification(`Scheduled task "${name}" created successfully!`, 'success');
    hideCronForm();
    
    // Reset form
    document.getElementById('job-name').value = '';
    document.getElementById('job-message').value = '';
    
    // Refresh timeline
    loadCronManager();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle custom time field visibility
document.addEventListener('DOMContentLoaded', function() {
    const quickWhen = document.getElementById('quick-when');
    const customTime = document.getElementById('custom-time');
    
    quickWhen.addEventListener('change', function() {
        customTime.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    // Set default datetime to tomorrow morning
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    document.getElementById('custom-datetime').value = tomorrow.toISOString().slice(0, 16);
    
    // Update cron preview on time changes
    document.getElementById('schedule-time').addEventListener('change', updateCronPreview);
    document.getElementById('schedule-day').addEventListener('change', updateCronPreview);
    document.getElementById('cron-expression').addEventListener('input', updateCronPreview);
});