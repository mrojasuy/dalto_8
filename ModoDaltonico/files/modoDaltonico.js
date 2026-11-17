(function () {
	'use strict';

	var config = window.ModoDaltonicoConfig || {};
	var LS_ACTIVE_KEY = 'md_active';
	var LS_MODE_KEY = 'md_contrast_type';

	var validModes = ['protanopia', 'deuteranopia', 'tritanopia'];

	function getStoredActive() {
		try {
			var val = localStorage.getItem(LS_ACTIVE_KEY);
			if (val === 'true') return true;
			if (val === 'false') return false;
		} catch (e) {}
		return null;
	}

	function getStoredMode() {
		try {
			var val = localStorage.getItem(LS_MODE_KEY);
			if (val && validModes.indexOf(val) !== -1) return val;
		} catch (e) {}
		return null;
	}

	function setStored(active, mode) {
		try {
			localStorage.setItem(LS_ACTIVE_KEY, active ? 'true' : 'false');
			if (mode) {
				localStorage.setItem(LS_MODE_KEY, mode);
			}
		} catch (e) {}
	}

	function applyFilter(active, mode) {
		var html = document.documentElement;
		validModes.forEach(function (m) {
			html.classList.remove('md-' + m);
		});
		if (active && mode) {
			html.classList.add('md-' + mode);
		}
	}

	function updateUI(btn, badge, selector, active, mode) {
		btn.setAttribute('aria-pressed', active ? 'true' : 'false');

		if (active) {
			badge.textContent = (config.activeLabel || 'Active') + ': ' +
				(config.strings && config.strings[mode] ? config.strings[mode] : mode);
			badge.classList.add('md-visible');
			selector.classList.add('md-visible');
		} else {
			badge.textContent = config.inactiveLabel || 'Inactive';
			badge.classList.remove('md-visible');
			selector.classList.remove('md-visible');
		}
	}

	function injectSVGFilters() {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'md-filters');
		svg.setAttribute('aria-hidden', 'true');
		svg.innerHTML =
			'<defs>' +
			'<filter id="md-filter-protanopia" color-interpolation-filters="linearRGB">' +
			'<feColorMatrix type="matrix" values="' +
			'0.567, 0.433, 0.000, 0, 0 ' +
			'0.558, 0.442, 0.000, 0, 0 ' +
			'0.000, 0.242, 0.758, 0, 0 ' +
			'0, 0, 0, 1, 0"/>' +
			'</filter>' +
			'<filter id="md-filter-deuteranopia" color-interpolation-filters="linearRGB">' +
			'<feColorMatrix type="matrix" values="' +
			'0.625, 0.375, 0.000, 0, 0 ' +
			'0.700, 0.300, 0.000, 0, 0 ' +
			'0.000, 0.300, 0.700, 0, 0 ' +
			'0, 0, 0, 1, 0"/>' +
			'</filter>' +
			'<filter id="md-filter-tritanopia" color-interpolation-filters="linearRGB">' +
			'<feColorMatrix type="matrix" values="' +
			'0.950, 0.050, 0.000, 0, 0 ' +
			'0.000, 0.433, 0.567, 0, 0 ' +
			'0.000, 0.475, 0.525, 0, 0 ' +
			'0, 0, 0, 1, 0"/>' +
			'</filter>' +
			'<filter id="md-filter-identity">' +
			'<feColorMatrix type="matrix" values="' +
			'1, 0, 0, 0, 0 ' +
			'0, 1, 0, 0, 0 ' +
			'0, 0, 1, 0, 0 ' +
			'0, 0, 0, 1, 0"/>' +
			'</filter>' +
			'</defs>';
		document.body.appendChild(svg);
	}

	function createToggleUI() {
		var container = document.createElement('div');
		container.className = 'md-toggle';

		var badge = document.createElement('span');
		badge.className = 'md-badge';
		badge.setAttribute('aria-live', 'polite');

		var selector = document.createElement('div');
		selector.className = 'md-mode-selector';

		var select = document.createElement('select');
		select.className = 'md-mode-select';
		select.setAttribute('aria-label',
			config.strings && config.strings.indicador_activo
				? config.strings.indicador_activo
				: 'Contrast mode');

		validModes.forEach(function (m) {
			var opt = document.createElement('option');
			opt.value = m;
			opt.textContent = config.strings && config.strings[m] ? config.strings[m] : m;
			select.appendChild(opt);
		});

		selector.appendChild(select);

		var btn = document.createElement('button');
		btn.className = 'md-toggle-btn';
		btn.setAttribute('type', 'button');
		btn.setAttribute('aria-label',
			config.strings && config.strings.activar
				? config.strings.activar + ' / ' + config.strings.desactivar
				: 'Toggle colorblind mode');
		btn.textContent = '\u{1F441}';

		container.appendChild(badge);
		container.appendChild(selector);
		container.appendChild(btn);
		document.body.appendChild(container);

		return { btn: btn, badge: badge, selector: selector, select: select };
	}

	function init() {
		injectSVGFilters();

		var storedActive = getStoredActive();
		var storedMode = getStoredMode();

		var isActive = storedActive !== null ? storedActive : (config.initialActive !== false);
		var currentMode = storedMode || config.contrastType || 'protanopia';

		if (validModes.indexOf(currentMode) === -1) {
			currentMode = 'protanopia';
		}

		setStored(isActive, currentMode);

		var ui = createToggleUI();
		ui.select.value = currentMode;

		applyFilter(isActive, currentMode);
		updateUI(ui.btn, ui.badge, ui.selector, isActive, currentMode);

		ui.btn.addEventListener('click', function () {
			isActive = !isActive;
			setStored(isActive, currentMode);
			applyFilter(isActive, currentMode);
			updateUI(ui.btn, ui.badge, ui.selector, isActive, currentMode);
		});

		ui.select.addEventListener('change', function () {
			currentMode = ui.select.value;
			setStored(isActive, currentMode);
			if (isActive) {
				applyFilter(true, currentMode);
			}
			updateUI(ui.btn, ui.badge, ui.selector, isActive, currentMode);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
