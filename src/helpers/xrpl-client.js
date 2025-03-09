import { Client } from 'xrpl';

class XrplClientManager {
  constructor() {
    this.client = null;
    this.isConnecting = false;
    this.listeners = new Map(); // Track listeners to avoid duplicates
  }

  async getClient() {
    if (!this.client || !this.client.isConnected()) {
      await this.connect();
    }
    return this.client;
  }

  async connect() {
    if (this.isConnecting) return; // Prevent multiple simultaneous connections
    this.isConnecting = true;

    try {
      if (this.client) {
        await this.client.disconnect();
      }
      this.client = new Client(process.env.CLIENT);
      await this.client.connect();
      console.log('XRPL Client connected');

      // Handle unexpected disconnects
      this.client.on('disconnected', async () => {
        console.log('XRPL Client disconnected, attempting to reconnect...');
        await this.connect();
      });

    } catch (error) {
      console.error('XRPL Client connection error:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Add listener with deduplication
  addListener(event, callback, key) {
    const listenerKey = `${event}:${key}`;
    if (this.listeners.has(listenerKey)) {
      this.removeListener(event, listenerKey);
    }
    this.client?.on(event, callback);
    this.listeners.set(listenerKey, callback);
  }

  // Remove listener
  removeListener(event, key) {
    const listenerKey = `${event}:${key}`;
    const callback = this.listeners.get(listenerKey);
    if (callback && this.client) {
      this.client.off(event, callback);
      this.listeners.delete(listenerKey);
    }
  }

  // Cleanup all listeners for a page
  cleanupListeners(pageKey) {
    for (const [key, callback] of this.listeners) {
      if (key.includes(pageKey)) {
        this.client?.off(key.split(':')[0], callback);
        this.listeners.delete(key);
      }
    }
  }

  async disconnect() {
    if (this.client && this.client.isConnected()) {
      this.listeners.clear();
      await this.client.disconnect();
      this.client = null;
      console.log('XRPL Client disconnected');
    }
  }
}

const xrplClientManager = new XrplClientManager();
export default xrplClientManager;