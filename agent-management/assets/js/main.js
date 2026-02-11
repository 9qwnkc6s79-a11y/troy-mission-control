/* Agent Management System - Main JavaScript */

class AgentManager {
  constructor() {
    this.agents = [];
    this.cronJobs = [];
    this.wsConnection = null;
    this.refreshInterval = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.initializeWebSocket();
    await this.loadData();
    this.startAutoRefresh();
  }

  setupEventListeners() {
    // Modal handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
      if (e.target.classList.contains('modal-close')) {
        this.closeModal(e.target.closest('.modal'));
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Theme toggle (if implemented)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
  }

  // WebSocket for real-time updates
  initializeWebSocket() {
    try {
      // In a real implementation, this would connect to OpenClaw's WebSocket
      // For now, we'll simulate with periodic polling
      console.log('WebSocket connection initialized (simulated)');
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to polling');
    }
  }

  // Data loading and management
  async loadData() {
    try {
      await Promise.all([
        this.loadAgents(),
        this.loadCronJobs(),
        this.loadMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      this.showNotification('Failed to load data', 'error');
    }
  }

  async loadAgents() {
    // Simulate OpenClaw API call
    try {
      // In real implementation: const response = await fetch('/api/agents');
      this.agents = this.getMockAgents();
      this.renderAgents();
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  async loadCronJobs() {
    // Simulate OpenClaw cron API call
    try {
      // In real implementation: const response = await fetch('/api/cron/jobs');
      this.cronJobs = this.getMockCronJobs();
      this.renderCronJobs();
    } catch (error) {
      console.error('Failed to load cron jobs:', error);
    }
  }

  async loadMetrics() {
    // Load cost and performance metrics
    try {
      const metrics = this.getMockMetrics();
      this.renderMetrics(metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  // Mock data generators (replace with real API calls)
  getMockAgents() {
    return [
      {
        id: 'agent-main',
        name: 'Main Agent',
        status: 'active',
        model: 'claude-sonnet-4',
        tokensUsed: 45230,
        costToday: 2.45,
        responseTime: 1.2,
        lastActivity: Date.now() - 300000,
        soul: 'Primary assistant agent',
        memory: '2.3MB',
        sessions: 3
      },
      {
        id: 'agent-health',
        name: 'Health Agent',
        status: 'idle',
        model: 'claude-haiku',
        tokensUsed: 12450,
        costToday: 0.65,
        responseTime: 0.8,
        lastActivity: Date.now() - 1800000,
        soul: 'Health and wellness specialist',
        memory: '890KB',
        sessions: 1
      },
      {
        id: 'agent-business',
        name: 'Business Agent',
        status: 'active',
        model: 'claude-sonnet-4',
        tokensUsed: 28930,
        costToday: 1.85,
        responseTime: 1.5,
        lastActivity: Date.now() - 120000,
        soul: 'Business operations and strategy',
        memory: '1.8MB',
        sessions: 2
      },
      {
        id: 'agent-dev',
        name: 'Development Agent',
        status: 'active',
        model: 'claude-sonnet-4',
        tokensUsed: 67840,
        costToday: 3.25,
        responseTime: 2.1,
        lastActivity: Date.now() - 60000,
        soul: 'Software development and DevOps',
        memory: '4.2MB',
        sessions: 4
      },
      {
        id: 'agent-content',
        name: 'Content Agent',
        status: 'idle',
        model: 'claude-sonnet',
        tokensUsed: 19320,
        costToday: 0.95,
        responseTime: 1.1,
        lastActivity: Date.now() - 3600000,
        soul: 'Content creation and marketing',
        memory: '1.1MB',
        sessions: 0
      }
    ];
  }

  getMockCronJobs() {
    return [
      {
        id: 'cron-weather',
        name: 'Weather Updates',
        schedule: '0 6,12,18 * * *',
        status: 'active',
        lastRun: Date.now() - 3600000,
        nextRun: Date.now() + 3600000,
        successRate: 98.5,
        agent: 'agent-main',
        description: 'Daily weather briefings'
      },
      {
        id: 'cron-backup',
        name: 'System Backup',
        schedule: '0 2 * * 0',
        status: 'active',
        lastRun: Date.now() - 86400000,
        nextRun: Date.now() + 518400000,
        successRate: 100,
        agent: 'agent-dev',
        description: 'Weekly system backup'
      },
      {
        id: 'cron-health',
        name: 'Health Reminder',
        schedule: '0 9 * * 1-5',
        status: 'active',
        lastRun: Date.now() - 7200000,
        nextRun: Date.now() + 79200000,
        successRate: 95.2,
        agent: 'agent-health',
        description: 'Daily health check reminders'
      },
      {
        id: 'cron-market',
        name: 'Market Analysis',
        schedule: '30 8 * * 1-5',
        status: 'paused',
        lastRun: Date.now() - 172800000,
        nextRun: null,
        successRate: 87.3,
        agent: 'agent-business',
        description: 'Daily market analysis reports'
      },
      {
        id: 'cron-cleanup',
        name: 'Log Cleanup',
        schedule: '0 0 1 * *',
        status: 'active',
        lastRun: Date.now() - 2592000000,
        nextRun: Date.now() + 604800000,
        successRate: 100,
        agent: 'agent-dev',
        description: 'Monthly log cleanup'
      }
    ];
  }

  getMockMetrics() {
    return {
      totalCostToday: 8.15,
      totalCostWeek: 42.30,
      totalTokens: 174770,
      avgResponseTime: 1.34,
      activeAgents: 3,
      totalAgents: 5,
      activeCrons: 4,
      totalCrons: 5,
      efficiencyScore: 92.5
    };
  }

  // Rendering methods
  renderAgents() {
    const container = document.getElementById('agents-list');
    if (!container) return;

    container.innerHTML = this.agents.map(agent => `
      <div class="card agent-card" data-agent-id="${agent.id}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="card-title mb-0">${agent.name}</h3>
          <span class="status status-${agent.status}">
            <span class="status-dot"></span>
            ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
        <div class="card-subtitle mb-3">${agent.soul}</div>
        
        <div class="grid grid-2">
          <div class="metric">
            <span class="metric-value">$${agent.costToday.toFixed(2)}</span>
            <span class="metric-label">Cost Today</span>
          </div>
          <div class="metric">
            <span class="metric-value">${(agent.tokensUsed / 1000).toFixed(1)}k</span>
            <span class="metric-label">Tokens</span>
          </div>
        </div>
        
        <div class="d-flex gap-1 mt-3">
          <button class="btn btn-sm btn-primary" onclick="agentManager.openAgentProfile('${agent.id}')">
            Profile
          </button>
          <button class="btn btn-sm" onclick="agentManager.sendMessageToAgent('${agent.id}')">
            Message
          </button>
          <button class="btn btn-sm" onclick="agentManager.viewAgentLogs('${agent.id}')">
            Logs
          </button>
        </div>
      </div>
    `).join('');
  }

  renderCronJobs() {
    const container = document.getElementById('cron-jobs-list');
    if (!container) return;

    container.innerHTML = this.cronJobs.map(job => `
      <div class="card cron-card" data-job-id="${job.id}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="card-title mb-0">${job.name}</h3>
          <span class="status status-${job.status === 'paused' ? 'offline' : 'active'}">
            <span class="status-dot"></span>
            ${job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
        
        <div class="card-subtitle mb-2">${job.description}</div>
        <div class="text-muted mb-2">
          <code>${job.schedule}</code>
        </div>
        
        <div class="grid grid-2 mb-3">
          <div>
            <small class="text-muted">Success Rate</small>
            <div class="d-flex align-items-center gap-1">
              <div class="progress" style="flex: 1;">
                <div class="progress-bar" style="width: ${job.successRate}%"></div>
              </div>
              <span>${job.successRate}%</span>
            </div>
          </div>
          <div>
            <small class="text-muted">Next Run</small>
            <div>${job.nextRun ? this.formatDateTime(job.nextRun) : 'Paused'}</div>
          </div>
        </div>
        
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-primary" onclick="agentManager.editCronJob('${job.id}')">
            Edit
          </button>
          <button class="btn btn-sm ${job.status === 'paused' ? 'btn-success' : 'btn-warning'}" 
                  onclick="agentManager.toggleCronJob('${job.id}')">
            ${job.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button class="btn btn-sm" onclick="agentManager.runCronJobNow('${job.id}')">
            Run Now
          </button>
        </div>
      </div>
    `).join('');
  }

  renderMetrics(metrics) {
    // Update dashboard metrics
    this.updateElement('total-cost-today', `$${metrics.totalCostToday.toFixed(2)}`);
    this.updateElement('total-cost-week', `$${metrics.totalCostWeek.toFixed(2)}`);
    this.updateElement('total-tokens', `${(metrics.totalTokens / 1000).toFixed(1)}k`);
    this.updateElement('avg-response-time', `${metrics.avgResponseTime}s`);
    this.updateElement('active-agents', `${metrics.activeAgents}/${metrics.totalAgents}`);
    this.updateElement('active-crons', `${metrics.activeCrons}/${metrics.totalCrons}`);
    this.updateElement('efficiency-score', `${metrics.efficiencyScore}%`);

    // Update progress bars
    const efficiencyBar = document.getElementById('efficiency-bar');
    if (efficiencyBar) {
      efficiencyBar.style.width = `${metrics.efficiencyScore}%`;
    }
  }

  // Agent management methods
  async openAgentProfile(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    // In a real implementation, load the actual SOUL.md and MEMORY.md files
    const profileModal = document.getElementById('agent-profile-modal');
    if (profileModal) {
      // Populate modal with agent data
      this.updateElement('profile-agent-name', agent.name);
      this.updateElement('profile-agent-model', agent.model);
      // Load SOUL.md content
      // Load MEMORY.md content
      this.openModal(profileModal);
    }
  }

  async sendMessageToAgent(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    const messageModal = document.getElementById('message-modal');
    if (messageModal) {
      this.updateElement('message-agent-name', agent.name);
      this.openModal(messageModal);
    }
  }

  async viewAgentLogs(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    // Load and display agent logs
    console.log(`Viewing logs for ${agent.name}`);
    this.showNotification(`Loading logs for ${agent.name}...`, 'info');
  }

  // Cron job management
  async editCronJob(jobId) {
    const job = this.cronJobs.find(j => j.id === jobId);
    if (!job) return;

    const cronModal = document.getElementById('cron-edit-modal');
    if (cronModal) {
      // Populate form with job data
      this.updateElement('cron-name', job.name, 'value');
      this.updateElement('cron-schedule', job.schedule, 'value');
      this.updateElement('cron-description', job.description, 'value');
      this.openModal(cronModal);
    }
  }

  async toggleCronJob(jobId) {
    const job = this.cronJobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = job.status === 'active' ? 'paused' : 'active';
    this.renderCronJobs();
    
    const action = job.status === 'active' ? 'resumed' : 'paused';
    this.showNotification(`${job.name} has been ${action}`, 'success');
  }

  async runCronJobNow(jobId) {
    const job = this.cronJobs.find(j => j.id === jobId);
    if (!job) return;

    this.showNotification(`Running ${job.name}...`, 'info');
    
    // Simulate job execution
    setTimeout(() => {
      job.lastRun = Date.now();
      this.renderCronJobs();
      this.showNotification(`${job.name} completed successfully`, 'success');
    }, 2000);
  }

  // Utility methods
  openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
      this.closeModal(modal);
    });
  }

  updateElement(id, value, attribute = 'textContent') {
    const element = document.getElementById(id);
    if (element) {
      if (attribute === 'textContent') {
        element.textContent = value;
      } else {
        element[attribute] = value;
      }
    }
  }

  formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  showNotification(message, type = 'info') {
    // Create or update notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadData();
    }, 30000); // Refresh every 30 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  }
}

// Notification styles
const notificationStyles = `
  <style>
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  }
  
  .notification-info { background: var(--info-color); }
  .notification-success { background: var(--success-color); }
  .notification-warning { background: var(--warning-color); color: #000; }
  .notification-error { background: var(--danger-color); }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.agentManager = new AgentManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentManager;
}