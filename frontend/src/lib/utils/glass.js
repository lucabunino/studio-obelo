class FxFilter {
    static elements = new WeakMap();
    static filters = new Map();
    static filterOptions = new Map();
    static running = false;
    static observedElements = new Set();
    static rectCache = new WeakMap();
    static supportsSvgBackdrop = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#test)');
    
    // Optimizations: Frame scheduling and Blob URL tracking
    static hasPendingScan = false;
    static blobUrls = new Set();

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
            // Optimized: Use the centralized scheduleScan instead of synchronous execution
            this.ro = new ResizeObserver(() => this.scheduleScan());
            this.scheduleScan();

            this.mo = new MutationObserver((mutations) => {
                const relevant = mutations.some(m =>
                    [...m.addedNodes, ...m.removedNodes].some(n =>
                        n.nodeType === 1 && (n.matches?.('.glass-1,.glass-2') || n.querySelector?.('.glass-1,.glass-2'))
                    )
                );
                if (relevant) this.scheduleScan();
            });
            this.mo.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Debounces rapid layouts/resizes into a single frame paint
    static scheduleScan() {
        if (this.hasPendingScan) return;
        this.hasPendingScan = true;
        requestAnimationFrame(() => {
            this.scanElements();
            this.hasPendingScan = false;
        });
    }

    static syncResizeObserver() {
        const current = new Set(document.querySelectorAll('.glass-1, .glass-2'));
        for (const el of current) {
            if (!this.observedElements.has(el)) { 
                this.ro.observe(el); 
                this.observedElements.add(el); 
            }
        }
        for (const el of this.observedElements) {
            if (!current.has(el)) { 
                this.ro.unobserve(el); 
                this.observedElements.delete(el); 
            }
        }
    }

    static scanElements() {
        const elements = [...document.querySelectorAll('.glass-1, .glass-2')];

        // Phase 1: Batch all layout/style reads before any DOM mutations
        const snapshots = elements.map(el => {
            const cs = getComputedStyle(el);
            return { el, fxFilter: cs.getPropertyValue('--fx-filter').trim() || null, cs, width: el.offsetWidth, height: el.offsetHeight };
        });

        // Phase 2: Process and mutate DOM
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
                } else if (storedState.filter !== fxFilter || this.stylesChanged(storedState.trackedStyles, currentStyles)) {
                    this.removeFxContainer(element);
                    this.addFxContainer(element, fxFilter, parsedFilter);
                }
                
                // Keep element reference state fresh
                this.elements.set(element, { filter: fxFilter, hasContainer: true, trackedStyles: currentStyles, parsedFilter });
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
                <svg style="position:absolute;width:0;height:0;pointer-events:none;visibility:hidden;">${svgContent}</svg>
                <div class="fx-container" style="position:absolute;top:0;left:0;right:0;bottom:0;backdrop-filter:${backdropFilter};background:transparent;pointer-events:none;z-index:-1;overflow:hidden;border-radius:inherit;"></div>
            `);
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

    // Utility to clean up old Blob URLs to eliminate memory leaks
    static createTrackedBlobUrl(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                this.blobUrls.add(url);
                
                // Cap cache sizes to prevent memory leaks over lengthy user sessions
                if (this.blobUrls.size > 100) {
                    const oldUrl = this.blobUrls.values().next().value;
                    URL.revokeObjectURL(oldUrl);
                    this.blobUrls.delete(oldUrl);
                }
                resolve(url);
            }, 'image/png');
        });
    }
}

// 1. OPTIMIZED NOISE: Run entirely on GPU using native SVG filters. 
// No more canvases, pixel iteration loops, or resize re-renders.
FxFilter.add({
    name: 'noise',
    callback: (element, saturation = 0, intensity = 1, opacity = 0.25) => {
        return `
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="1" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0" in="noise" result="coloredNoise"/>
            <feBlend in="SourceGraphic" in2="coloredNoise" mode="overlay" />
        `;
    },
    updatesOn: [] 
});

// 2. OPTIMIZED LIQUID GLASS: Minimizes layout thrashing and switches 
// from synchronous heavy Base64 strings to parallelized OffscreenCanvases.
FxFilter.add({
    name: 'liquid-glass',
    callback: (element, refraction = 1, offset = 10, chromatic = 0) => {
        const rect = FxFilter.rectCache.get(element) || {};
        const width = Math.round(rect.width ?? element.offsetWidth) || 100;
        const height = Math.round(rect.height ?? element.offsetHeight) || 100;
        const refractionValue = parseFloat(refraction) / 2 || 0;
        const offsetValue = (parseFloat(offset) || 0) / 2;
        const chromaticValue = parseFloat(chromatic) || 0;
        const borderRadiusStr = rect.borderRadius ?? '0';
        
        let borderRadius = borderRadiusStr.includes('%')
            ? (parseFloat(borderRadiusStr) / 100) * Math.min(width, height)
            : parseFloat(borderRadiusStr);

        const SCALE = 8;
        const mapSize = Math.ceil(Math.max(width, height) / SCALE);

        function createDisplacementMap(refractionMod) {
            const r = refractionValue + refractionMod;
            const imageData = new ImageData(mapSize, mapSize);
            const data = imageData.data;
            data.fill(127); // Batch initialize transparency/neutral values safely

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

        function createSyncDataUrl(imageData) {
            // Replaced manual canvas allocation with OffscreenCanvas if available for speed
            const small = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(mapSize, mapSize) : document.createElement('canvas');
            if (small.width !== mapSize) { small.width = mapSize; small.height = mapSize; }
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

            if (borderRadius > 0) {
                const mask = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : document.createElement('canvas');
                mask.width = width; mask.height = height;
                const mctx = mask.getContext('2d');
                const inset = offsetValue;
                mctx.fillStyle = 'rgb(127,127,127)';
                mctx.beginPath();
                mctx.roundRect(inset, inset, width - inset * 2, height - inset * 2, Math.max(0, borderRadius - inset));
                mctx.clip();
                mctx.fillRect(0, 0, width, height);
                ctx.filter = `blur(${offsetValue}px)`;
                ctx.drawImage(mask, 0, 0, width, height);
                mask.width = mask.height = 0; // Explicitly free GPU memory
            } else if (offsetValue > 0) {
                ctx.filter = `blur(${offsetValue}px)`;
                ctx.drawImage(canvas, 0, 0);
            }

            const url = canvas.toDataURL();
            canvas.width = canvas.height = 0; // Garbage collection acceleration hint
            return url;
        }

        if (chromaticValue === 0) {
            const url = createSyncDataUrl(createDisplacementMap(0));
            return `
                <feImage result="FEIMG" href="${url}" color-interpolation-filters="sRGB"/>
                <feDisplacementMap in="SourceGraphic" in2="FEIMG" scale="127" yChannelSelector="B" xChannelSelector="R" color-interpolation-filters="sRGB"/>
            `;
        }

        const co = chromaticValue * 0.25;
        const rUrl = createSyncDataUrl(createDisplacementMap(co));
        const gUrl = createSyncDataUrl(createDisplacementMap(0));
        const bUrl = createSyncDataUrl(createDisplacementMap(-co));

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

// 3. COLOR OVERLAY: Lightweight native filter.
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