import { describe, it, expect } from 'vitest';
import { ConversationStore } from './conversation.js';

describe('ConversationStore', () => {
    describe('getOrCreate', () => {
        it('creates a new conversation when no id provided', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate();
            expect(conv.id).toBeTruthy();
            expect(conv.messages).toEqual([]);
            expect(typeof conv.createdAt).toBe('number');
        });

        it('creates a new conversation when null provided', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate(null);
            expect(conv.id).toBeTruthy();
        });

        it('returns the same conversation for existing id', () => {
            const store = new ConversationStore();
            const conv1 = store.getOrCreate();
            const conv2 = store.getOrCreate(conv1.id);
            expect(conv2.id).toBe(conv1.id);
        });

        it('creates a new conversation for unknown id', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate('non-existent-id');
            // Creates new since 'non-existent-id' not in store
            expect(conv.id).not.toBe('non-existent-id');
        });
    });

    describe('get', () => {
        it('retrieves an existing conversation by id', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate();
            expect(store.get(conv.id)).toBe(conv);
        });

        it('returns undefined for unknown id', () => {
            const store = new ConversationStore();
            expect(store.get('unknown-id')).toBeUndefined();
        });
    });

    describe('addMessage', () => {
        it('adds a message to an existing conversation', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate();
            store.addMessage(conv.id, 'user', 'Hello');
            expect(conv.messages).toHaveLength(1);
            expect(conv.messages[0].role).toBe('user');
            expect(conv.messages[0].content).toBe('Hello');
            expect(typeof conv.messages[0].timestamp).toBe('number');
        });

        it('does not throw for unknown conversation id', () => {
            const store = new ConversationStore();
            expect(() => store.addMessage('unknown', 'user', 'Hello')).not.toThrow();
        });

        it('appends multiple messages in order', () => {
            const store = new ConversationStore();
            const conv = store.getOrCreate();
            store.addMessage(conv.id, 'user', 'First');
            store.addMessage(conv.id, 'assistant', 'Second');
            store.addMessage(conv.id, 'user', 'Third');
            expect(conv.messages).toHaveLength(3);
            expect(conv.messages[0].content).toBe('First');
            expect(conv.messages[1].role).toBe('assistant');
            expect(conv.messages[2].content).toBe('Third');
        });
    });

    describe('eviction', () => {
        it('evicts oldest conversation when at capacity', () => {
            const store = new ConversationStore(2);
            const conv1 = store.getOrCreate();
            const conv2 = store.getOrCreate();
            // This creation should evict conv1
            const conv3 = store.getOrCreate();
            expect(store.get(conv1.id)).toBeUndefined();
            expect(store.get(conv2.id)).toBeDefined();
            expect(store.get(conv3.id)).toBeDefined();
        });

        it('does not evict when under capacity', () => {
            const store = new ConversationStore(5);
            const conv1 = store.getOrCreate();
            const conv2 = store.getOrCreate();
            expect(store.get(conv1.id)).toBeDefined();
            expect(store.get(conv2.id)).toBeDefined();
        });
    });
});
