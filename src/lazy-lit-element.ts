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

import {LitElement} from 'lit-element';
import {LazyUpdatingElement} from './lib/lazy-updating-element.js';

export * from 'lit-element';

export interface LazyLitElement extends LitElement, LazyUpdatingElement {}

/**
 * A LitElement subclass that performs updates and renders on the browser's task
 * queue, rather than the microtask queue. This makes rendering non-blocking to
 * other tasks such as event handling, layout, paint, etc.
 *
 * Using this base class for lower priority and/or high-rendering-cost elements
 * that don't need to have updates rendered synchronously with each frame can
 * improve the responsiveness of the page it's on.
 */
export const LazyLitElement = LazyUpdatingElement(LitElement);
