// shared-kernel/infrastructure/eventBus.js
import { EventEmitter } from 'events';

const bus = new EventEmitter();

export const eventBus = {
  publish: (topic, data) => {
    console.log(`📡 [Event Published]: ${topic}`);
    bus.emit(topic, data);
  },
  subscribe: (topic, callback) => {
    bus.on(topic, callback);
  }
};