(function () {
	'use strict';

	function setupTicker(ticker) {
		var track = ticker.querySelector('.asset-ticker-track');
		if (!track) return;

		var baseItems = Array.prototype.slice.call(track.children);
		if (!baseItems.length) return;

		var baseWidth = track.scrollWidth;
		if (!baseWidth) return;

		// The CSS animation scrolls by -50%, so the track must consist of an even
		// number of base-item repeats for the loop to be seamless at any item count.
		var repeats = Math.ceil((ticker.clientWidth * 2) / baseWidth);
		if (repeats % 2 !== 0) repeats += 1;
		if (repeats < 2) repeats = 2;

		for (var i = 1; i < repeats; i++) {
			baseItems.forEach(function (item) {
				track.appendChild(item.cloneNode(true));
			});
		}
	}

	function init() {
		document.querySelectorAll('.asset-ticker').forEach(setupTicker);
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', init, { once: true });
	else
		init();
})();
