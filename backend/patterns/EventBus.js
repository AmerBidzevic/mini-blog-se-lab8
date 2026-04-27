class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    const listeners = this.listeners.get(eventName) || [];
    listeners.push(listener);
    this.listeners.set(eventName, listeners);
  }

  emit(eventName, payload) {
    const listeners = this.listeners.get(eventName) || [];
    listeners.forEach(listener => listener(payload));
  }
}

module.exports = {EventBus};
