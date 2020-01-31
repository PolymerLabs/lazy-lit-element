/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import { UpdatingElement } from 'lit-element/lib/updating-element.js';

const resolveUrgentUpdate = Symbol();
const urgentUpdateRequested = Symbol();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = {new(...args: any[]): T};

export interface LazyUpdatingElement {
  /**
   * Schedules an urgent update on the microtask queue, which will be performed
   * before the lazy render that's scheduled on the the task queue.
   */
  requestUrgentUpdate(): void;
}

/**
 * Performs updates on the browser's task queue, rather than the microtask
 * queue. This makes rendering non-blocking to other tasks such as event
 * handling, layout, paint, etc.
 * 
 * Using this mixin for lower priority and/or high-rendering-cost elements that
 * don't need to have updates rendered synchronously with each frame can improve
 * the responsiveness of the page it's on.
 */
export const LazyUpdatingElement = <C extends Constructor<UpdatingElement>>(base: C): C & Constructor<LazyUpdatingElement> => {
  class LazyUpdatingElement extends base {
    static lazyRender = true;

    [resolveUrgentUpdate]: () => void;
    [urgentUpdateRequested] = false;


    requestUrgentUpdate() {
      this.requestUpdate();
      if (this[resolveUrgentUpdate] === undefined) {
        this[urgentUpdateRequested] = true;
      } else {
        this[resolveUrgentUpdate]!();
      }
    }

    protected async performUpdate() {
      if (!this[urgentUpdateRequested]) {
        this[urgentUpdateRequested] = false;
        await new Promise(resolve => {
          // This causes updates to be performed on the next task, rather than the next
          // microtask, allowing the browser to paint and respond to user input if
          // necessary before element updates.
          setTimeout(resolve);
          
          // Store the resolve function so that we can optionally resolve before the
          // setTimeout() for urgent updates that need to jump the task queue.
          this[resolveUrgentUpdate] = resolve;
        });
      }
      super.performUpdate();
    }
  }
  return LazyUpdatingElement;
};
