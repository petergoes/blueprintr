function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.shift()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        while (render_callbacks.length) {
            const callback = render_callbacks.pop();
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment) {
        $$.update($$.dirty);
        run_all($$.before_render);
        $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_render.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_render } = component.$$;
    fragment.m(target, anchor);
    // onMount happens after the initial afterUpdate. Because
    // afterUpdate callbacks happen in reverse order (inner first)
    // we schedule onMount callbacks before afterUpdate callbacks
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_render.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    if (component.$$.fragment) {
        run_all(component.$$.on_destroy);
        if (detaching)
            component.$$.fragment.d(1);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        component.$$.on_destroy = component.$$.fragment = null;
        component.$$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
    const parent_component = current_component;
    set_current_component(component);
    const props = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props: prop_names,
        update: noop,
        not_equal: not_equal$$1,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_render: [],
        after_render: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, props, (key, value) => {
            if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
        })
        : props;
    $$.update();
    ready = true;
    run_all($$.before_render);
    $$.fragment = create_fragment($$.ctx);
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement !== 'undefined') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr$$1, _oldValue, newValue) {
            this[attr$$1] = newValue;
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    };
}/* docs/src/app-hero.svelte generated by Svelte v3.5.3 */

function create_fragment(ctx) {
	var header;

	return {
		c() {
			header = element("header");
			header.innerHTML = `<h1><slot name="title"></slot></h1> <strong><slot name="subtitle"></slot></strong>`;
			this.c = noop;
		},

		m(target, anchor) {
			insert(target, header, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(header);
			}
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { title = 'Blueprintr' } = $$props;

	$$self.$set = $$props => {
		if ('title' in $$props) $$invalidate('title', title = $$props.title);
	};

	return { title };
}

class App_hero extends SvelteElement {
	constructor(options) {
		super();

		this.shadowRoot.innerHTML = `<style>:host{display:flex;min-height:50vh;justify-content:center;align-items:center}h1{margin:0}</style>`;

		init(this, { target: this.shadowRoot }, instance, create_fragment, safe_not_equal, ["title"]);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["title"];
	}

	get title() {
		return this.$$.ctx.title;
	}

	set title(title) {
		this.$set({ title });
		flush();
	}
}

customElements.define("app-hero", App_hero);/* docs/src/app-footer.svelte generated by Svelte v3.5.3 */

function create_fragment$1(ctx) {
	var footer;

	return {
		c() {
			footer = element("footer");
			footer.innerHTML = `<slot></slot>`;
			this.c = noop;
		},

		m(target, anchor) {
			insert(target, footer, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(footer);
			}
		}
	};
}

class App_footer extends SvelteElement {
	constructor(options) {
		super();

		this.shadowRoot.innerHTML = `<style>:host{display:flex;justify-content:center;align-items:center}</style>`;

		init(this, { target: this.shadowRoot }, null, create_fragment$1, safe_not_equal, []);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}
		}
	}
}

customElements.define("app-footer", App_footer);/* docs/src/app-content.svelte generated by Svelte v3.5.3 */

function create_fragment$2(ctx) {
	var div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<slot></slot>`;
			this.c = noop;
		},

		m(target, anchor) {
			insert(target, div, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

class App_content extends SvelteElement {
	constructor(options) {
		super();

		this.shadowRoot.innerHTML = `<style>:host{display:block}div{max-width:72ch;margin:0 auto}</style>`;

		init(this, { target: this.shadowRoot }, null, create_fragment$2, safe_not_equal, []);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}
		}
	}
}

customElements.define("app-content", App_content);/* docs/src/index.svelte generated by Svelte v3.5.3 */

function create_fragment$3(ctx) {
	return {
		c() {
			this.c = noop;
		},

		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

class Index extends SvelteElement {
	constructor(options) {
		super();

		init(this, { target: this.shadowRoot }, null, create_fragment$3, safe_not_equal, []);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}
		}
	}
}export default Index;