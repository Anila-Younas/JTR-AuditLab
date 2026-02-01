const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * API Service for JTR-AuditLab
 * Handles all communication with the backend server
 */

export const api = {
    /**
     * Check API health
     */
    async healthCheck() {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) throw new Error('API is not available');
        return response.json();
    },

    /**
     * Upload a password hash dataset
     * @param {File} file - The file to upload
     * @returns {Promise<{success: boolean, dataset: object}>}
     */
    async uploadDataset(file) {
        const formData = new FormData();
        formData.append('file', file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(`${API_BASE_URL}/upload_dataset`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
                throw new Error(error.detail || 'Upload failed');
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Upload timeout - please check your connection');
            }
            throw error;
        }
    },

    /**
     * List all uploaded datasets
     * @returns {Promise<{datasets: array}>}
     */
    async listDatasets() {
        const response = await fetch(`${API_BASE_URL}/datasets`);
        if (!response.ok) throw new Error('Failed to fetch datasets');
        return response.json();
    },

    /**
     * Delete a dataset
     * @param {string} datasetId
     */
    async deleteDataset(datasetId) {
        const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete dataset');
        return response.json();
    },

    /**
     * Start a password audit (streaming response)
     * @param {string} dataset - Dataset ID
     * @param {string} mode - Audit mode
     * @param {object} options - Audit options
     * @param {function} onMessage - Callback for each streamed message
     * @param {AbortSignal} signal - AbortController signal for cancellation
     */
    async runAudit(dataset, mode, options = {}, onMessage, signal) {
        const response = await fetch(`${API_BASE_URL}/run_audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dataset, mode, options }),
            signal,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Audit failed' }));
            throw new Error(error.detail || 'Audit failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const message = JSON.parse(line);
                        onMessage(message);
                    } catch (e) {
                        console.error('Failed to parse message:', line);
                    }
                }
            }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
            try {
                const message = JSON.parse(buffer);
                onMessage(message);
            } catch (e) {
                console.error('Failed to parse final message:', buffer);
            }
        }
    },

    /**
     * Stop a running audit
     * @param {string} sessionId
     */
    async stopAudit(sessionId) {
        const response = await fetch(`${API_BASE_URL}/stop_audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to stop audit' }));
            throw new Error(error.detail || 'Failed to stop audit');
        }

        return response.json();
    },

    /**
     * List all audit sessions
     * @returns {Promise<{sessions: array}>}
     */
    async listSessions() {
        const response = await fetch(`${API_BASE_URL}/sessions`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        return response.json();
    },

    /**
     * Get a specific session
     * @param {string} sessionId
     */
    async getSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Session not found');
        return response.json();
    },

    /**
     * Delete a session
     * @param {string} sessionId
     */
    async deleteSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete session');
        return response.json();
    },
};

export default api;
