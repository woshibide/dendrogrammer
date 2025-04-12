/**
 * @file config-manager.js
 * Manages the application's configuration settings.
 * This module provides a centralized way to update, subscribe to, and reset configuration values.
 * It uses a simple state management system to maintain the current configuration and notify listeners of changes.
 */
import { CONFIG as DEFAULT_CONFIG } from './default-config.js';



// simple state management
class ConfigManager {
    constructor() {
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        this.listeners = [];
        this.initialConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    
    update(id, value) {
        // handle nested paths like 'layout.nodeRadius'
        if (id.includes('.')) {
            const [section, property] = id.split('.');
            this.config[section][property] = value;
        } else {
            // direct properties
            this.config[id] = value;
        }
        
        // notify listeners
        this.notifyUpdate(id, value);
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            // return unsubscribe function
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    notifyUpdate(id, value) {
        // tell visualization to update when config changes
        this.listeners.forEach(callback => callback(id, value, this.config));
    }
    
    reset() {
        this.config = JSON.parse(JSON.stringify(this.initialConfig));
        this.notifyUpdate('*', null);
    }

    getConfig() {
        return this.config;
    }
}

export const configManager = new ConfigManager();