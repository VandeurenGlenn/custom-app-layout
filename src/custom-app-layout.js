import LitMixin from './../../backed/mixins/lit-mixin.min.js';
import PropertyMixin from './../../backed/mixins/property-mixin.min.js';
import CustomEffects from './../../custom-effects/src/custom-effects.js';
import merge from './../../lodash-es/merge.js';
import RenderStatus from './../../backed/src/internals/render-status.js'

/**
 * @example
 * <custom-app-layout>
 *   <header slot="header" fixed></header>
 *   <section slot="content"></section> // appears under the header
 * </custom-app-layout>
 * @extends LitMixin, PropertyMixin, HTMLElement
 */
class CustomAppLayout extends CustomEffects(LitMixin(PropertyMixin(HTMLElement))) {
  /**
   * @param {object} options contains properties, observers, listeners, etc...
   */
  constructor(options = {properties: {}, effects: []}) {
    const properties = {
      firstRender: {value: true, observer: 'onResize'},
      headerMarginTop: {value: '', renderer: 'render'},
      headerPaddingTop: {value: '', renderer: 'render'}
    }
    merge(options.properties, properties); // merge properties

    const effects = ['resize'];
    merge(options.effects, effects);
    super(options);
  }
  // iterate trough slots untill no slot is found
  slotted(slot) {
    slot = slot.assignedNodes();
    if (slot[0] && slot[0].localName === 'slot') {
      return this.slotted(slot[0]);
    } else {
      for (const node of slot) {
        if (node.nodeType === 1) {
          this.__nodeList.push(node)
        }
      }
      if (this.__nodeList.length !== 0) return this.__nodeList;
    }
    return [slot];
  }

  get headers() {
    this.__nodeList = [];
    return this.slotted(this.shadowRoot.querySelector('slot[name="header"]'));
  }

  get container() {
    return this.shadowRoot.querySelector('.content-container');
  }

  onResize() {
    if (!this.firstRender) {
      RenderStatus.afterRender(this, () => {
        const headers = this.headers;
        console.log(this.headers);
        let offsetHeight = 0;
        if (headers.length !== 0) {
          for (const header of headers) {
            offsetHeight += header.offsetHeight;
          }
        } else {
          offsetHeight = headers[0].offsetHeight;
        }
        if (headers[0].hasAttribute('fixed') && !headers[0].hasAttribute('condenses')) {
          // If the header size does not change and we're using a scrolling region, exclude
          // the header area from the scrolling region so that the header doesn't overlap
          // the scrollbar.
          requestAnimationFrame(() => {
            this.headerMarginTop = offsetHeight + 'px';
            this.headerPaddingTop = '';
          });
        } else {
          requestAnimationFrame(() => {
            this.headerPaddingTop = offsetHeight + 'px';
            this.headerMarginTop = '';
          });
        }
      })
    }
  }

  render() {
    if (this.firstRender) { // do nothing on firstRender
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
        :host:not([fixed]) ::slotted([slot="header"]) {
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
