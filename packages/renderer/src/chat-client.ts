/**
 * SSE chat client for MCPUI.
 * Framework-agnostic — no DOM assumptions, just event callbacks.
 */

export interface ChatCallbacks {
    onChunk?: (chunk: string, fullText: string) => void;
    onDone?: (fullText: string) => void;
    onError?: (error: string) => void;
    onProgress?: (info: { elapsed: number; chunkCount: number }) => void;
}

export interface ChatClientOptions {
    /** Base URL for the API (default: '') */
    baseUrl?: string;
}

export class ChatClient {
    private _conversationId: string | null = null;
    private _activeSource: EventSource | null = null;
    private _cancelGeneration = 0;
    private _baseUrl: string;

    constructor(options: ChatClientOptions = {}) {
        this._baseUrl = options.baseUrl ?? '';
    }

    get conversationId(): string | null {
        return this._conversationId;
    }

    get isStreaming(): boolean {
        return this._activeSource !== null;
    }

    resetConversation(): void {
        this._conversationId = null;
    }

    cancelStream(): boolean {
        if (this._activeSource) {
            this._cancelGeneration++;
            this._activeSource.close();
            this._activeSource = null;
            return true;
        }
        return false;
    }

    async submitPrompt(prompt: string, callbacks: ChatCallbacks = {}): Promise<void> {
        this._cancelGeneration = 0;

        const res = await fetch(`${this._baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                conversationId: this._conversationId,
            }),
        });

        if (!res.ok) throw new Error(`Chat API error: ${res.status}`);

        const data = await res.json();
        this._conversationId = data.conversationId;

        await this._streamResponse(data.streamUrl, callbacks);
    }

    private _streamResponse(
        streamUrl: string,
        callbacks: ChatCallbacks,
    ): Promise<void> {
        let fullText = '';
        let chunkCount = 0;
        const startTime = Date.now();
        const myGeneration = this._cancelGeneration;
        let resolved = false;

        return new Promise((resolve, reject) => {
            const url = streamUrl.startsWith('http')
                ? streamUrl
                : `${this._baseUrl}${streamUrl}`;
            const source = new EventSource(url);
            this._activeSource = source;

            source.onmessage = (event) => {
                if (this._cancelGeneration > myGeneration) return;
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'error') {
                        source.close();
                        this._activeSource = null;
                        resolved = true;
                        callbacks.onError?.(data.message || 'Unknown error');
                        resolve();
                    } else if (data.type === 'content') {
                        fullText += data.text;
                        chunkCount++;
                        callbacks.onChunk?.(data.text, fullText);
                        if (callbacks.onProgress) {
                            const elapsed = Math.floor((Date.now() - startTime) / 1000);
                            callbacks.onProgress({ elapsed, chunkCount });
                        }
                    } else if (data.type === 'done') {
                        source.close();
                        this._activeSource = null;
                        resolved = true;
                        callbacks.onDone?.(fullText);
                        resolve();
                    }
                } catch (e) {
                    console.error('SSE parse error:', e);
                }
            };

            source.onerror = () => {
                source.close();
                this._activeSource = null;
                const wasCancelled = this._cancelGeneration > myGeneration;
                if (!resolved) {
                    resolved = true;
                    if (wasCancelled) {
                        resolve();
                    } else if (fullText) {
                        callbacks.onDone?.(fullText);
                        resolve();
                    } else {
                        reject(new Error('Stream connection lost'));
                    }
                }
            };
        });
    }
}
