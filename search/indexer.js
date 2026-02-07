#!/usr/bin/env node

/**
 * Global Search Indexer for Troy
 * Scans all workspace files and builds searchable index
 * Usage: node indexer.js [command]
 * Commands: build, update, stats
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SearchIndexer {
    constructor(baseDir = null) {
        // Auto-detect workspace root if not specified
        if (!baseDir) {
            baseDir = process.cwd();
            // If we're in the search directory, go up one level
            if (path.basename(baseDir) === 'search') {
                baseDir = path.dirname(baseDir);
            }
        }
        this.baseDir = baseDir;
        this.indexFilePath = path.join(baseDir, 'search', 'search-index.json');
        this.index = {
            version: '1.0',
            generated: null,
            documents: {},
            terms: {},
            stats: { total_docs: 0, total_terms: 0, total_size: 0 }
        };
    }

    async buildIndex() {
        console.log('🔍 Building global search index...');
        const startTime = Date.now();

        this.index = {
            version: '1.0',
            generated: new Date().toISOString(),
            documents: {},
            terms: {},
            stats: { total_docs: 0, total_terms: 0, total_size: 0 }
        };

        // Scan different types of content
        await this.scanMemoryFiles();
        await this.scanActivityLogs();
        await this.scanWorkspaceFiles();
        await this.scanSystemFiles();

        // Calculate final stats
        this.calculateStats();

        // Save index
        await this.saveIndex();

        const duration = Date.now() - startTime;
        console.log(`✅ Index built in ${duration}ms`);
        console.log(`📊 ${this.index.stats.total_docs} documents, ${this.index.stats.total_terms} unique terms`);
        
        return this.index;
    }

    async scanMemoryFiles() {
        console.log('  📝 Scanning memory files...');
        
        // Scan daily memory files
        const memoryDir = path.join(this.baseDir, 'memory');
        if (fs.existsSync(memoryDir)) {
            const files = fs.readdirSync(memoryDir)
                .filter(f => f.match(/\d{4}-\d{2}-\d{2}\.md$/))
                .sort()
                .reverse(); // Most recent first

            console.log(`    Found ${files.length} memory files`);
            for (const file of files) {
                const filePath = path.join(memoryDir, file);
                await this.indexFile(filePath, 'memory', `Daily Memory - ${file.replace('.md', '')}`);
            }
        } else {
            console.log('    Memory directory not found');
        }

        // Scan MEMORY.md (curated long-term memory)
        const memoryFile = path.join(this.baseDir, 'MEMORY.md');
        if (fs.existsSync(memoryFile)) {
            await this.indexFile(memoryFile, 'memory', 'Long-term Memory (Curated)');
            console.log('    Indexed MEMORY.md');
        } else {
            console.log('    MEMORY.md not found');
        }
    }

    async scanActivityLogs() {
        console.log('  📊 Scanning activity logs...');
        
        const activityDir = path.join(this.baseDir, 'activity', 'logs');
        if (fs.existsSync(activityDir)) {
            const files = fs.readdirSync(activityDir)
                .filter(f => f.endsWith('.jsonl'))
                .sort()
                .reverse(); // Most recent first

            for (const file of files) {
                const filePath = path.join(activityDir, file);
                await this.indexActivityLog(filePath);
            }
        }
    }

    async scanWorkspaceFiles() {
        console.log('  📁 Scanning workspace documents...');
        
        const extensions = ['.md', '.txt', '.json', '.js', '.py', '.sh'];
        const skipDirs = ['node_modules', '.git', 'search/logs', 'activity/logs'];
        
        const scanDir = async (dirPath, maxDepth = 3) => {
            if (maxDepth <= 0) return;
            
            try {
                const items = fs.readdirSync(dirPath);
                
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const relativePath = path.relative(this.baseDir, fullPath);
                    
                    // Skip certain directories and files
                    if (skipDirs.some(skip => relativePath.includes(skip)) ||
                        item.startsWith('.') ||
                        item === 'search-index.json' ||
                        item === 'document-content.json') {
                        continue;
                    }
                    
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        await scanDir(fullPath, maxDepth - 1);
                    } else if (stat.isFile()) {
                        const ext = path.extname(item);
                        if (extensions.includes(ext)) {
                            await this.indexFile(fullPath, 'document', this.getDocumentTitle(fullPath));
                        }
                    }
                }
            } catch (error) {
                // Skip inaccessible directories
            }
        };

        await scanDir(this.baseDir);
    }

    async indexFile(filePath, type, title) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            const doc = {
                id: this.generateDocId(filePath),
                path: path.relative(this.baseDir, filePath),
                title: title,
                type: type,
                content: content,
                modified: stats.mtime.toISOString(),
                size: stats.size,
                terms: []
            };

            // Extract and index terms
            const terms = this.extractTerms(content);
            doc.terms = terms;

            // Add to index
            this.index.documents[doc.id] = doc;
            
            // Update term index
            terms.forEach(term => {
                if (!this.index.terms[term]) {
                    this.index.terms[term] = [];
                }
                this.index.terms[term].push({
                    doc_id: doc.id,
                    frequency: this.countTermFrequency(content, term)
                });
            });

        } catch (error) {
            console.error(`  ❌ Error indexing ${filePath}:`, error.message);
        }
    }

    async indexActivityLog(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            const fileName = path.basename(filePath);
            
            for (let i = 0; i < lines.length; i++) {
                try {
                    const activity = JSON.parse(lines[i]);
                    const docContent = `${activity.action} ${activity.context} ${activity.result || ''} ${JSON.stringify(activity.details)}`;
                    
                    const doc = {
                        id: this.generateDocId(`${filePath}:${i}`),
                        path: `activity/logs/${fileName}:${i+1}`,
                        title: `${activity.type}: ${activity.action}`,
                        type: 'activity',
                        content: docContent,
                        modified: activity.timestamp,
                        size: lines[i].length,
                        terms: [],
                        metadata: {
                            timestamp: activity.timestamp,
                            session: activity.session,
                            activity_type: activity.type,
                            action: activity.action
                        }
                    };

                    const terms = this.extractTerms(docContent);
                    doc.terms = terms;
                    
                    this.index.documents[doc.id] = doc;
                    
                    terms.forEach(term => {
                        if (!this.index.terms[term]) {
                            this.index.terms[term] = [];
                        }
                        this.index.terms[term].push({
                            doc_id: doc.id,
                            frequency: this.countTermFrequency(docContent, term)
                        });
                    });

                } catch (parseError) {
                    // Skip malformed JSON lines
                    continue;
                }
            }
        } catch (error) {
            console.error(`  ❌ Error indexing activity log ${filePath}:`, error.message);
        }
    }

    extractTerms(content) {
        // Basic tokenization and normalization
        const text = content.toLowerCase()
            .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();

        const words = text.split(' ')
            .filter(word => word.length >= 2)  // Minimum word length
            .filter(word => !this.isStopWord(word))
            .slice(0, 100); // Limit terms per document

        return [...new Set(words)]; // Remove duplicates
    }

    isStopWord(word) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
            'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
            'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them'
        ]);
        return stopWords.has(word);
    }

    countTermFrequency(content, term) {
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = content.match(regex);
        return matches ? matches.length : 0;
    }

    generateDocId(filePath) {
        return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 8);
    }

    getDocumentTitle(filePath) {
        const fileName = path.basename(filePath);
        const content = fs.readFileSync(filePath, 'utf8').substring(0, 200);
        
        // Try to extract title from markdown header
        const headerMatch = content.match(/^#\s+(.+)$/m);
        if (headerMatch) {
            return headerMatch[1];
        }

        // Use filename without extension
        return fileName.replace(/\.[^/.]+$/, '');
    }

    calculateStats() {
        this.index.stats = {
            total_docs: Object.keys(this.index.documents).length,
            total_terms: Object.keys(this.index.terms).length,
            total_size: Object.values(this.index.documents)
                .reduce((sum, doc) => sum + doc.size, 0),
            by_type: {}
        };

        // Count by document type
        Object.values(this.index.documents).forEach(doc => {
            this.index.stats.by_type[doc.type] = 
                (this.index.stats.by_type[doc.type] || 0) + 1;
        });
    }

    async saveIndex() {
        const indexDir = path.dirname(this.indexFilePath);
        if (!fs.existsSync(indexDir)) {
            fs.mkdirSync(indexDir, { recursive: true });
        }
        
        // Save compressed version (remove content from index for size)
        const compactIndex = {
            ...this.index,
            documents: Object.fromEntries(
                Object.entries(this.index.documents).map(([id, doc]) => [
                    id, 
                    { ...doc, content: undefined } // Remove content to save space
                ])
            )
        };

        fs.writeFileSync(this.indexFilePath, JSON.stringify(compactIndex, null, 2));
        
        // Save full content separately for search results
        const contentFile = path.join(path.dirname(this.indexFilePath), 'document-content.json');
        const documentContent = Object.fromEntries(
            Object.entries(this.index.documents).map(([id, doc]) => [
                id, 
                { content: doc.content, title: doc.title, path: doc.path }
            ])
        );
        fs.writeFileSync(contentFile, JSON.stringify(documentContent, null, 2));
    }

    async scanSystemFiles() {
        console.log('  ⚙️ Scanning system files...');
        
        const systemFiles = [
            'AGENTS.md', 'SOUL.md', 'USER.md', 'TOOLS.md', 'IDENTITY.md',
            'HEARTBEAT.md', 'mission-control.md'
        ];

        let found = 0;
        for (const file of systemFiles) {
            const filePath = path.join(this.baseDir, file);
            if (fs.existsSync(filePath)) {
                await this.indexFile(filePath, 'system', file.replace('.md', ''));
                found++;
            }
        }
        console.log(`    Found ${found} system files`);
    }

    showStats() {
        if (!fs.existsSync(this.indexFilePath)) {
            console.log('❌ No search index found. Run "node indexer.js build" first.');
            return;
        }

        const index = JSON.parse(fs.readFileSync(this.indexFilePath, 'utf8'));
        
        console.log('📊 Search Index Statistics');
        console.log('=========================');
        console.log(`Generated: ${new Date(index.generated).toLocaleString()}`);
        console.log(`Total Documents: ${index.stats.total_docs}`);
        console.log(`Total Terms: ${index.stats.total_terms}`);
        console.log(`Total Size: ${(index.stats.total_size / 1024).toFixed(1)} KB`);
        console.log('');
        console.log('By Document Type:');
        Object.entries(index.stats.by_type).forEach(([type, count]) => {
            console.log(`  ${type}: ${count} documents`);
        });
    }
}

// Export for module usage
module.exports = { SearchIndexer };

// CLI usage
if (require.main === module) {
    const indexer = new SearchIndexer();
    const command = process.argv[2] || 'build';

    switch (command) {
        case 'build':
            indexer.buildIndex();
            break;
        
        case 'update':
            console.log('🔄 Updating search index...');
            indexer.buildIndex();
            break;
        
        case 'stats':
            indexer.showStats();
            break;
        
        default:
            console.log('Usage: node indexer.js [command]');
            console.log('Commands:');
            console.log('  build  - Build complete search index');
            console.log('  update - Update/rebuild search index');
            console.log('  stats  - Show index statistics');
            break;
    }
}