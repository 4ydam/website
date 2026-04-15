(function () {
	'use strict';

	function slugify(text) {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	function buildSectionLinks() {
		var activeLink = document.querySelector('.asset-side-menu-links a.is-active');
		if (!activeLink) return;

		var panels = document.querySelectorAll('.asset-content-panel');
		if (!panels.length) return;

		var sections = [];
		panels.forEach(function (panel) {
			var h2 = panel.querySelector('h2');
			if (!h2) return;

			var text = h2.textContent.trim();
			var id = 'section-' + slugify(text);
			panel.setAttribute('id', id);
			sections.push({ id: id, text: text });
		});

		if (sections.length < 2) return;

		var activeLi = activeLink.parentElement;
		var subUl = document.createElement('ul');
		subUl.className = 'section-sublinks';

		sections.forEach(function (section) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.href = '#' + section.id;
			a.textContent = section.text;
			a.addEventListener('click', function (e) {
				e.preventDefault();
				var target = document.getElementById(section.id);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					history.replaceState(null, '', '#' + section.id);
				}
			});
			li.appendChild(a);
			subUl.appendChild(li);
		});

		// Toggle dropdown on click
		var toggle = document.createElement('button');
		toggle.className = 'section-toggle';
		toggle.setAttribute('type', 'button');
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-label', 'Toggle section links');
		activeLi.classList.add('has-sections');
		activeLi.insertBefore(toggle, activeLink);
		activeLi.appendChild(subUl);

		toggle.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var expanded = activeLi.classList.toggle('sections-open');
			toggle.setAttribute('aria-expanded', expanded);
		});

		// Open by default
		activeLi.classList.add('sections-open');
		toggle.setAttribute('aria-expanded', 'true');

		// If URL has a hash, scroll to it
		if (window.location.hash) {
			var target = document.getElementById(window.location.hash.substring(1));
			if (target) {
				setTimeout(function () {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}, 100);
			}
		}
	}

	function init() {
		// Guard against running twice
		if (document.querySelector('.section-sublinks')) return;
		buildSectionLinks();
	}

	// Try multiple strategies to ensure it runs on every page
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
	// Fallback: also try on window load in case DOMContentLoaded was missed
	window.addEventListener('load', init);
})();
