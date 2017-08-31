import LitMixin from './../backed/mixins/lit-mixin.js';
import PropertyMixin from './../backed/mixins/property-mixin.js';

/**
 * @example
 * <custom-app-layout>
 *   <header slot="header" fixed></header>
 *   <section slot="content"></section> // appears under the header
 * </custom-app-layout>
 * @extends LitMixin, PropertyMixin, HTMLElement
 */
class CustomAppLayout extends LitMixin(PropertyMixin(HTMLElement)) {
  /**
   * @param {object} options contains properties, observers, listeners, etc...
   */
  constructor(options = {properties: {}}) {
    const properties = {
      firstRender: {value: true, renderer: 'render'},
      headerMarginTop: {value: '', renderer: 'render'},
      headerPaddingTop: {value: '', renderer: 'render'}
    }
    Object.assign(options.properties, properties); // merge properties

    super(options);
  }
  // iterate trough slots untill no slot is found
  slotted(slot) {
    slot = slot.assignedNodes()
    if (slot[0].localName === 'slot') {
      return this.slotted(slot[0]);
    } else {
      for (const node of slot) {
        if (node.nodeType === 1) {
          return node
        }
      }
    }
    return slot;
  }

  get content() {
    return this.slotted(this.shadowRoot.querySelector('slot[name="content"]'));
  }

  get header() {
    return this.slotted(this.shadowRoot.querySelector('slot[name="header"]'));
  }

  get container() {
    return this.shadowRoot.querySelector('.content-container');
  }

  render() {
    if (this.firstRender === false) { // do nothing on firstRender
      const header = this.header;
      const headerHeight = header.offsetHeight;
      if (header.hasAttribute('fixed') && !header.hasAttribute('condenses')) {
        // If the header size does not change and we're using a scrolling region, exclude
        // the header area from the scrolling region so that the header doesn't overlap
        // the scrollbar.
        requestAnimationFrame(() => {
          this.headerMarginTop = headerHeight + 'px';
          this.headerPaddingTop = '';
        });
      } else {
        requestAnimationFrame(() => {
          this.headerPaddingTop = headerHeight + 'px';
          this.headerMarginTop = '';
        });
      }
    } else {
      this.firstRender = false;
    }
    return html`
      <style>
        :host {
          display: block;
          position: relative;
          height: 100%;
          z-index: 0;
          display: flex;
          flex-direction: column;
        }
        :host([fullbleed]) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        ::slotted([slot="header"]) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1;
        }
        .content-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          flex: 1;
          flex-direction: column;
          z-index: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      </style>
      <slot name="header"></slot>
      <span class="content-container" style="margin-top: ${this.headerMarginTop}; padding-top: ${this.headerPaddingTop};">
        <slot name="content"></slot>
      </span>
    `;
  }
};

export default customElements.define('custom-app-layout', CustomAppLayout);
