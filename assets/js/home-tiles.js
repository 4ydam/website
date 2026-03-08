(function () {
	'use strict';

	if (!document.body.classList.contains('home-page')) {
		return;
	}

	if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
		return;
	}

	var cards = document.querySelectorAll('.home-page .tiles article');
	var MAX_TILT_X = 8;
	var MAX_TILT_Y = 5;
	var MAX_SHIFT_X = 16;
	var MAX_SHIFT_Y = 10;
	var RESPONSE_CURVE = 0.55;

	function curved(value) {
		var sign = value < 0 ? -1 : 1;
		return sign * Math.pow(Math.abs(value), RESPONSE_CURVE);
	}

	function onMove(card, event) {
		var rect = card.getBoundingClientRect();
		var x = (event.clientX - rect.left) / rect.width;
		var y = (event.clientY - rect.top) / rect.height;
		var nx = x * 2 - 1;
		var ny = y * 2 - 1;
		var tiltY = curved(nx) * MAX_TILT_Y;
		var tiltX = curved(-ny) * MAX_TILT_X;
		var shiftX = curved(nx) * MAX_SHIFT_X;
		var shiftY = curved(ny) * MAX_SHIFT_Y;

		card.style.setProperty('--img-tilt-x', tiltX.toFixed(2) + 'deg');
		card.style.setProperty('--img-tilt-y', tiltY.toFixed(2) + 'deg');
		card.style.setProperty('--img-shift-x', shiftX.toFixed(2) + 'px');
		card.style.setProperty('--img-shift-y', shiftY.toFixed(2) + 'px');
	}

	cards.forEach(function (card) {
		card.addEventListener('mousemove', function (event) {
			onMove(card, event);
		});

		card.addEventListener('mouseleave', function () {
			card.style.setProperty('--img-tilt-x', '0deg');
			card.style.setProperty('--img-tilt-y', '0deg');
			card.style.setProperty('--img-shift-x', '0px');
			card.style.setProperty('--img-shift-y', '0px');
		});
	});
})();
