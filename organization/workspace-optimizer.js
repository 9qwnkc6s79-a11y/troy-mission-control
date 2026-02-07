// Advanced Workspace Organization & File Management
// Analyzes workspace structure and provides intelligent organization suggestions

class WorkspaceOptimizer {
    constructor() {
        this.fileTypes = {
            documents: ['.md', '.txt', '.pdf', '.docx', '.doc'],
            code: ['.js', '.ts', '.py', '.html', '.css', '.json', '.yaml', '.yml'],
            images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
            data: ['.csv', '.xlsx', '.json', '.jsonl', '.db'],
            archives: ['.zip', '.tar', '.gz'],
            logs: ['.log'],
            configs: ['.env', '.config', '.ini', '.toml']
        };
        
        this.projectPatterns = {
            'boundaries-coffee': /boundaries|coffee|barista|menu|training/i,
            'trading': /trading|crypto|congress|options|bot/i,
            'ventures': /glp1|patch|noriva|vivpatch|health/i,
            'brewshift': /brewshift|academy/i,
            'mission-control': /mission|control|dashboard|activity|calendar/i,
            'research': /research|investigation|h1b|fraud/i
        };
        
        this.organizationRules = [
            {
                name: 'Consolidate Scattered Documents',
                pattern: /\.(md|pdf|docx?)$/i,
                suggest: (file, content) => this.suggestDocumentLocation(file, content)
            },
            {
                name: 'Group Related Code Files',
                pattern: /\.(js|ts|py|html|css)$/i,
                suggest: (file, content) => this.suggestCodeLocation(file, content)
            },
            {
                name: 'Archive Old Files',
                pattern: /.*$/,
                suggest: (file, stats) => this.suggestArchival(file, stats)
            },
            {
                name: 'Create Missing READMEs',
                pattern: /.*$/,
                suggest: (dir) => this.suggestREADME(dir)
            }
        ];
    }

    async analyzeWorkspace(rootPath = '.') {
        const analysis = {
            fileCount: 0,
            directories: {},
            duplicates: [],
            orphaned: [],
            suggestions: [],
            metrics: {
                totalSize: 0,
                oldestFile: null,
                newestFile: null,
                largestFile: null
            }
        };

        try {
            await this.scanDirectory(rootPath, analysis);
            analysis.suggestions = await this.generateSuggestions(analysis);
            return analysis;
        } catch (error) {
            console.error('Workspace analysis failed:', error);
            return null;
        }
    }

    async scanDirectory(dirPath, analysis, depth = 0) {
        if (depth > 5) return; // Prevent infinite recursion
        
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (!entry.name.startsWith('.') && !entry.name.includes('node_modules')) {
                        analysis.directories[fullPath] = {
                            name: entry.name,
                            path: fullPath,
                            files: [],
                            subdirs: []
                        };
                        await this.scanDirectory(fullPath, analysis, depth + 1);
                    }
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    const fileInfo = {
                        name: entry.name,
                        path: fullPath,
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.birthtime,
                        ext: path.extname(entry.name).toLowerCase()
                    };
                    
                    analysis.fileCount++;
                    analysis.metrics.totalSize += stats.size;
                    
                    // Track metrics
                    if (!analysis.metrics.oldestFile || stats.mtime < analysis.metrics.oldestFile.modified) {
                        analysis.metrics.oldestFile = fileInfo;
                    }
                    if (!analysis.metrics.newestFile || stats.mtime > analysis.metrics.newestFile.modified) {
                        analysis.metrics.newestFile = fileInfo;
                    }
                    if (!analysis.metrics.largestFile || stats.size > analysis.metrics.largestFile.size) {
                        analysis.metrics.largestFile = fileInfo;
                    }
                    
                    // Add to parent directory
                    const parentDir = path.dirname(fullPath);
                    if (analysis.directories[parentDir]) {
                        analysis.directories[parentDir].files.push(fileInfo);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan ${dirPath}:`, error);
        }
    }

    async generateSuggestions(analysis) {
        const suggestions = [];
        
        // 1. Suggest project consolidation
        suggestions.push(...this.suggestProjectConsolidation(analysis));
        
        // 2. Suggest cleanup opportunities  
        suggestions.push(...this.suggestCleanup(analysis));
        
        // 3. Suggest documentation improvements
        suggestions.push(...this.suggestDocumentation(analysis));
        
        // 4. Suggest performance improvements
        suggestions.push(...this.suggestPerformanceImprovements(analysis));
        
        return suggestions.filter(s => s !== null);
    }

    suggestProjectConsolidation(analysis) {
        const suggestions = [];
        const scatteredFiles = {};
        
        // Find files that should be grouped
        Object.values(analysis.directories).forEach(dir => {
            dir.files.forEach(file => {
                for (const [project, pattern] of Object.entries(this.projectPatterns)) {
                    if (pattern.test(file.name) || pattern.test(file.path)) {
                        if (!scatteredFiles[project]) scatteredFiles[project] = [];
                        scatteredFiles[project].push(file);
                    }
                }
            });
        });
        
        // Suggest consolidation for scattered files
        Object.entries(scatteredFiles).forEach(([project, files]) => {
            const locations = [...new Set(files.map(f => path.dirname(f.path)))];
            if (locations.length > 1 && files.length > 3) {
                suggestions.push({
                    type: 'consolidation',
                    priority: 'high',
                    project: project,
                    title: `Consolidate scattered ${project} files`,
                    description: `Found ${files.length} ${project}-related files in ${locations.length} different locations`,
                    files: files,
                    suggestedLocation: this.suggestBestLocation(project, locations),
                    impact: 'Improves navigation and reduces search time'
                });
            }
        });
        
        return suggestions;
    }

    suggestCleanup(analysis) {
        const suggestions = [];
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        
        // Find old files that could be archived
        const oldFiles = [];
        const duplicateNames = {};
        
        Object.values(analysis.directories).forEach(dir => {
            dir.files.forEach(file => {
                // Check for old files
                if (file.modified < threeMonthsAgo) {
                    oldFiles.push(file);
                }
                
                // Check for potential duplicates
                const basename = path.basename(file.name, path.extname(file.name));
                if (!duplicateNames[basename]) duplicateNames[basename] = [];
                duplicateNames[basename].push(file);
            });
        });
        
        // Suggest archiving old files
        if (oldFiles.length > 10) {
            suggestions.push({
                type: 'cleanup',
                priority: 'medium',
                title: 'Archive old files',
                description: `${oldFiles.length} files haven't been modified in over 3 months`,
                files: oldFiles.slice(0, 20), // Show top 20
                suggestedAction: 'Move to archive/ directory',
                impact: 'Reduces clutter and improves workspace performance'
            });
        }
        
        // Suggest duplicate resolution
        const duplicates = Object.entries(duplicateNames)
            .filter(([name, files]) => files.length > 1)
            .map(([name, files]) => ({ name, files }));
            
        if (duplicates.length > 0) {
            suggestions.push({
                type: 'cleanup',
                priority: 'medium',
                title: 'Resolve potential duplicates',
                description: `Found ${duplicates.length} sets of files with similar names`,
                duplicates: duplicates.slice(0, 10),
                suggestedAction: 'Review and consolidate or rename files',
                impact: 'Prevents confusion and reduces redundancy'
            });
        }
        
        return suggestions;
    }

    suggestDocumentation(analysis) {
        const suggestions = [];
        
        // Find directories without READMEs
        const dirsWithoutREADME = Object.values(analysis.directories)
            .filter(dir => {
                const hasREADME = dir.files.some(file => 
                    /readme/i.test(file.name) || /index\.(md|html)/i.test(file.name)
                );
                return !hasREADME && dir.files.length > 3;
            });
        
        if (dirsWithoutREADME.length > 0) {
            suggestions.push({
                type: 'documentation',
                priority: 'low',
                title: 'Add missing documentation',
                description: `${dirsWithoutREADME.length} directories lack README files`,
                directories: dirsWithoutREADME.slice(0, 10),
                suggestedAction: 'Create README.md files explaining directory contents',
                impact: 'Improves onboarding and project understanding'
            });
        }
        
        return suggestions;
    }

    suggestPerformanceImprovements(analysis) {
        const suggestions = [];
        
        // Check for large files
        const largeFiles = [];
        Object.values(analysis.directories).forEach(dir => {
            dir.files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) { // > 10MB
                    largeFiles.push(file);
                }
            });
        });
        
        if (largeFiles.length > 0) {
            suggestions.push({
                type: 'performance',
                priority: 'medium',
                title: 'Optimize large files',
                description: `${largeFiles.length} files are larger than 10MB`,
                files: largeFiles,
                suggestedAction: 'Consider compression, external storage, or Git LFS',
                impact: 'Improves repository performance and sync speed'
            });
        }
        
        return suggestions;
    }

    suggestBestLocation(project, currentLocations) {
        // Smart location suggestion based on project patterns
        const projectDirs = {
            'boundaries-coffee': 'boundaries-coffee/',
            'trading': 'trading/',
            'ventures': 'ventures/',
            'brewshift': 'brewshift-brand/',
            'mission-control': 'mission-control/',
            'research': 'research/'
        };
        
        return projectDirs[project] || `${project}/`;
    }

    async applyOrganization(suggestions, autoApprove = false) {
        const fs = require('fs').promises;
        const path = require('path');
        const applied = [];
        
        for (const suggestion of suggestions) {
            if (!autoApprove) {
                // In real implementation, would prompt user
                console.log(`Would you like to apply: ${suggestion.title}? (y/n)`);
                continue;
            }
            
            try {
                switch (suggestion.type) {
                    case 'consolidation':
                        await this.consolidateFiles(suggestion);
                        applied.push(suggestion);
                        break;
                    case 'cleanup':
                        await this.cleanupFiles(suggestion);
                        applied.push(suggestion);
                        break;
                    case 'documentation':
                        await this.createDocumentation(suggestion);
                        applied.push(suggestion);
                        break;
                }
            } catch (error) {
                console.error(`Failed to apply ${suggestion.title}:`, error);
            }
        }
        
        return applied;
    }

    async consolidateFiles(suggestion) {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Create target directory if it doesn't exist
        const targetDir = suggestion.suggestedLocation;
        await fs.mkdir(targetDir, { recursive: true });
        
        // Move files
        for (const file of suggestion.files) {
            const newPath = path.join(targetDir, path.basename(file.path));
            await fs.rename(file.path, newPath);
        }
    }

    async cleanupFiles(suggestion) {
        const fs = require('fs').promises;
        
        if (suggestion.title.includes('Archive')) {
            // Create archive directory and move old files
            await fs.mkdir('archive/', { recursive: true });
            
            for (const file of suggestion.files) {
                const archivePath = path.join('archive/', path.basename(file.path));
                await fs.rename(file.path, archivePath);
            }
        }
    }

    async createDocumentation(suggestion) {
        const fs = require('fs').promises;
        const path = require('path');
        
        for (const dir of suggestion.directories) {
            const readmePath = path.join(dir.path, 'README.md');
            const content = this.generateREADMEContent(dir);
            await fs.writeFile(readmePath, content);
        }
    }

    generateREADMEContent(directory) {
        const filesByType = {};
        directory.files.forEach(file => {
            const category = this.categorizeFile(file);
            if (!filesByType[category]) filesByType[category] = [];
            filesByType[category].push(file);
        });

        let content = `# ${directory.name}\n\n`;
        content += `Auto-generated documentation for ${directory.path}\n\n`;
        
        if (Object.keys(filesByType).length > 0) {
            content += `## Contents\n\n`;
            Object.entries(filesByType).forEach(([category, files]) => {
                content += `### ${category}\n`;
                files.forEach(file => {
                    content += `- \`${file.name}\`\n`;
                });
                content += '\n';
            });
        }
        
        content += `\n*Generated by Troy Mission Control - ${new Date().toISOString()}*\n`;
        
        return content;
    }

    categorizeFile(file) {
        for (const [category, extensions] of Object.entries(this.fileTypes)) {
            if (extensions.includes(file.ext)) {
                return category;
            }
        }
        return 'other';
    }

    formatAnalysisReport(analysis) {
        if (!analysis) return 'Analysis failed';
        
        const { fileCount, metrics, suggestions } = analysis;
        const sizeMB = (metrics.totalSize / (1024 * 1024)).toFixed(2);
        
        let report = `# Workspace Analysis Report\n\n`;
        report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        
        report += `## Overview\n`;
        report += `- **Files:** ${fileCount}\n`;
        report += `- **Total Size:** ${sizeMB} MB\n`;
        report += `- **Suggestions:** ${suggestions.length}\n\n`;
        
        if (metrics.largestFile) {
            report += `## Key Metrics\n`;
            report += `- **Largest File:** ${metrics.largestFile.name} (${(metrics.largestFile.size / (1024 * 1024)).toFixed(2)} MB)\n`;
            report += `- **Oldest File:** ${metrics.oldestFile.name} (${metrics.oldestFile.modified.toLocaleDateString()})\n`;
            report += `- **Newest File:** ${metrics.newestFile.name} (${metrics.newestFile.modified.toLocaleDateString()})\n\n`;
        }
        
        if (suggestions.length > 0) {
            report += `## Optimization Suggestions\n\n`;
            suggestions.forEach((suggestion, index) => {
                report += `### ${index + 1}. ${suggestion.title}\n`;
                report += `**Priority:** ${suggestion.priority}\n`;
                report += `**Type:** ${suggestion.type}\n`;
                report += `**Description:** ${suggestion.description}\n`;
                report += `**Impact:** ${suggestion.impact}\n\n`;
            });
        }
        
        return report;
    }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined') {
    module.exports = WorkspaceOptimizer;
} else {
    window.WorkspaceOptimizer = WorkspaceOptimizer;
}