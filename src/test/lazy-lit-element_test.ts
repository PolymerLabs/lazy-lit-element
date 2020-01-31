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

/* eslint-disable @typescript-eslint/no-explicit-any */

import {LazyLitElement, customElement, property, html, LitElement} from '../lazy-lit-element.js';

const assert = chai.assert;

@customElement('test-element')
export class TestElement extends LazyLitElement {
  @property() name?: string;

  render() {
    return html`<h1>Hello ${this.name}</h1>`;
  }
}

@customElement('baseline-element')
export class BaselineElement extends LitElement {
  @property() name?: string;

  render() {
    return html`<h1>Hello ${this.name}</h1>`;
  }
}

suite('lazy-lit-element', () => {
  let container: HTMLElement;

  setup(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  teardown(() => {
    container.remove();
  });

  // Since we're testing exact timing, which could change and is a bit fragile,
  // we test our assumptions about LitElement timing explicitly first.
  test('baseline', async () => {
    container.innerHTML = `<baseline-element></baseline-element>`;
    const el = container.querySelector('baseline-element') as BaselineElement;

    // Wait for a microtask and check that something rendered
    await Promise.resolve();
    assert.include(el.shadowRoot!.innerHTML, 'Hello');

    el.name = "Eager";
    await Promise.resolve();
    assert.include(el.shadowRoot!.innerHTML, 'Eager');
  });

  test('renders on the task queue', async () => {
    container.innerHTML = `<test-element></test-element>`;
    const el = container.querySelector('test-element') as TestElement;

    // Wait for the microtask queue to clear, when LitElement would normally
    // have rendered
    await Promise.resolve();
    assert.equal(el.shadowRoot!.innerHTML, '');

    // Wait for a task and check that something rendered
    await new Promise((r) => setTimeout(r));
    assert.include(el.shadowRoot!.innerHTML, 'Hello');

    el.name = "Lazy";
    await Promise.resolve();
    assert.notInclude(el.shadowRoot!.innerHTML, 'Lazy');
    await new Promise((r) => setTimeout(r));
    assert.include(el.shadowRoot!.innerHTML, 'Lazy');
  });

  test('updateComplete resolves on the task queue', async () => {
    container.innerHTML = `<test-element></test-element>`;
    const el = container.querySelector('test-element') as TestElement;

    // A render is now enqued. If we shedule a microtask, it should resolve
    // before updateComplete does on the task queue;
    let microtaskComplete = false;
    Promise.resolve().then(() => {
      microtaskComplete = true;
    })
    await el.updateComplete;

    assert.isTrue(microtaskComplete);
  });

  test('requestUrgentUpdate before performUpdate', async () => {
    container.innerHTML = `<test-element></test-element>`;
    const el = container.querySelector('test-element') as TestElement;
    el.name = 'Urgent';
    el.requestUrgentUpdate();

    // Rendering should happen before a task
    await Promise.resolve();

    assert.include(el.shadowRoot!.innerHTML, 'Urgent');
  });

  test('requestUrgentUpdate after performUpdate', async () => {
    container.innerHTML = `<test-element></test-element>`;
    const el = container.querySelector('test-element') as TestElement;
    el.name = 'Urgent';

    // performUpdate will be called after this, so there will be a task
    // enqueued
    await Promise.resolve();
    el.requestUrgentUpdate();

    // Rendering should happen before a task
    await Promise.resolve();
    assert.include(el.shadowRoot!.innerHTML, 'Urgent');
  });


});
