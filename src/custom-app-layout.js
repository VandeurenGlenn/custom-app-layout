import { define, merge } from './../../backed/src/utils';
import LitMixin from './../../backed/src/mixins/lit-mixin.js';
import PropertyMixin from './../../backed/src/mixins/property-mixin.js';
import CustomEffects from './../../custom-effects/src/custom-effects.js';
import RenderStatus from './../../backed/src/internals/render-status.js';

/**
 * @example
 * <custom-app-layout>
 *   <header slot="header" fixed></header>
 *   <section slot="content"></section> // appears under the header
 * </custom-app-layout>
 * @extends LitMixin, PropertyMixin, HTMLElement
 */
export default define(class CustomAppLayout extends PropertyMixin(LitMixin(CustomEffects(HTMLElement))) {
  /**
   * @return {object}
   */
  static get properties() {
    return merge(super.properties, {
      firstRender: {value: true, observer: 'onResize'},
      headerMarginTop: {value: '', renderer: 'render'},
      headerPaddingTop: {value: '', renderer: 'render'}
    });
  }

  /**
   * @return {array} [effects]
   */
  static get effects() {
    return ['resize'];
  }

  /**
   * calls super
   */
  constructor() {
    super();
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
});
