var customAppLayout = (function () {
'use strict';

function html$1(e, ...t) {
  let s = templates.get(e);return void 0 === s && (s = new Template(e), templates.set(e, s)), new TemplateResult(s, t);
}function render(e, t) {
  let s = t.__templateInstance;if (void 0 !== s && s.template === e.template && s instanceof TemplateInstance) return void s.update(e.values);s = new TemplateInstance(e.template), t.__templateInstance = s;const n = s._clone();for (s.update(e.values); t.firstChild;) t.removeChild(t.firstChild);t.appendChild(n);
}const templates = new Map();class TemplateResult {
  constructor(e, t) {
    this.template = e, this.values = t;
  }
}const exprMarker = "{{}}";class TemplatePart {
  constructor(e, t, s, n, r) {
    this.type = e, this.index = t, this.name = s, this.rawName = n, this.strings = r;
  }
}class Template {
  constructor(e) {
    this.parts = [], this._strings = e, this._parse();
  }_parse() {
    this.element = document.createElement("template"), this.element.innerHTML = this._getTemplateHtml(this._strings);const e = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);let t = -1,
        s = 0;const n = [],
          r = [];for (; e.nextNode();) {
      t++;const i = e.currentNode;if (i.nodeType === Node.ELEMENT_NODE) {
        const e = i.attributes;for (let n = 0; n < e.length; n++) {
          const i = e.item(n),
                o = i.value.split(exprMarker);if (o.length > 1) {
            const e = this._strings[s],
                  n = e.substring(0, e.length - o[0].length).match(/((?:\w|[.\-_$])+)=["']?$/)[1];this.parts.push(new TemplatePart("attribute", t, i.name, n, o)), r.push(i), s += o.length - 1;
          }
        }
      } else if (i.nodeType === Node.TEXT_NODE) {
        const e = i.nodeValue.split(exprMarker);if (e.length > 1) {
          s += e.length - 1;for (let s = 0; s < e.length; s++) {
            const n = e[s],
                  r = new Text(n);i.parentNode.insertBefore(r, i), t++, s < e.length - 1 && (i.parentNode.insertBefore(new Text(), i), i.parentNode.insertBefore(new Text(), i), this.parts.push(new TemplatePart("node", t)), t += 2);
          }t--, n.push(i);
        } else i.nodeValue.trim() || (n.push(i), t--);
      }
    }for (const e of n) e.parentNode.removeChild(e);for (const e of r) e.ownerElement.removeAttribute(e.name);
  }_getTemplateHtml(e) {
    const t = [];for (let s = 0; s < e.length; s++) t.push(e[s]), s < e.length - 1 && t.push(exprMarker);return t.join("");
  }
}class Part {
  constructor(e) {
    this.instance = e;
  }_getValue(e) {
    if ("function" == typeof e) try {
      e = e(this);
    } catch (e) {
      return void console.error(e);
    }if (null !== e) return e;
  }
}class AttributePart extends Part {
  constructor(e, t, s, n) {
    super(e), console.assert(t.nodeType === Node.ELEMENT_NODE), this.element = t, this.name = s, this.strings = n;
  }setValue(e) {
    const t = this.strings;let s = "";for (let n = 0; n < t.length; n++) if (s += t[n], n < t.length - 1) {
      const t = this._getValue(e[n]);if (t && "string" != typeof t && t[Symbol.iterator]) for (const e of t) s += e;else s += t;
    }this.element.setAttribute(this.name, s);
  }get size() {
    return this.strings.length - 1;
  }
}class NodePart extends Part {
  constructor(e, t, s) {
    super(e), this.startNode = t, this.endNode = s;
  }setValue(e) {
    (e = this._getValue(e)) instanceof Node ? this._previousValue = this._setNodeValue(e) : e instanceof TemplateResult ? this._previousValue = this._setTemplateResultValue(e) : e && void 0 !== e.then ? (e.then(t => {
      this._previousValue === e && this.setValue(t);
    }), this._previousValue = e) : e && "string" != typeof e && e[Symbol.iterator] ? this._previousValue = this._setIterableValue(e) : this.startNode.nextSibling === this.endNode.previousSibling && this.startNode.nextSibling.nodeType === Node.TEXT_NODE ? (this.startNode.nextSibling.textContent = e, this._previousValue = e) : this._previousValue = this._setTextValue(e);
  }_insertNodeBeforeEndNode(e) {
    this.endNode.parentNode.insertBefore(e, this.endNode);
  }_setNodeValue(e) {
    return this.clear(), this._insertNodeBeforeEndNode(e), e;
  }_setTextValue(e) {
    return this._setNodeValue(new Text(e));
  }_setTemplateResultValue(e) {
    let t;return this._previousValue && this._previousValue._template === e.template ? t = this._previousValue : (t = this.instance._createInstance(e.template), this._setNodeValue(t._clone())), t.update(e.values), t;
  }_setIterableValue(e) {
    let t,
        s = this.startNode;const n = e[Symbol.iterator](),
          r = Array.isArray(this._previousValue) ? this._previousValue : void 0;let i = 0;const o = [];let a = n.next(),
        l = n.next();for (a.done && this.clear(); !a.done;) {
      let e;void 0 !== r && i < r.length ? (e = r[i++], l.done && e.endNode !== this.endNode && (this.clear(e.endNode.previousSibling), e.endNode = this.endNode), t = e.endNode) : (l.done ? t = this.endNode : (t = new Text(), this._insertNodeBeforeEndNode(t)), e = new NodePart(this.instance, s, t)), e.setValue(a.value), o.push(e), a = l, l = n.next(), s = t;
    }return o;
  }clear(e = this.startNode) {
    this._previousValue = void 0;let t = e.nextSibling;for (; null !== t && t !== this.endNode;) {
      let e = t.nextSibling;t.parentNode.removeChild(t), t = e;
    }
  }
}class TemplateInstance {
  constructor(e) {
    this._parts = [], this._template = e;
  }get template() {
    return this._template;
  }update(e) {
    let t = 0;for (const s of this._parts) void 0 === s.size ? s.setValue(e[t++]) : (s.setValue(e.slice(t, t + s.size)), t += s.size);
  }_clone() {
    const e = document.importNode(this._template.element.content, !0);if (this._template.parts.length > 0) {
      const t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT),
            s = this._template.parts;let n = 0,
          r = 0,
          i = s[0],
          o = t.nextNode();for (; null != o && r < s.length;) n === i.index ? (this._parts.push(this._createPart(i, o)), i = s[++r]) : (n++, o = t.nextNode());
    }return e;
  }_createPart(e, t) {
    if ("attribute" === e.type) return new AttributePart(this, t, e.name, e.strings);if ("node" === e.type) return new NodePart(this, t, t.nextSibling);throw new Error(`unknown part type: ${e.type}`);
  }_createInstance(e) {
    return new TemplateInstance(e);
  }
}window.html = window.html || html$1, window.Backed = window.Backed || {}, window.Backed.Renderer = window.Backed.Renderer || render;var litMixin$1 = e => class t extends e {
  get propertyStore() {
    return window.Backed.PropertyStore;
  }constructor(e = {}) {
    if (super(e), this.attachShadow({ mode: "open" }), !this._isValidRenderer(this.render)) throw "Invalid renderer!";if (!this.render) throw "Missing render method!";render(this.render(), this.shadowRoot);
  }_isValidRenderer(e) {
    if (e) return String(e).includes("return html`");
  }
};

window.Backed = window.Backed || {}, window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();const render$1 = window.Backed.Renderer;var propertyMixin$1 = e => class r extends e {
  constructor(e = {}) {
    super(e), this.properties = e.properties;
  }connectedCallback() {
    if (this.properties) for (const e of Object.entries(this.properties)) {
      const { observer: r, reflect: t, renderer: i } = e[1];(r || t || i) && (i && !render$1 && console.warn("Renderer undefined"), this.defineProperty(e[0], e[1]));
    }
  }defineProperty(e = null, { strict: r = !1, observer: t, reflect: i = !1, renderer: n, value: s }) {
    Object.defineProperty(this, e, { set(r) {
        r !== this[`___${e}`] && (this[`___${e}`] = r, i && (r ? this.setAttributte(e, String(r)) : this.removeAttribute(e)), t && (t in this ? this[t]() : console.warn(`observer::${t} undefined`)), n && (n in this ? render$1(this[n](), this.shadowRoot) : console.warn(`renderer::${n} undefined`)));
      }, get() {
        return this[`___${e}`];
      }, configurable: !r });const o = this.getAttribute(e);this[e] = o || this.hasAttribute(e) || s;
  }
};

class CustomAppLayout extends litMixin$1(propertyMixin$1(HTMLElement)) {
  constructor(options = { properties: {} }) {
    const properties = {
      firstRender: { value: true, renderer: 'render' },
      headerMarginTop: { value: '', renderer: 'render' },
      headerPaddingTop: { value: '', renderer: 'render' }
    };
    Object.assign(options.properties, properties);
    super(options);
  }
  slotted(slot) {
    slot = slot.assignedNodes();
    if (slot[0].localName === 'slot') {
      return this.slotted(slot[0]);
    } else {
      for (const node of slot) {
        if (node.nodeType === 1) {
          return node;
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
    if (this.firstRender === false) {
      const header = this.header;
      const headerHeight = header.offsetHeight;
      if (header.hasAttribute('fixed') && !header.hasAttribute('condenses')) {
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
}
var customAppLayout = customElements.define('custom-app-layout', CustomAppLayout);

return customAppLayout;

}());
//# sourceMappingURL=custom-app-layout.js.map
