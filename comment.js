//@ts-check

//@ts-ignore
import custom from 'https://esm.run/custom-function/factory';

/** @typedef {'marker' | 'start' | 'end'} MarkerType */

const ungap = Symbol.for('@ungap/marker');

let Marker = globalThis.Marker ?? globalThis[ungap];

if (!('MARKER_NODE' in Node)) {
  const { COMMENT_NODE, ELEMENT_NODE } = Node;
  const MARKER_NODE = 13;

  /**
   * @param {string} data
   * @returns
   */
  const name = data => / name=(['"])?(.+)?\1/.test(data) ? RegExp.$2 : '';

  /**
   * @param {Comment} node
   * @param {MarkerType} type
   * @returns {Marker}
   */
  const promote = (node, type) => {
    promoted = node;
    try {
      return new Marker(type, name(node.data.slice(type.length)));
    }
    finally {
      promoted = void 0;
    }
  };

  let promoted;

  Marker = globalThis[ungap] = class Marker extends custom(Node) {
    /** @type {string} */
    #name;

    /** @type {MarkerType} */
    #type;

    /**
     * @param {MarkerType} type
     * @param {string} [name]
     */
    constructor(type, name = '') {
      super(promoted ?? document.createComment(type));
      this.#name = name;
      this.#type = type;
    }

    /** @type {string} */
    get nodeName() {
      return '#marker';
    }

    /** @type {number} */
    get nodeType() {
      return MARKER_NODE;
    }

    /** @type {string} */
    get name() {
      return this.#name;
    }

    /** @type {MarkerType} */
    get type() {
      return this.#type;
    }

    /** @type {Element | null} */
    get previousElementSibling() {
      let previous = super.previousSibling;
      while (previous && previous.nodeType !== ELEMENT_NODE)
        previous = previous.previousSibling;
      return previous;
    }

    /** @type {Element | null} */
    get nextElementSibling() {
      let next = super.nextSibling;
      while (next && next.nodeType !== ELEMENT_NODE)
        next = next.nextSibling;
      return next;
    }
  }

  //@ts-ignore
  Node.MARKER_NODE = MARKER_NODE;

  /**
   * @param {Comment} node
   */
  const check = node => {
    if (/^(start|end|marker)(?:$|\s+)/.test(node.data))
      promote(node, /** @type {MarkerType} */ (RegExp.$1));
  };

  /**
   * @param {Element} parent
   */
  const walk = parent => {
    const tw = document.createTreeWalker(parent, NodeFilter.SHOW_COMMENT);
    let node;
    while (node = tw.nextNode()) check(/** @type {Comment} */(node));
  };

  const { attachShadow: $ } = Element.prototype;
  const mode = { childList: true, subtree: true };

  /**
   * 
   * @param {ShadowRootInit} init
   * @returns {ShadowRoot}
   */
  Element.prototype.attachShadow = function attachShadow(init) {
    const sr = $.call(this, init);
    mo.observe(sr, mode);
    return sr;
  };

  const { documentElement } = document;
  const mo = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        switch (node.nodeType) {
          case COMMENT_NODE:
            check(/** @type {Comment} */(node));
            break;
          case ELEMENT_NODE:
            walk(/** @type {Element} */(node));
            break;
        }
      }
    }
  });
  mo.observe(documentElement, mode);
  walk(documentElement);
}

export default Marker;
