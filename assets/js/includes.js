(function () {
	'use strict';

	async function loadIncludes() {
		var includeNodes = document.querySelectorAll('[data-include]');
		if (!includeNodes.length)
			return;

		var tasks = Array.prototype.map.call(includeNodes, async function (node) {
			var includePath = node.getAttribute('data-include');
			if (!includePath)
				return;

			try {
				var response = await fetch(includePath, { cache: 'default' });
				if (!response.ok)
					throw new Error('Failed to load include: ' + includePath);

				var html = await response.text();
				node.outerHTML = html;
			}
			catch (err) {
				console.error(err);
			}
		});

		await Promise.all(tasks);
		document.dispatchEvent(new CustomEvent('includes:loaded'));
	}

	if (document.readyState === 'loading') {
		// Scripts are placed at end-of-body, so include targets usually already exist.
		if (document.querySelector('[data-include]'))
			loadIncludes();
		else
			document.addEventListener('DOMContentLoaded', loadIncludes, { once: true });
	}
	else {
		loadIncludes();
	}
})();
