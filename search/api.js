#!/usr/bin/env node

/**
 * Global Search API for Troy
 * Provides search functionality across all indexed content
 * Usage: node api.js [command] [query]
 * Commands: search, serve, info
 */

const fs = require('fs');
const path = require('path');

class SearchAPI {
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
        this.indexFile = path.join(baseDir, 'search', 'search-index.json');
        this.contentFile = path.join(baseDir, 'search', 'document-content.json');
        this.index = null;
        this.content = null;
        this.loadIndex();
    }

    loadIndex() {
        try {
            if (fs.existsSync(this.indexFile)) {
                this.index = JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
            }
            
            if (fs.existsSync(this.contentFile)) {
                this.content = JSON.parse(fs.readFileSync(this.contentFile, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to load search index:', error.message);
        }
    }

    isIndexAvailable() {
        return this.index && this.content;
    }

    search(query, options = {}) {
        if (!this.isIndexAvailable()) {
            return { error: 'Search index not available. Run "node search/indexer.js build" first.' };
        }

        const {
            limit = 20,
            type = null,        // Filter by document type
            dateFrom = null,    // Filter by date range
            dateTo = null,
            includeContent = true
        } = options;

        // Normalize query
        const terms = this.extractQueryTerms(query);
        if (terms.length === 0) {
            return { results: [], total: 0, query: query };
        }

        // Score documents
        const scores = this.scoreDocuments(terms);
        
        // Apply filters
        const filtered = this.applyFilters(scores, { type, dateFrom, dateTo });

        // Sort by relevance and limit
        const sorted = filtered
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        // Prepare results
        const results = sorted.map(item => {
            const doc = this.index.documents[item.docId];
            const content = this.content[item.docId];
            
            const result = {
                id: item.docId,
                title: doc.title,
                path: doc.path,
                type: doc.type,
                modified: doc.modified,
                score: Math.round(item.score * 100) / 100,
                size: doc.size,
                snippet: this.generateSnippet(content.content, terms),
                matches: item.matches
            };

            if (includeContent) {
                result.content = content.content;
            }

            if (doc.metadata) {
                result.metadata = doc.metadata;
            }

            return result;
        });

        return {
            results: results,
            total: filtered.length,
            query: query,
            terms: terms,
            stats: {
                total_docs: this.index.stats.total_docs,
                search_time_ms: Date.now() - this.searchStartTime
            }
        };
    }

    extractQueryTerms(query) {
        return query.toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(term => term.length >= 2)
            .filter(term => !this.isStopWord(term))
            .slice(0, 10); // Limit query terms
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

    scoreDocuments(queryTerms) {
        this.searchStartTime = Date.now();
        const scores = new Map();

        queryTerms.forEach((term, termIndex) => {
            const termDocs = this.index.terms[term] || [];
            
            termDocs.forEach(termDoc => {
                const docId = termDoc.doc_id;
                
                if (!scores.has(docId)) {
                    scores.set(docId, {
                        docId: docId,
                        score: 0,
                        matches: []
                    });
                }

                const docScore = scores.get(docId);
                
                // Calculate term score (TF-IDF inspired)
                const tf = termDoc.frequency;
                const df = termDocs.length;
                const idf = Math.log(this.index.stats.total_docs / df);
                const termScore = tf * idf;
                
                // Boost for exact matches and term position
                const boost = 1 + (queryTerms.length - termIndex) * 0.1;
                
                docScore.score += termScore * boost;
                docScore.matches.push({
                    term: term,
                    frequency: tf,
                    score: termScore
                });
            });
        });

        return Array.from(scores.values());
    }

    applyFilters(scoredDocs, filters) {
        return scoredDocs.filter(item => {
            const doc = this.index.documents[item.docId];
            
            // Type filter
            if (filters.type && doc.type !== filters.type) {
                return false;
            }
            
            // Date range filter
            if (filters.dateFrom || filters.dateTo) {
                const docDate = new Date(doc.modified);
                
                if (filters.dateFrom && docDate < new Date(filters.dateFrom)) {
                    return false;
                }
                
                if (filters.dateTo && docDate > new Date(filters.dateTo)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    generateSnippet(content, queryTerms, maxLength = 200) {
        if (!content) return '';
        
        const lowerContent = content.toLowerCase();
        const lowerTerms = queryTerms.map(t => t.toLowerCase());
        
        // Find the best snippet position (first occurrence of any term)
        let bestPos = content.length;
        let foundTerm = null;
        
        for (const term of lowerTerms) {
            const pos = lowerContent.indexOf(term);
            if (pos !== -1 && pos < bestPos) {
                bestPos = pos;
                foundTerm = term;
            }
        }
        
        if (bestPos === content.length) {
            // No terms found, return beginning
            const snippet = content.substring(0, maxLength);
            return snippet + (content.length > maxLength ? '...' : '');
        }
        
        // Center the snippet around the found term
        const start = Math.max(0, bestPos - maxLength / 2);
        const end = Math.min(content.length, start + maxLength);
        let snippet = content.substring(start, end);
        
        // Add ellipsis if needed
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        // Highlight query terms
        for (const term of lowerTerms) {
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            snippet = snippet.replace(regex, '**$1**');
        }
        
        return snippet;
    }

    getDocumentTypes() {
        if (!this.isIndexAvailable()) {
            return [];
        }

        const types = new Set();
        Object.values(this.index.documents).forEach(doc => {
            types.add(doc.type);
        });

        return Array.from(types).sort().map(type => ({
            type: type,
            count: this.index.stats.by_type[type] || 0
        }));
    }

    getIndexInfo() {
        if (!this.isIndexAvailable()) {
            return { error: 'Search index not available' };
        }

        return {
            version: this.index.version,
            generated: this.index.generated,
            stats: this.index.stats,
            document_types: this.getDocumentTypes()
        };
    }

    async serveHTTP(port = 3002) {
        const http = require('http');
        
        const server = http.createServer(async (req, res) => {
            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            const url = new URL(req.url, `http://localhost:${port}`);
            
            try {
                if (req.method === 'GET' && url.pathname === '/api/search') {
                    const query = url.searchParams.get('q') || '';
                    const type = url.searchParams.get('type') || null;
                    const limit = parseInt(url.searchParams.get('limit')) || 20;
                    const dateFrom = url.searchParams.get('dateFrom') || null;
                    const dateTo = url.searchParams.get('dateTo') || null;
                    
                    const results = this.search(query, { type, limit, dateFrom, dateTo });
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                    
                } else if (req.method === 'GET' && url.pathname === '/api/info') {
                    const info = this.getIndexInfo();
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(info));
                    
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });

        server.listen(port, () => {
            console.log(`🔍 Search API server running on http://localhost:${port}`);
            console.log(`Search endpoint: http://localhost:${port}/api/search?q=your+query`);
            console.log(`Info endpoint: http://localhost:${port}/api/info`);
        });
    }
}

// Export for module usage
module.exports = { SearchAPI };

// CLI usage
if (require.main === module) {
    const api = new SearchAPI();
    const command = process.argv[2] || 'info';

    switch (command) {
        case 'search':
            const query = process.argv.slice(3).join(' ');
            if (!query) {
                console.log('Usage: node api.js search "your search query"');
                process.exit(1);
            }
            
            const results = api.search(query);
            
            if (results.error) {
                console.log('❌', results.error);
                process.exit(1);
            }
            
            console.log(`🔍 Found ${results.total} results for "${query}"`);
            console.log('='.repeat(50));
            
            results.results.forEach((result, index) => {
                console.log(`${index + 1}. ${result.title} (${result.type})`);
                console.log(`   📁 ${result.path}`);
                console.log(`   📊 Score: ${result.score}, Modified: ${new Date(result.modified).toLocaleDateString()}`);
                console.log(`   📝 ${result.snippet.replace(/\*\*/g, '')}`);
                console.log('');
            });
            
            break;

        case 'serve':
            const port = parseInt(process.argv[3]) || 3002;
            api.serveHTTP(port);
            break;

        case 'info':
            const info = api.getIndexInfo();
            if (info.error) {
                console.log('❌', info.error);
                process.exit(1);
            }
            
            console.log('🔍 Search Index Information');
            console.log('===========================');
            console.log(`Generated: ${new Date(info.generated).toLocaleString()}`);
            console.log(`Documents: ${info.stats.total_docs}`);
            console.log(`Terms: ${info.stats.total_terms}`);
            console.log(`Size: ${(info.stats.total_size / 1024).toFixed(1)} KB`);
            console.log('');
            console.log('Document Types:');
            info.document_types.forEach(type => {
                console.log(`  ${type.type}: ${type.count} documents`);
            });
            break;

        default:
            console.log('Usage: node api.js [command] [args]');
            console.log('Commands:');
            console.log('  search "query" - Search for content');
            console.log('  serve [port]   - Start HTTP API server (default port 3002)');
            console.log('  info          - Show index information');
            break;
    }
}