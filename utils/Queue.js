// utils/Queue.js
export default class Queue {
  constructor() {
    this.items = [];
  }

  // Add item to the queue (enqueue)
  push(item) {
    this.items.push(item);
  }

  // Remove item from the queue (dequeue)
  pop() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  // Look at the first item without removing it
  peek() {
    return this.isEmpty() ? null : this.items[0];
  }

  // Check if queue is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Get size of queue
  size() {
    return this.items.length;
  }

  // Clear the queue
  clear() {
    this.items = [];
  }

  // Print (debug helper)
  print() {
    console.log(this.items);
  }
}
