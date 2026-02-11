// Agent Management Dashboard JavaScript
class AgentDashboard {
    constructor() {
        this.agents = [];
        this.cronJobs = [];
        this.selectedAgent = null;
        this.init();
    }

    async init() {
        await this.loadAgents();
        await this.loadCronJobs();
        this.renderDashboard();
    }

    async loadAgents() {
        try {
            // Simulate API call - replace with actual OpenClaw API
            const response = await this.executeCommand(['sessions', 'list', '--json']);
            if (response && response.sessions) {
                this.agents = response.sessions.map(session => this.parseAgent(session));
            }
        } catch (error) {
            console.error('Failed to load agents:', error);
            // Use mock data for demo
            this.agents = this.getMockAgents();
        }
    }

    async loadCronJobs() {
        try {
            const response = await this.executeCommand(['cron', 'list', '--json']);
            if (response && response.jobs) {
                this.cronJobs = response.jobs;
            }
        } catch (error) {
            console.error('Failed to load cron jobs:', error);
            this.cronJobs = this.getMockCronJobs();
        }
    }

    parseAgent(session) {
        const lastActivity = new Date(session.updatedAt);
        const hoursAgo = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
        
        let status = 'offline';
        if (hoursAgo < 1) status = 'active';
        else if (hoursAgo < 24) status = 'idle';
        
        return {
            id: session.key,
            name: this.getAgentName(session.displayName),
            purpose: this.getAgentPurpose(session.displayName),
            model: session.model || 'unknown',
            status: status,
            lastActivity: lastActivity,
            tokens: session.totalTokens || 0,
            cost: this.estimateCost(session.totalTokens || 0),
            channel: session.channel,
            session: session
        };
    }

    getAgentName(displayName) {
        if (displayName.includes('Daniel Keene')) return 'Troy (Main)';
        if (displayName.includes('g-health')) return 'Health Tracker';
        if (displayName.includes('boundaries-coffee')) return 'Coffee Operations';
        if (displayName.includes('developer-chat')) return 'Developer Assistant';
        if (displayName.includes('fitbod-knockoff')) return 'Fitness App Dev';
        if (displayName.includes('vivpatch-team')) return 'VivPatch Team';
        if (displayName.includes('Cron:')) return displayName.replace('Cron: ', '');
        return displayName.split(' ').slice(0, 2).join(' ') || 'Agent';
    }

    getAgentPurpose(displayName) {
        if (displayName.includes('Daniel Keene')) return 'Primary assistant and command center';
        if (displayName.includes('g-health')) return 'Fitness tracking and nutrition logging';
        if (displayName.includes('boundaries-coffee')) return 'Coffee shop operations and management';
        if (displayName.includes('developer-chat')) return 'Technical discussions and development';
        if (displayName.includes('fitbod-knockoff')) return 'Fitness application development';
        if (displayName.includes('vivpatch-team')) return 'Wellness patch brand development';
        if (displayName.includes('Cron:')) return 'Scheduled task automation';
        return 'General purpose assistant';
    }

    estimateCost(tokens) {
        // Rough cost estimation based on token usage
        return (tokens / 1000) * 0.01; // Very rough approximation
    }

    getAgentCalendar(agentId) {
        return this.cronJobs
            .filter(job => job.delivery && (job.delivery.to === agentId || job.agentId === 'main'))
            .map(job => ({
                name: job.name,
                schedule: job.schedule.expr,
                nextRun: new Date(job.state.nextRunAtMs),
                enabled: job.enabled
            }))
            .sort((a, b) => a.nextRun - b.nextRun)
            .slice(0, 3); // Show next 3 items
    }

    renderDashboard() {
        this.renderQuickStats();
        this.renderTokenAnalytics();
        this.renderAgentGrid();
        this.renderAgentSelector();
    }

    renderQuickStats() {
        const activeAgents = this.agents.filter(a => a.status === 'active').length;
        const pendingTasks = this.cronJobs.filter(j => j.enabled).length;
        const totalCost = this.agents.reduce((sum, agent) => sum + agent.cost, 0);
        const totalTokens = this.agents.reduce((sum, agent) => sum + agent.tokens, 0);
        
        // Calculate today's estimated tokens (rough approximation)
        const tokensToday = Math.round(totalTokens * 0.1); // Assume 10% used today
        const burnRate = Math.round(tokensToday / 24); // Tokens per hour

        document.getElementById('active-agents').textContent = activeAgents;
        document.getElementById('pending-tasks').textContent = pendingTasks;
        document.getElementById('daily-cost').textContent = `$${totalCost.toFixed(2)}`;
        document.getElementById('total-tokens').textContent = `${Math.round(totalTokens / 1000)}K`;
        document.getElementById('tokens-today').textContent = `${Math.round(tokensToday / 1000)}K`;
        document.getElementById('burn-rate').textContent = `${burnRate}K/hr`;
    }

    renderTokenAnalytics() {
        // Sort agents by token usage
        const sortedAgents = [...this.agents].sort((a, b) => b.tokens - a.tokens);
        
        // Render token leaderboard
        const leaderboard = document.getElementById('token-leaderboard');
        leaderboard.innerHTML = '';
        
        sortedAgents.slice(0, 5).forEach((agent, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            `;
            
            const percentage = (agent.tokens / sortedAgents[0].tokens * 100).toFixed(1);
            const costPerK = agent.tokens > 0 ? (agent.cost / (agent.tokens / 1000)).toFixed(3) : '0';
            
            item.innerHTML = `
                <div>
                    <div style="font-weight: 500;">${agent.name}</div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">$${costPerK}/1K tokens</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--primary-color);">${Math.round(agent.tokens / 1000)}K</div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">${percentage}%</div>
                </div>
            `;
            
            leaderboard.appendChild(item);
        });

        // Calculate analytics
        const totalTokens = this.agents.reduce((sum, agent) => sum + agent.tokens, 0);
        const totalCost = this.agents.reduce((sum, agent) => sum + agent.cost, 0);
        const avgTokensPerAgent = totalTokens / this.agents.length;
        const tokensPerDollar = totalCost > 0 ? totalTokens / totalCost : 0;
        
        // Find most efficient agent (highest tokens per dollar spent)
        const mostEfficient = this.agents.reduce((best, agent) => {
            if (agent.cost === 0) return best;
            const efficiency = agent.tokens / agent.cost;
            return efficiency > (best.tokens / best.cost || 0) ? agent : best;
        }, this.agents[0]);

        document.getElementById('avg-tokens-per-agent').textContent = `${Math.round(avgTokensPerAgent / 1000)}K`;
        document.getElementById('tokens-per-dollar').textContent = `${Math.round(tokensPerDollar / 1000)}K`;
        document.getElementById('most-efficient').textContent = mostEfficient ? mostEfficient.name : '--';

        // Generate recommendations
        this.renderTokenRecommendations(sortedAgents, totalCost);
    }

    renderTokenRecommendations(sortedAgents, totalCost) {
        const recommendations = [];
        
        // High-cost agents using expensive models
        const expensiveAgents = this.agents.filter(agent => 
            agent.model.includes('opus') && agent.tokens > 50000
        );
        if (expensiveAgents.length > 0) {
            recommendations.push(`Consider switching ${expensiveAgents[0].name} to Sonnet for routine tasks (could save ~$0.50/day)`);
        }

        // Inactive agents with high token usage
        const inactiveHighUsage = this.agents.filter(agent => 
            agent.status === 'offline' && agent.tokens > 25000
        );
        if (inactiveHighUsage.length > 0) {
            recommendations.push(`Archive ${inactiveHighUsage[0].name} to reduce context costs`);
        }

        // Overall cost optimization
        if (totalCost > 3) {
            recommendations.push('Your daily cost ($' + totalCost.toFixed(2) + ') is above optimal range. Consider consolidating similar agents.');
        } else {
            recommendations.push('✅ Token usage is well-optimized for your current agent fleet');
        }

        // High burn rate warning
        const activeTokens = this.agents.filter(a => a.status === 'active').reduce((sum, a) => sum + a.tokens, 0);
        if (activeTokens > 100000) {
            recommendations.push('⚠️ High active token usage detected - monitor for runaway conversations');
        }

        const container = document.getElementById('token-recommendations');
        container.innerHTML = recommendations.map(rec => `
            <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: rgba(255, 193, 7, 0.1); border-radius: 4px; font-size: 0.9rem;">
                ${rec}
            </div>
        `).join('');
    }

    renderAgentGrid() {
        const container = document.getElementById('agent-grid');
        container.innerHTML = '';

        this.agents.forEach(agent => {
            const card = this.createAgentCard(agent);
            container.appendChild(card);
        });
    }

    createAgentCard(agent) {
        const card = document.createElement('div');
        card.className = 'agent-card';
        
        const statusClass = `status-${agent.status}`;
        const statusIcon = {
            'active': '🟢',
            'idle': '🟡', 
            'offline': '🔴'
        }[agent.status] || '⚪';

        const calendar = this.getAgentCalendar(agent.id);
        const calendarHtml = calendar.length > 0 ? 
            `<div class="calendar-preview">
                <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">📅 Upcoming:</div>
                ${calendar.map(item => `
                    <div class="calendar-item">
                        <span>${item.name}</span>
                        <span class="calendar-time">${this.formatDate(item.nextRun)}</span>
                    </div>
                `).join('')}
            </div>` : 
            '<div class="calendar-preview"><div style="color: var(--text-muted); font-size: 0.85rem;">No scheduled tasks</div></div>';

        card.innerHTML = `
            <div class="agent-header">
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <div class="agent-purpose">${agent.purpose}</div>
                    <div class="status ${statusClass}">
                        <span class="status-dot"></span>
                        ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </div>
                </div>
                <div style="font-size: 1.5rem;">${statusIcon}</div>
            </div>
            
            <div class="agent-stats">
                <div class="stat">
                    <span class="stat-value">${Math.round(agent.tokens / 1000)}K</span>
                    <span class="stat-label">Tokens</span>
                </div>
                <div class="stat">
                    <span class="stat-value">$${agent.cost.toFixed(2)}</span>
                    <span class="stat-label">Cost</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${agent.model.split('-').pop()}</span>
                    <span class="stat-label">Model</span>
                </div>
            </div>
            
            ${calendarHtml}
            
            <div class="agent-actions">
                <button class="btn btn-sm btn-primary" onclick="assignTaskToAgent('${agent.id}')">
                    📋 Assign Task
                </button>
                <button class="btn btn-sm" onclick="messageAgent('${agent.id}')">
                    💬 Message
                </button>
                <button class="btn btn-sm" onclick="viewAgentDetails('${agent.id}')">
                    👁️ Details
                </button>
            </div>
        `;

        return card;
    }

    renderAgentSelector() {
        const container = document.getElementById('agent-selector');
        container.innerHTML = '';

        this.agents.forEach(agent => {
            const chip = document.createElement('div');
            chip.className = 'agent-chip';
            chip.textContent = agent.name;
            chip.onclick = () => this.toggleAgentSelection(chip, agent.id);
            chip.dataset.agentId = agent.id;
            container.appendChild(chip);
        });
    }

    toggleAgentSelection(chip, agentId) {
        chip.classList.toggle('selected');
        if (chip.classList.contains('selected')) {
            this.selectedAgent = agentId;
        } else {
            this.selectedAgent = null;
        }
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Tomorrow ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    async executeCommand(command) {
        // In a real implementation, this would make API calls to OpenClaw
        // For now, we'll use mock data
        return null;
    }

    getMockAgents() {
        return [
            {
                id: 'agent:main:main',
                name: 'Troy (Main)',
                purpose: 'Primary assistant and command center',
                model: 'claude-sonnet-4-20250514',
                status: 'active',
                lastActivity: new Date(),
                tokens: 22632,
                cost: 0.23,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5251868903',
                name: 'Health Tracker',
                purpose: 'Fitness tracking and nutrition logging',
                model: 'claude-sonnet-4-20250514',
                status: 'active',
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
                tokens: 89162,
                cost: 0.89,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5158435516',
                name: 'Coffee Operations',
                purpose: 'Boundaries Coffee operations and management',
                model: 'claude-opus-4-5',
                status: 'idle',
                lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
                tokens: 124278,
                cost: 1.24,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5194650963',
                name: 'Developer Assistant',
                purpose: 'Technical discussions and development',
                model: 'claude-sonnet-4-20250514',
                status: 'idle',
                lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
                tokens: 91395,
                cost: 0.91,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5269268988',
                name: 'Fitness App Dev',
                purpose: 'Fitness application development',
                model: 'claude-sonnet-4-20250514',
                status: 'offline',
                lastActivity: new Date(Date.now() - 72 * 60 * 60 * 1000),
                tokens: 25864,
                cost: 0.26,
                channel: 'telegram'
            }
        ];
    }

    getMockCronJobs() {
        return [
            {
                id: 'c3b46ca1-980f-4638-9d46-ce4407be6366',
                name: 'Daily Weigh-In Reminder',
                enabled: true,
                schedule: { expr: '30 6 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: Date.now() + 10 * 60 * 60 * 1000 }
            },
            {
                id: '61339f7a-cda6-43b2-8f0e-d9f5a48539e1',
                name: 'Lunch Logging Reminder',
                enabled: true,
                schedule: { expr: '0 12 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: Date.now() + 15 * 60 * 60 * 1000 }
            },
            {
                id: '46306457-97c0-4fde-b7b6-c89c2a843df4',
                name: 'Dinner Logging Reminder',
                enabled: true,
                schedule: { expr: '0 18 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: Date.now() + 21 * 60 * 60 * 1000 }
            }
        ];
    }
}

// Global functions for button actions
async function assignTask() {
    const selectedChips = document.querySelectorAll('.agent-chip.selected');
    const taskInput = document.getElementById('task-input');
    
    if (selectedChips.length === 0) {
        alert('Please select an agent first');
        return;
    }
    
    if (!taskInput.value.trim()) {
        alert('Please enter a task description');
        return;
    }
    
    for (const chip of selectedChips) {
        const agentId = chip.dataset.agentId;
        const agentName = chip.textContent;
        const task = taskInput.value.trim();
        
        try {
            await sendTaskToAgent(agentId, task);
            showNotification(`Task assigned to ${agentName}`, 'success');
        } catch (error) {
            showNotification(`Failed to assign task to ${agentName}`, 'error');
        }
    }
    
    // Clear form
    selectedChips.forEach(chip => chip.classList.remove('selected'));
    taskInput.value = '';
}

async function sendTaskToAgent(agentId, task) {
    try {
        // Use OpenClaw sessions send command
        const command = [
            'openclaw', 'sessions', 'send', 
            '--session-key', agentId,
            '--message', task
        ];
        
        // In a real implementation, this would execute the command
        console.log('Sending task:', { agentId, task });
        
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 1000);
        });
    } catch (error) {
        throw new Error('Failed to send task');
    }
}

function assignTaskToAgent(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (agent) {
        // Clear previous selections
        document.querySelectorAll('.agent-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        // Select this agent
        const chip = document.querySelector(`[data-agent-id="${agentId}"]`);
        if (chip) {
            chip.classList.add('selected');
            dashboard.selectedAgent = agentId;
        }
        
        // Focus on task input
        document.getElementById('task-input').focus();
        
        showNotification(`Selected ${agent.name} for task assignment`, 'info');
    }
}

async function messageAgent(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    const message = prompt(`Send message to ${agent.name}:`);
    
    if (message && message.trim()) {
        try {
            await sendTaskToAgent(agentId, message);
            showNotification(`Message sent to ${agent.name}`, 'success');
        } catch (error) {
            showNotification(`Failed to send message`, 'error');
        }
    }
}

function viewAgentDetails(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (agent) {
        const details = `
Agent: ${agent.name}
Purpose: ${agent.purpose}
Model: ${agent.model}
Status: ${agent.status}
Tokens: ${agent.tokens.toLocaleString()}
Cost: $${agent.cost.toFixed(3)}
Last Activity: ${agent.lastActivity.toLocaleString()}
Channel: ${agent.channel}
        `;
        alert(details);
    }
}

async function spawnNewAgent() {
    const name = prompt('Agent name:');
    const task = prompt('Initial task/purpose:');
    
    if (name && task) {
        try {
            // Use OpenClaw sessions spawn command
            console.log('Spawning new agent:', { name, task });
            showNotification(`Spawning new agent: ${name}`, 'info');
            
            // Refresh dashboard after spawn
            setTimeout(() => {
                dashboard.loadDashboard();
            }, 2000);
        } catch (error) {
            showNotification('Failed to spawn agent', 'error');
        }
    }
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function openTaskModal() {
    document.getElementById('task-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openProfileManager() {
    showNotification('Profile Manager coming soon!', 'info');
}

function openAnalytics() {
    showNotification('Analytics dashboard coming soon!', 'info');
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new AgentDashboard();
});

// Refresh dashboard every 30 seconds
setInterval(() => {
    if (dashboard) {
        dashboard.loadDashboard();
    }
}, 30000);