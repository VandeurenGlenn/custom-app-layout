var customAppLayout = (function () {
'use strict';

function html$1(e, ...t) {
  let n = templates.get(e);return void 0 === n && (n = new Template(e), templates.set(e, n)), new TemplateResult(n, t);
}function render(e, t) {
  let n = t.__templateInstance;if (void 0 !== n && n.template === e.template && n instanceof TemplateInstance) return void n.update(e.values);n = new TemplateInstance(e.template), t.__templateInstance = n;const s = n._clone();for (n.update(e.values); t.firstChild;) t.removeChild(t.firstChild);t.appendChild(s);
}function repeat(e, t, n) {
  let s;return 2 === arguments.length ? n = t : 3 === arguments.length && (s = t), t => {
    let r = stateCache.get(t);void 0 === r && (r = { keyMap: s && new Map(), parts: [] }, stateCache.set(t, r));const o = t.startNode.parentNode,
          i = r.parts,
          a = new Map(i.map(e => [e.endNode, e])),
          l = r.keyMap,
          d = [];let h,
        u = 0,
        p = 0;for (const r of e) {
      let e, c;try {
        e = n(r, u++), c = s && s(r);
      } catch (e) {
        console.error(e);continue;
      }let N = void 0 == l ? i[p++] : l.get(c);if (void 0 === N) {
        void 0 === h && (h = new Text(), o.insertBefore(h, t.startNode.nextSibling));const e = new Text();o.insertBefore(e, h.nextSibling), N = new NodePart(t.instance, h, e), void 0 !== c && void 0 !== l && l.set(c, N);
      } else {
        const e = document.createRange();if (e.setStartBefore(N.startNode), e.setEndBefore(N.endNode), void 0 === h) {
          if (t.startNode.nextSibling !== N.startNode) {
            const n = a.get(N.startNode);n && (n.endNode = N.endNode, a.set(n.endNode, n));const s = e.extractContents();t.startNode.nextSibling === t.endNode ? (N.endNode = new Text(), o.insertBefore(N.endNode, t.startNode.nextSibling)) : N.endNode = t.startNode.nextSibling, o.insertBefore(s, t.startNode.nextSibling);
          }
        } else if (h !== N.startNode) {
          const t = a.get(N.startNode);t && (t.endNode = N.endNode, a.set(t.endNode, t));const n = e.extractContents();o.insertBefore(n, h);
        }i.splice(i.indexOf(N), 1);
      }N.setValue(e), d.push(N), h = N.endNode;
    }if (i.length > 0) {
      const e = i[0].startNode,
            t = i[i.length - 1].endNode,
            n = document.createRange();0 === d.length ? n.setStartBefore(e) : n.setStartAfter(e), n.setEndAfter(t), n.deleteContents(), n.detach();
    }r.parts = d;
  };
}const templates = new Map();class TemplateResult {
  constructor(e, t) {
    this.template = e, this.values = t;
  }
}const exprMarker = "{{}}";class TemplatePart {
  constructor(e, t, n, s, r) {
    this.type = e, this.index = t, this.name = n, this.rawName = s, this.strings = r;
  }
}class Template {
  constructor(e) {
    this.parts = [], this._strings = e, this._parse();
  }_parse() {
    this.element = document.createElement("template"), this.element.innerHTML = this._getTemplateHtml(this._strings);const e = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);let t = -1,
        n = 0;const s = [],
          r = [];for (; e.nextNode();) {
      t++;const o = e.currentNode;if (o.nodeType === Node.ELEMENT_NODE) {
        const e = o.attributes;for (let s = 0; s < e.length; s++) {
          const o = e.item(s),
                i = o.value.split(exprMarker);if (i.length > 1) {
            const e = this._strings[n],
                  s = e.substring(0, e.length - i[0].length).match(/((?:\w|[.\-_$])+)=["']?$/)[1];this.parts.push(new TemplatePart("attribute", t, o.name, s, i)), r.push(o), n += i.length - 1;
          }
        }
      } else if (o.nodeType === Node.TEXT_NODE) {
        const e = o.nodeValue.split(exprMarker);if (e.length > 1) {
          n += e.length - 1;for (let n = 0; n < e.length; n++) {
            const s = e[n],
                  r = new Text(s);o.parentNode.insertBefore(r, o), t++, n < e.length - 1 && (o.parentNode.insertBefore(new Text(), o), o.parentNode.insertBefore(new Text(), o), this.parts.push(new TemplatePart("node", t)), t += 2);
          }t--, s.push(o);
        } else o.nodeValue.trim() || (s.push(o), t--);
      }
    }for (const e of s) e.parentNode.removeChild(e);for (const e of r) e.ownerElement.removeAttribute(e.name);
  }_getTemplateHtml(e) {
    const t = [];for (let n = 0; n < e.length; n++) t.push(e[n]), n < e.length - 1 && t.push(exprMarker);return t.join("");
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
  constructor(e, t, n, s) {
    super(e), console.assert(t.nodeType === Node.ELEMENT_NODE), this.element = t, this.name = n, this.strings = s;
  }setValue(e) {
    const t = this.strings;let n = "";for (let s = 0; s < t.length; s++) if (n += t[s], s < t.length - 1) {
      const t = this._getValue(e[s]);if (t && "string" != typeof t && t[Symbol.iterator]) for (const e of t) n += e;else n += t;
    }this.element.setAttribute(this.name, n);
  }get size() {
    return this.strings.length - 1;
  }
}class NodePart extends Part {
  constructor(e, t, n) {
    super(e), this.startNode = t, this.endNode = n;
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
        n = this.startNode;const s = e[Symbol.iterator](),
          r = Array.isArray(this._previousValue) ? this._previousValue : void 0;let o = 0;const i = [];let a = s.next(),
        l = s.next();for (a.done && this.clear(); !a.done;) {
      let e;void 0 !== r && o < r.length ? (e = r[o++], l.done && e.endNode !== this.endNode && (this.clear(e.endNode.previousSibling), e.endNode = this.endNode), t = e.endNode) : (l.done ? t = this.endNode : (t = new Text(), this._insertNodeBeforeEndNode(t)), e = new NodePart(this.instance, n, t)), e.setValue(a.value), i.push(e), a = l, l = s.next(), n = t;
    }return i;
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
    let t = 0;for (const n of this._parts) void 0 === n.size ? n.setValue(e[t++]) : (n.setValue(e.slice(t, t + n.size)), t += n.size);
  }_clone() {
    const e = document.importNode(this._template.element.content, !0);if (this._template.parts.length > 0) {
      const t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT),
            n = this._template.parts;let s = 0,
          r = 0,
          o = n[0],
          i = t.nextNode();for (; null != i && r < n.length;) s === o.index ? (this._parts.push(this._createPart(o, i)), o = n[++r]) : (s++, i = t.nextNode());
    }return e;
  }_createPart(e, t) {
    if ("attribute" === e.type) return new AttributePart(this, t, e.name, e.strings);if ("node" === e.type) return new NodePart(this, t, t.nextSibling);throw new Error(`unknown part type: ${e.type}`);
  }_createInstance(e) {
    return new TemplateInstance(e);
  }
}const stateCache = new WeakMap();window.html = window.html || html$1, window.repeat = window.repeat || repeat, window.Backed = window.Backed || {}, window.Backed.Renderer = window.Backed.Renderer || render;var litMixin$1 = e => class t extends e {
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
      const { observer: r, reflect: t, renderer: i } = e[1];(r || t || i) && i && !render$1 && console.warn("Renderer undefined"), this.defineProperty(e[0], e[1]);
    }
  }defineProperty(e = null, { strict: r = !1, observer: t, reflect: i = !1, renderer: n, value: s }) {
    Object.defineProperty(this, e, { set(r) {
        r !== this[`___${e}`] && (this[`___${e}`] = r, i && (r ? this.setAttribute(e, String(r)) : this.removeAttribute(e)), t && (t in this ? this[t]() : console.warn(`observer::${t} undefined`)), n && (n in this ? render$1(this[n](), this.shadowRoot) : console.warn(`renderer::${n} undefined`)));
      }, get() {
        return this[`___${e}`];
      }, configurable: !r });const o = this.getAttribute(e);this[e] = o || this.hasAttribute(e) || s;
  }
};

var CustomEffects = (base => class CustomEffects extends base {
  constructor(options = { effects: [] }) {
    super(options);
    if (options && options.effects) {
      for (const effect of options.effects) {
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

function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

function eq(value, other) {
  return value === other || value !== value && other !== other;
}

function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

function stackGet(key) {
  return this.__data__.get(key);
}

function stackHas(key) {
  return this.__data__.has(key);
}

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function('return this')();

var Symbol$1 = root.Symbol;

var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
var nativeObjectToString = objectProto$1.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var objectProto$2 = Object.prototype;
var nativeObjectToString$1 = objectProto$2.toString;
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var coreJsData = root['__core-js_shared__'];

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype;
var objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

function getValue(object, key) {
  return object == null ? undefined : object[key];
}

function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var Map$1 = getNative(root, 'Map');

var nativeCreate = getNative(Object, 'create');

function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var HASH_UNDEFINED = '__lodash_hash_undefined__';
var objectProto$3 = Object.prototype;
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
}

var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
  return this;
}

function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map$1 || ListCache)(),
    'string': new Hash()
  };
}

function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var baseFor = createBaseFor();

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root.Buffer : undefined;
var allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}

var Uint8Array = root.Uint8Array;

function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var objectCreate = Object.create;
var baseCreate = function () {
  function object() {}
  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

var getPrototype = overArg(Object.getPrototypeOf, Object);

var objectProto$5 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$5;
  return value === proto;
}

function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var argsTag = '[object Arguments]';
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

var objectProto$6 = Object.prototype;
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};

var isArray = Array.isArray;

var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

function stubFalse() {
  return false;
}

var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer$1 = moduleExports$1 ? root.Buffer : undefined;
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse;

var objectTag = '[object Object]';
var funcProto$2 = Function.prototype;
var objectProto$7 = Object.prototype;
var funcToString$2 = funcProto$2.toString;
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
var objectCtorString = funcToString$2.call(Object);
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$5.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString;
}

var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag$1 = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
var freeProcess = moduleExports$2 && freeGlobal.process;
var nodeUtil = function () {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

var objectProto$8 = Object.prototype;
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$6.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
      length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

var objectProto$9 = Object.prototype;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$7.call(value, key)) && !(skipIndexes && (
    key == 'length' ||
    isBuff && (key == 'offset' || key == 'parent') ||
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var objectProto$10 = Object.prototype;
var hasOwnProperty$8 = objectProto$10.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];
  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = object[key],
      srcValue = source[key],
      stacked = stack.get(srcValue);
  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;
  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || srcIndex && isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function (srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack());
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(object[key], srcValue, key + '', object, source, stack) : undefined;
      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

function identity(value) {
  return value;
}

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var nativeMax = Math.max;
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

function constant(value) {
  return function () {
    return value;
  };
}

var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var setToString = shortOut(baseSetToString);

function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }
  return false;
}

function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var merge = createAssigner(function (object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

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
var RenderStatus = {
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

class CustomAppLayout extends CustomEffects(litMixin$1(propertyMixin$1(HTMLElement))) {
  constructor(options = { properties: {}, effects: [] }) {
    const properties = {
      firstRender: { value: true, observer: 'onResize' },
      headerMarginTop: { value: '', renderer: 'render' },
      headerPaddingTop: { value: '', renderer: 'render' }
    };
    merge(options.properties, properties);
    const effects = ['resize'];
    merge(options.effects, effects);
    super(options);
  }
  slotted(slot) {
    slot = slot.assignedNodes();
    if (slot[0] && slot[0].localName === 'slot') {
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
  onResize() {
    if (!this.firstRender) {
      RenderStatus.afterRender(this, () => {
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
