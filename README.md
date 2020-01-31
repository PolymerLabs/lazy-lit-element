# LazyLitElement

**Experimental**

LazyLitElement erformss updates and renders on the browser's task queue, rather than the microtask queue. This makes rendering non-blocking to other tasks such as event handling, layout, paint, etc.
 
Using LazyLitElement for lower priority and/or high-rendering-cost elements that don't need to have updates rendered synchronously with each frame can improve the responsiveness of the page it's on.

### Example

Use LazyLitElement just like LitElement:

```ts
import {LazyLitElement, customElement, property, html, LitElement} from '../lazy-lit-element';

@customElement('my-lazy-element')
export class MyLazyElement extends LazyLitElement {
  @property() name?: string;

  render() {
    return html`<h1>Hello ${this.name}</h1>`;
  }
}
```

You can force urgent updates with `requestUrgentUpdate()`:

```ts
@customElement('my-lazy-element')
export class MyLazyElement extends LazyLitElement {
  @property() name?: string;

  private _onClick() {
    this.requestUrgentUpdate();
  }

  render() {
    return html`
      <h1>Hello ${this.name}</h1>
      <button @click=${this._onClick}>Urgent</button>
    `;
  }
}
```
