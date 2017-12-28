var customAppLayout = (function () {
'use strict';

const replaceAccents = string => {
  if (string.search(/[\xC0-\xFF]/g) > -1) {
    string = string.replace(/[\xC0-\xC5]/g, "A").replace(/[\xC6]/g, "AE").replace(/[\xC7]/g, "C").replace(/[\xC8-\xCB]/g, "E").replace(/[\xCC-\xCF]/g, "I").replace(/[\xD0]/g, "D").replace(/[\xD1]/g, "N").replace(/[\xD2-\xD6\xD8]/g, "O").replace(/[\xD9-\xDC]/g, "U").replace(/[\xDD]/g, "Y").replace(/[\xDE]/g, "P").replace(/[\xE0-\xE5]/g, "a").replace(/[\xE6]/g, "ae").replace(/[\xE7]/g, "c").replace(/[\xE8-\xEB]/g, "e").replace(/[\xEC-\xEF]/g, "i").replace(/[\xF1]/g, "n").replace(/[\xF2-\xF6\xF8]/g, "o").replace(/[\xF9-\xFC]/g, "u").replace(/[\xFE]/g, "p").replace(/[\xFD\xFF]/g, "y");
  }
  return string;
};
const removeNonWord = string => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');
const WHITE_SPACES = [' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F', '\u3000'];
const ltrim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  var start = 0,
      len = string.length,
      charLen = chars.length,
      found = true,
      i,
      c;
  while (found && start < len) {
    found = false;
    i = -1;
    c = string.charAt(start);
    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        start++;
        break;
      }
    }
  }
  return start >= len ? '' : string.substr(start, len);
};
const rtrim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  var end = string.length - 1,
      charLen = chars.length,
      found = true,
      i,
      c;
  while (found && end >= 0) {
    found = false;
    i = -1;
    c = string.charAt(end);
    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        end--;
        break;
      }
    }
  }
  return end >= 0 ? string.substring(0, end + 1) : '';
};
const unCamelCase = string => {
  string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
  string = string.toLowerCase();
  return string;
};
const trim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
};
const slugify = (string, delimeter) => {
  if (delimeter == null) {
    delimeter = "-";
  }
  string = replaceAccents(string);
  string = removeNonWord(string);
  string = trim(string)
  .replace(/ +/g, delimeter)
  .toLowerCase();
  return string;
};
const hyphenate = string => {
  string = unCamelCase(string);
  return slugify(string, "-");
};
const merge = (object = {}, source = {}) => {
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
};


let sheduled = false;
const afterRenderQue = [];
const beforeRenderQue = [];
const callMethod = array => {
  const context = array[0];
  const callback = array[1];
  const args = array[2];
  try {
    callback.apply(context, args);
  } catch (e) {
    setTimeout(() => {
      throw e;
    });
  }
};
const flushQue = que => {
  while (que.length) {
    callMethod(que.shift);
  }
};
const runQue = que => {
  for (let i = 0, l = que.length; i < l; i++) {
    callMethod(que.shift());
  }
  sheduled = false;
};
const shedule = () => {
  sheduled = true;
  requestAnimationFrame(() => {
    flushQue(beforeRenderQue);
    setTimeout(() => {
      runQue(afterRenderQue);
    });
  });
};
const RenderStatus = (() => {
  window.RenderStatus = window.RenderStatus || {
    afterRender: (context, callback, args) => {
      if (!sheduled) {
        shedule();
      }
      afterRenderQue.push([context, callback, args]);
    },
    beforeRender: (context, callback, args) => {
      if (!sheduled) {
        shedule();
      }
      beforeRenderQue.push([context, callback, args]);
    }
  };
})();
const shouldRegister = name => {
  return customElements.get(name) ? false : true;
};
const define = klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
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
const templates = new Map();
function html$1(strings, ...values) {
    let template = templates.get(strings);
    if (template === undefined) {
        template = new Template(strings);
        templates.set(strings, template);
    }
    return new TemplateResult(template, values);
}
class TemplateResult {
    constructor(template, values) {
        this.template = template;
        this.values = values;
    }
}
function render(result, container) {
    let instance = container.__templateInstance;
    if (instance !== undefined && instance.template === result.template && instance instanceof TemplateInstance) {
        instance.update(result.values);
        return;
    }
    instance = new TemplateInstance(result.template);
    container.__templateInstance = instance;
    const fragment = instance._clone();
    instance.update(result.values);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(fragment);
}
const exprMarker = '{{}}';
class TemplatePart {
    constructor(type, index, name, rawName, strings) {
        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    }
}
class Template {
    constructor(strings) {
        this.parts = [];
        this._strings = strings;
        this._parse();
    }
    _parse() {
        this.element = document.createElement('template');
        this.element.innerHTML = this._getTemplateHtml(this._strings);
        const walker = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const attributesToRemove = [];
        while (walker.nextNode()) {
            index++;
            const node = walker.currentNode;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes.item(i);
                    const value = attribute.value;
                    const strings = value.split(exprMarker);
                    if (strings.length > 1) {
                        const attributeString = this._strings[partIndex];
                        const rawNameString = attributeString.substring(0, attributeString.length - strings[0].length);
                        const match = rawNameString.match(/((?:\w|[.\-_$])+)=["']?$/);
                        const rawName = match[1];
                        this.parts.push(new TemplatePart('attribute', index, attribute.name, rawName, strings));
                        attributesToRemove.push(attribute);
                        partIndex += strings.length - 1;
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const strings = node.nodeValue.split(exprMarker);
                if (strings.length > 1) {
                    partIndex += strings.length - 1;
                    for (let i = 0; i < strings.length; i++) {
                        const string = strings[i];
                        const literalNode = new Text(string);
                        node.parentNode.insertBefore(literalNode, node);
                        index++;
                        if (i < strings.length - 1) {
                            node.parentNode.insertBefore(new Text(), node);
                            node.parentNode.insertBefore(new Text(), node);
                            this.parts.push(new TemplatePart('node', index));
                            index += 2;
                        }
                    }
                    index--;
                    nodesToRemove.push(node);
                } else if (!node.nodeValue.trim()) {
                    nodesToRemove.push(node);
                    index--;
                }
            }
        }
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
        for (const a of attributesToRemove) {
            a.ownerElement.removeAttribute(a.name);
        }
    }
    _getTemplateHtml(strings) {
        const parts = [];
        for (let i = 0; i < strings.length; i++) {
            parts.push(strings[i]);
            if (i < strings.length - 1) {
                parts.push(exprMarker);
            }
        }
        return parts.join('');
    }
}
class Part {
    constructor(instance) {
        this.instance = instance;
    }
    _getValue(value) {
        if (typeof value === 'function') {
            try {
                value = value(this);
            } catch (e) {
                console.error(e);
                return;
            }
        }
        if (value === null) {
            return undefined;
        }
        return value;
    }
}
class AttributePart extends Part {
    constructor(instance, element, name, strings) {
        super(instance);
        console.assert(element.nodeType === Node.ELEMENT_NODE);
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(values) {
        const strings = this.strings;
        let text = '';
        for (let i = 0; i < strings.length; i++) {
            text += strings[i];
            if (i < strings.length - 1) {
                const v = this._getValue(values[i]);
                if (v && typeof v !== 'string' && v[Symbol.iterator]) {
                    for (const t of v) {
                        text += t;
                    }
                } else {
                    text += v;
                }
            }
        }
        this.element.setAttribute(this.name, text);
    }
    get size() {
        return this.strings.length - 1;
    }
}
class NodePart extends Part {
    constructor(instance, startNode, endNode) {
        super(instance);
        this.startNode = startNode;
        this.endNode = endNode;
    }
    setValue(value) {
        value = this._getValue(value);
        if (value instanceof Node) {
            this._previousValue = this._setNodeValue(value);
        } else if (value instanceof TemplateResult) {
            this._previousValue = this._setTemplateResultValue(value);
        } else if (value && value.then !== undefined) {
            value.then(v => {
                if (this._previousValue === value) {
                    this.setValue(v);
                }
            });
            this._previousValue = value;
        } else if (value && typeof value !== 'string' && value[Symbol.iterator]) {
            this._previousValue = this._setIterableValue(value);
        } else if (this.startNode.nextSibling === this.endNode.previousSibling && this.startNode.nextSibling.nodeType === Node.TEXT_NODE) {
            this.startNode.nextSibling.textContent = value;
            this._previousValue = value;
        } else {
            this._previousValue = this._setTextValue(value);
        }
    }
    _insertNodeBeforeEndNode(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _setNodeValue(value) {
        this.clear();
        this._insertNodeBeforeEndNode(value);
        return value;
    }
    _setTextValue(value) {
        return this._setNodeValue(new Text(value));
    }
    _setTemplateResultValue(value) {
        let instance;
        if (this._previousValue && this._previousValue._template === value.template) {
            instance = this._previousValue;
        } else {
            instance = this.instance._createInstance(value.template);
            this._setNodeValue(instance._clone());
        }
        instance.update(value.values);
        return instance;
    }
    _setIterableValue(value) {
        let itemStart = this.startNode;
        let itemEnd;
        const values = value[Symbol.iterator]();
        const previousParts = Array.isArray(this._previousValue) ? this._previousValue : undefined;
        let previousPartsIndex = 0;
        const itemParts = [];
        let current = values.next();
        let next = values.next();
        if (current.done) {
            this.clear();
        }
        while (!current.done) {
            let itemPart;
            if (previousParts !== undefined && previousPartsIndex < previousParts.length) {
                itemPart = previousParts[previousPartsIndex++];
                if (next.done && itemPart.endNode !== this.endNode) {
                    this.clear(itemPart.endNode.previousSibling);
                    itemPart.endNode = this.endNode;
                }
                itemEnd = itemPart.endNode;
            } else {
                if (next.done) {
                    itemEnd = this.endNode;
                } else {
                    itemEnd = new Text();
                    this._insertNodeBeforeEndNode(itemEnd);
                }
                itemPart = new NodePart(this.instance, itemStart, itemEnd);
            }
            itemPart.setValue(current.value);
            itemParts.push(itemPart);
            current = next;
            next = values.next();
            itemStart = itemEnd;
        }
        return itemParts;
    }
    clear(startNode = this.startNode) {
        this._previousValue = undefined;
        let node = startNode.nextSibling;
        while (node !== null && node !== this.endNode) {
            let next = node.nextSibling;
            node.parentNode.removeChild(node);
            node = next;
        }
    }
}
class TemplateInstance {
    constructor(template) {
        this._parts = [];
        this._template = template;
    }
    get template() {
        return this._template;
    }
    update(values) {
        let valueIndex = 0;
        for (const part of this._parts) {
            if (part.size === undefined) {
                part.setValue(values[valueIndex++]);
            } else {
                part.setValue(values.slice(valueIndex, valueIndex + part.size));
                valueIndex += part.size;
            }
        }
    }
    _clone() {
        const fragment = document.importNode(this._template.element.content, true);
        if (this._template.parts.length > 0) {
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
            const parts = this._template.parts;
            let index = 0;
            let partIndex = 0;
            let templatePart = parts[0];
            let node = walker.nextNode();
            while (node != null && partIndex < parts.length) {
                if (index === templatePart.index) {
                    this._parts.push(this._createPart(templatePart, node));
                    templatePart = parts[++partIndex];
                } else {
                    index++;
                    node = walker.nextNode();
                }
            }
        }
        return fragment;
    }
    _createPart(templatePart, node) {
        if (templatePart.type === 'attribute') {
            return new AttributePart(this, node, templatePart.name, templatePart.strings);
        } else if (templatePart.type === 'node') {
            return new NodePart(this, node, node.nextSibling);
        } else {
            throw new Error(`unknown part type: ${templatePart.type}`);
        }
    }
    _createInstance(template) {
        return new TemplateInstance(template);
    }
}

window.html = window.html || html$1;
window.Backed = window.Backed || {};
window.Backed.Renderer = window.Backed.Renderer || render;
var LitMixin = (base => {
  return class LitMixin extends base {
    constructor(options = {}) {
      super(options);
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._isValidRenderer(this.render);
    }
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.render) render(this.render(), this.shadowRoot);
    }
    _isValidRenderer(renderer) {
      if (!renderer) {
        throw 'Missing render method!';
        return;
      }
      if (!String(renderer).includes('return html`') && !String(renderer).includes('template')) {
        throw 'Invalid renderer!';
      }
    }
  };
});

window.Backed = window.Backed || {};
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();
const render$1 = window.Backed.Renderer;
var PropertyMixin = (base => {
  return class PropertyMixin extends base {
    static get observedAttributes() {
      return Object.entries(this.properties).map(entry => {
        if (entry[1].reflect) {
          return entry[0];
        } else return null;
      });
    }
    get properties() {
      return customElements.get(this.localName).properties;
    }
    constructor() {
      super();
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          const { observer, reflect, renderer } = entry[1];
          if (observer || reflect || renderer) {
            if (renderer && !render$1) {
              console.warn('Renderer undefined');
            }
          }
          this.defineProperty(entry[0], entry[1]);
        }
      }
    }
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.attributes) for (const attribute of this.attributes) {
        if (String(attribute.name).includes('on-')) {
          const fn = attribute.value;
          const name = attribute.name.replace('on-', '');
          target.addEventListener(String(name), event => {
            target = event.path[0];
            while (!target.host) {
              target = target.parentNode;
            }
            if (target.host[fn]) {
              target.host[fn](event);
            }
          });
        }
      }
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }
    defineProperty(property = null, { strict = false, observer, reflect = false, renderer, value }) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;
          if (reflect) {
            if (value) this.setAttribute(property, String(value));else this.removeAttribute(property);
          }
          if (observer) {
            if (observer in this) this[observer]();else console.warn(`observer::${observer} undefined`);
          }
          if (renderer) {
            if (renderer in this) render$1(this[renderer](), this.shadowRoot);else console.warn(`renderer::${renderer} undefined`);
          }
        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  };
});

var CustomEffects = (base => class CustomEffects extends base {
  get effects() {
    return customElements.get(this.localName).effects;
  }
  constructor() {
    super();
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.effects) {
      for (const effect of this.effects) {
        this._initEffect(effect);
      }
    }
  }
  _initEffect(effect) {
    if (typeof effect === 'string') {
      effect = [effect, effect === 'resize' || effect === 'scroll' ? window : this];
    }
    return new Promise((resolve, reject) => {
      effect[1].addEventListener(effect[0], event => {
        const func = effect[0].slice(0, 1).toUpperCase() + effect[0].slice(1);
        if (this[`on${func}`]) {
          this[`on${func}`](event);
        } else {
          console.warn(`on${func} method missing`);
        }
      });
    });
  }
});

let sheduled$1 = false;
const afterRenderQue$1 = [];
const beforeRenderQue$1 = [];
const callMethod$1 = array => {
  const context = array[0];
  const callback = array[1];
  const args = array[2];
  try {
    callback.apply(context, args);
  } catch (e) {
    setTimeout(() => {
      throw e;
    });
  }
};
const flushQue$1 = que => {
  while (que.length) {
    callMethod$1(que.shift);
  }
};
const runQue$1 = que => {
  for (let i = 0, l = que.length; i < l; i++) {
    callMethod$1(que.shift());
  }
  sheduled$1 = false;
};
const shedule$1 = () => {
  sheduled$1 = true;
  requestAnimationFrame(() => {
    flushQue$1(beforeRenderQue$1);
    setTimeout(() => {
      runQue$1(afterRenderQue$1);
    });
  });
};
var RenderStatus$1 = {
  afterRender: (context, callback, args) => {
    if (!sheduled$1) {
      shedule$1();
    }
    afterRenderQue$1.push([context, callback, args]);
  },
  beforeRender: (context, callback, args) => {
    if (!sheduled$1) {
      shedule$1();
    }
    beforeRenderQue$1.push([context, callback, args]);
  }
};

var customAppLayout = define(class CustomAppLayout extends PropertyMixin(LitMixin(CustomEffects(HTMLElement))) {
  static get properties() {
    return merge(super.properties, {
      firstRender: { value: true, observer: 'onResize' },
      headerMarginTop: { value: '', renderer: 'render' },
      headerPaddingTop: { value: '', renderer: 'render' }
    });
  }
  static get effects() {
    return ['resize'];
  }
  constructor() {
    super();
  }
  slotted(slot) {
    slot = slot.assignedNodes();
    if (slot[0] && slot[0].localName === 'slot') {
      return this.slotted(slot[0]);
    } else {
      for (const node of slot) {
        if (node.nodeType === 1) {
          this.__nodeList.push(node);
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
      RenderStatus$1.afterRender(this, () => {
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
      });
    }
  }
  render() {
    if (this.firstRender) {
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

return customAppLayout;

}());
//# sourceMappingURL=custom-app-layout.js.map
