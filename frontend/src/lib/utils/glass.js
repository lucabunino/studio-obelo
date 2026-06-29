class FxFilter {
    static elements = new WeakMap();
    static filters = new Map();
    static filterOptions = new Map();
    static running = false;
    static observedElements = new Set();
    static rectCache = new WeakMap();
    static supportsSvgBackdrop = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#test)');

    static add(options) {
        if (typeof options === 'string') {
            const name = arguments[0];
            const callback = arguments[1];
            this.filters.set(name, callback);
            this.filterOptions.set(name, { name, callback, updatesOn: [] });
        } else {
            const { name, callback, updatesOn = [] } = options;
            this.filters.set(name, callback);
            this.filterOptions.set(name, { name, callback, updatesOn });
        }
    }

    static init() {
        if (typeof window !== 'undefined' && 'CSS' in window && 'registerProperty' in CSS) {
            try {
                CSS.registerProperty({ name: '--fx-filter', syntax: '*', inherits: false, initialValue: '' });
            } catch (e) {}
        }
        if (this.running) return;
        this.running = true;

        requestAnimationFrame(() => {
            this.ro = new ResizeObserver(() => this.scanElements());
            this.scanElements();

            this.mo = new MutationObserver((mutations) => {
                const relevant = mutations.some(m =>
                    [...m.addedNodes, ...m.removedNodes].some(n =>
                        n.nodeType === 1 && (n.matches?.('.glass-1,.glass-2') || n.querySelector?.('.glass-1,.glass-2'))
                    )
                )
                if (relevant) this.scanElements()
            });
            this.mo.observe(document.body, { childList: true, subtree: true });
        });
    }

    static syncResizeObserver() {
        const current = new Set(document.querySelectorAll('.glass-1, .glass-2'));
        for (const el of current) {
            if (!this.observedElements.has(el)) { this.ro.observe(el); this.observedElements.add(el); }
        }
        for (const el of this.observedElements) {
            if (!current.has(el)) { this.ro.unobserve(el); this.observedElements.delete(el); }
        }
    }

    static scanElements() {
        const elements = [...document.querySelectorAll('.glass-1, .glass-2')];

        // Phase 1: batch all layout/style reads before any DOM mutations
        const snapshots = elements.map(el => {
            const cs = getComputedStyle(el);
            return { el, fxFilter: cs.getPropertyValue('--fx-filter').trim() || null, cs, width: el.offsetWidth, height: el.offsetHeight };
        });

        // Phase 2: process and mutate DOM
        snapshots.forEach(({ el: element, fxFilter, cs, width, height }) => {
            this.rectCache.set(element, { width, height, borderRadius: cs.borderRadius });
            const storedState = this.elements.get(element);

            if (fxFilter) {
                let parsedFilter;
                if (storedState && storedState.filter === fxFilter && storedState.parsedFilter) {
                    parsedFilter = storedState.parsedFilter;
                } else {
                    parsedFilter = this.parseFilterValue(fxFilter);
                }

                const currentStyles = this.getTrackedStyles(element, fxFilter, parsedFilter, cs);

                if (!storedState) {
                    this.addFxContainer(element, fxFilter, parsedFilter);
                    this.elements.set(element, { filter: fxFilter, hasContainer: true, trackedStyles: currentStyles, parsedFilter });
                } else if (storedState.filter !== fxFilter || this.stylesChanged(storedState.trackedStyles, currentStyles)) {
                    this.removeFxContainer(element);
                    this.addFxContainer(element, fxFilter, parsedFilter);
                    this.elements.set(element, { filter: fxFilter, hasContainer: true, trackedStyles: currentStyles, parsedFilter });
                }
            } else {
                if (storedState && storedState.hasContainer) {
                    this.removeFxContainer(element);
                    this.elements.delete(element);
                }
            }
        });
        this.syncResizeObserver();
    }

    static getFxFilterValue(element) {
        return getComputedStyle(element).getPropertyValue('--fx-filter').trim() || null;
    }

    static addFxContainer(element, filterValue, parsedFilter) {
        if (element.querySelector('.fx-container')) return;

        const { orderedFilters } = parsedFilter || this.parseFilterValue(filterValue);
        const filterParts = [];
        let svgContent = '';

        orderedFilters.forEach(item => {
            if (item.type === 'custom') {
                if (!this.supportsSvgBackdrop) return;
                const filter = item.filter;
                const callback = this.filters.get(filter.name);
                if (callback) {
                    const filterId = `fx-${filter.name}-${Math.random().toString(36).substr(2, 6)}`;
                    svgContent += `<filter id="${filterId}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${callback(element, ...filter.params)}</filter>`;
                    filterParts.push(`url(#${filterId})`);
                }
            } else if (item.type === 'css') {
                filterParts.push(item.filter);
            }
        });

        const backdropFilter = filterParts.join(' ');
        if (backdropFilter.trim()) {
            element.insertAdjacentHTML('beforeend', `
                <svg style="position:absolute;width:0;height:0;">${svgContent}</svg>
                <div class="fx-container" style="position:absolute;top:0;left:0;right:0;bottom:0;backdrop-filter:${backdropFilter};background:transparent;pointer-events:none;z-index:-1;overflow:hidden;border-radius:inherit;"></div>
            `);
            this.elements.set(element, { filter: filterValue, hasContainer: true });
        }
    }

    static removeFxContainer(element) {
        element.querySelectorAll('.fx-container, svg').forEach(el => el.remove());
    }

    static parseFilterValue(filterValue) {
        const orderedFilters = [];
        const customFilters = [];
        const filterRegex = /(\w+(?:-\w+)*)\s*\(([^)]*)\)/g;
        let match;

        while ((match = filterRegex.exec(filterValue)) !== null) {
            const filterName = match[1];
            const params = match[2];

            if (this.filters.has(filterName)) {
                let paramArray = [];
                if (params.trim() !== '') {
                    paramArray = params.split(',').map(p => {
                        const trimmed = p.trim();
                        if (trimmed === '') return undefined;
                        const number = parseFloat(trimmed);
                        return !isNaN(number) ? number : trimmed;
                    }).filter(p => p !== undefined);
                }
                const customFilter = { name: filterName, params: paramArray };
                customFilters.push(customFilter);
                orderedFilters.push({ type: 'custom', filter: customFilter });
            } else {
                orderedFilters.push({ type: 'css', filter: `${filterName}(${params})` });
            }
        }

        return { orderedFilters, customFilters };
    }

    static getTrackedStyles(element, filterValue, parsedFilter, cs) {
        const { customFilters } = parsedFilter || this.parseFilterValue(filterValue);
        const trackedStyles = new Map();
        const computed = cs || getComputedStyle(element);

        customFilters.forEach(filter => {
            const filterOptions = this.filterOptions.get(filter.name);
            if (filterOptions?.updatesOn) {
                filterOptions.updatesOn.forEach(prop => trackedStyles.set(prop, computed.getPropertyValue(prop)));
            }
        });

        return trackedStyles;
    }

    static stylesChanged(oldStyles, newStyles) {
        if (!oldStyles || !newStyles) return true;
        if (oldStyles.size !== newStyles.size) return true;
        for (const [prop, value] of newStyles) {
            if (oldStyles.get(prop) !== value) return true;
        }
        return false;
    }
}

FxFilter.add({
    name: 'noise',
    callback: (element, saturation = 0, intensity = 1, opacity = 0.25) => {
        const canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const n1 = Math.random() * intensity * 255;
            const n2 = Math.random() * intensity * 255;
            const n3 = Math.random() * intensity * 255;
            data[i]     = n1 * (1 - saturation) + n1 * saturation;
            data[i + 1] = n1 * (1 - saturation) + n2 * saturation;
            data[i + 2] = n1 * (1 - saturation) + n3 * saturation;
            data[i + 3] = 255 * opacity;
        }

        ctx.putImageData(imageData, 0, 0);
        return `
            <feImage href="${canvas.toDataURL()}" result="noiseAdd" image-rendering="pixelated"/>
            <feBlend in="SourceGraphic" in2="noiseAdd" mode="overlay" image-rendering="pixelated" result="brightened"/>
        `;
    },
    updatesOn: ['width', 'height']
});

FxFilter.add({
    name: 'liquid-glass',
    callback: (element, refraction = 1, offset = 10, chromatic = 0) => {
        const rect = FxFilter.rectCache.get(element) || {};
        const width = Math.round(rect.width ?? element.offsetWidth);
        const height = Math.round(rect.height ?? element.offsetHeight);
        const refractionValue = parseFloat(refraction) / 2 || 0;
        const offsetValue = (parseFloat(offset) || 0) / 2;
        const chromaticValue = parseFloat(chromatic) || 0;
        const borderRadiusStr = rect.borderRadius ?? window.getComputedStyle(element).borderRadius ?? '0';
        let borderRadius = borderRadiusStr.includes('%')
            ? (parseFloat(borderRadiusStr) / 100) * Math.min(width, height)
            : parseFloat(borderRadiusStr);

        const SCALE = 8;
        const mapSize = Math.ceil(Math.max(width, height) / SCALE);

        function createDisplacementMap(refractionMod) {
            const r = refractionValue + refractionMod;
            const imageData = new ImageData(mapSize, mapSize);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) { data[i] = 127; data[i+1] = 127; data[i+2] = 127; data[i+3] = 255; }

            const half = Math.floor(mapSize / 2);
            for (let y = 0; y < half; y++) {
                const g = (half - y) / half;
                for (let x = 0; x < mapSize; x++) {
                    data[(y * mapSize + x) * 4 + 2] = Math.max(0, Math.min(255, Math.round(127 + 127 * r * g)));
                }
            }
            for (let y = mapSize - half; y < mapSize; y++) {
                const g = (y - (mapSize - half)) / half;
                for (let x = 0; x < mapSize; x++) {
                    data[(y * mapSize + x) * 4 + 2] = Math.max(0, Math.min(255, Math.round(127 - 127 * r * g)));
                }
            }
            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < half; x++) {
                    const g = (half - x) / half;
                    data[(y * mapSize + x) * 4] = Math.max(0, Math.min(255, Math.round(127 + 127 * r * g)));
                }
                for (let x = mapSize - half; x < mapSize; x++) {
                    const g = (x - (mapSize - half)) / half;
                    data[(y * mapSize + x) * 4] = Math.max(0, Math.min(255, Math.round(127 - 127 * r * g)));
                }
            }
            return imageData;
        }

        function createCanvasFromImageData(imageData) {
            const small = document.createElement('canvas');
            small.width = mapSize;
            small.height = mapSize;
            small.getContext('2d').putImageData(imageData, 0, 0);

            const scaledMax = mapSize * SCALE;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(small, 0, 0, mapSize, mapSize,
                -Math.round((scaledMax - width) / 2), -Math.round((scaledMax - height) / 2),
                scaledMax, scaledMax);
            small.remove();

            if (borderRadius > 0) {
                const mask = new OffscreenCanvas(width, height);
                const mctx = mask.getContext('2d');
                const inset = offsetValue;
                mctx.fillStyle = 'rgb(127,127,127)';
                mctx.beginPath();
                mctx.roundRect(inset, inset, width - inset * 2, height - inset * 2, Math.max(0, borderRadius - inset));
                mctx.clip();
                mctx.fillRect(0, 0, width, height);
                ctx.filter = `blur(${offsetValue}px)`;
                ctx.drawImage(mask, 0, 0, width, height);
            } else if (offsetValue > 0) {
                ctx.filter = `blur(${offsetValue}px)`;
                ctx.drawImage(canvas, 0, 0);
            }

            const url = canvas.toDataURL();
            canvas.remove();
            return url;
        }

        if (chromaticValue === 0) {
            const url = createCanvasFromImageData(createDisplacementMap(0));
            return `
                <feImage result="FEIMG" href="${url}" color-interpolation-filters="sRGB"/>
                <feDisplacementMap in="SourceGraphic" in2="FEIMG" scale="127" yChannelSelector="B" xChannelSelector="R" color-interpolation-filters="sRGB"/>
            `;
        }

        const co = chromaticValue * 0.25;
        const rUrl = createCanvasFromImageData(createDisplacementMap(co));
        const gUrl = createCanvasFromImageData(createDisplacementMap(0));
        const bUrl = createCanvasFromImageData(createDisplacementMap(-co));

        return `
            <feImage result="rImg" href="${rUrl}" color-interpolation-filters="sRGB"/>
            <feDisplacementMap in="SourceGraphic" in2="rImg" scale="127" yChannelSelector="B" xChannelSelector="R" color-interpolation-filters="sRGB" result="rD"/>
            <feComponentTransfer in="rD" result="rC"><feFuncR type="identity"/><feFuncG type="discrete" tableValues="0"/><feFuncB type="discrete" tableValues="0"/><feFuncA type="identity"/></feComponentTransfer>
            <feImage result="gImg" href="${gUrl}" color-interpolation-filters="sRGB"/>
            <feDisplacementMap in="SourceGraphic" in2="gImg" scale="127" yChannelSelector="B" xChannelSelector="R" color-interpolation-filters="sRGB" result="gD"/>
            <feComponentTransfer in="gD" result="gC"><feFuncR type="discrete" tableValues="0"/><feFuncG type="identity"/><feFuncB type="discrete" tableValues="0"/><feFuncA type="identity"/></feComponentTransfer>
            <feImage result="bImg" href="${bUrl}" color-interpolation-filters="sRGB"/>
            <feDisplacementMap in="SourceGraphic" in2="bImg" scale="127" yChannelSelector="B" xChannelSelector="R" color-interpolation-filters="sRGB" result="bD"/>
            <feComponentTransfer in="bD" result="bC"><feFuncR type="discrete" tableValues="0"/><feFuncG type="discrete" tableValues="0"/><feFuncB type="identity"/><feFuncA type="identity"/></feComponentTransfer>
            <feComposite in="rC" in2="gC" operator="arithmetic" k2="1" k3="1" result="rG"/>
            <feComposite in="rG" in2="bC" operator="arithmetic" k2="1" k3="1"/>
        `;
    },
    updatesOn: ['border-radius', 'width', 'height']
});

FxFilter.add({
    name: 'color-overlay',
    callback: (element, color = 'black', opacity = 0.5) => {
        const alpha = typeof opacity === 'string' ? parseFloat(opacity) : opacity;
        return `
            <feFlood flood-color="${color}" flood-opacity="${alpha}" result="flood"/>
            <feComposite in="flood" in2="SourceGraphic" operator="atop"/>
        `;
    },
    updatesOn: []
});

export function initGlass() { FxFilter.init() }
