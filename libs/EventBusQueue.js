import { EventEmitter } from "events";

class EventBusQueue extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.processing = false;
    }

    // Override emit to push events into a queue
    emit(eventName, payload) {
        this.queue.push({ eventName, payload });
        this.processQueue();
        return true;
    }

    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const { eventName, payload } = this.queue.shift();

            // Use EventEmitter’s built-in listener handling
            const listeners = this.listeners(eventName);
            for (const listener of listeners) {
                try {
                    await listener(payload); // supports async
                } catch (err) {
                    console.error(`❌ Error in listener for ${eventName}:`, err);
                }
            }
        }

        this.processing = false;
    }
}

const eventBus = new EventBusQueue();

export default eventBus;