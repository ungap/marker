//@ts-check

//@ts-ignore
import custom from 'https://esm.run/custom-function/factory';

/** @typedef {'marker' | 'start' | 'end'} MarkerType */

const ungap = Symbol.for('@ungap/marker');

let Marker = globalThis.Marker ?? globalThis[ungap];

if (!Marker) {
  const { COMMENT_NODE, ELEMENT_NODE, PROCESSING_INSTRUCTION_NODE } = Node;

  const fix = ({ $1, $2 }) => $1 ? $2 : $2.split(/\s/)[0];

  /**
   * @param {string} data
   * @returns
   */
  const name = data => / name=(['"])?(.+)?\1/.test(data) ? fix(RegExp) : '';

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

  Marker = globalThis[ungap] = class Marker extends custom(ProcessingInstruction) {
    /** @type {string} */
    #name;

    /** @type {MarkerType} */
    #type;

    /**
     * @param {MarkerType} type
     * @param {string} [name]
     */
    constructor(type, name = '') {
      super(promoted ?? document.createComment(`?${type}?`));
      this.#name = name;
      this.#type = type;
    }

    /** @type {string} */
    get data() {
      return super.data;
    }
    set data(_) {
      throw new SyntaxError('Cannot set data of a Marker');
    }

    get target() {
      return this.#type;
    }

    /** @type {string} */
    get nodeName() {
      return '#marker';
    }

    /** @type {number} */
    get nodeType() {
      return PROCESSING_INSTRUCTION_NODE;
    }

    /** @type {string} */
    get name() {
      return this.#name;
    }

    /** @type {MarkerType} */
    get type() {
      return this.#type;
    }
  }

  /**
   * @param {Comment} node
   */
  const check = node => {
    if (/^\?(start|end|marker)(?:\?|\s+)/.test(node.data))
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
