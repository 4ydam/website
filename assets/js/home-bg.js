(function () {
	'use strict';

	var body = document.body;
	var canvas = document.getElementById('home-bg-canvas');

	if (!body || !canvas || !body.classList.contains('home-page')) {
		return;
	}

	var ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}

	var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var dpr = Math.min(window.devicePixelRatio || 1, 2);
	var particles = [];
	var pointer = {
		x: window.innerWidth * 0.5,
		y: window.innerHeight * 0.4,
		active: false
	};

	function buildPalette() {
		var dark = body.classList.contains('dark-mode');
		return {
			base: dark ? '#0f1118' : '#eef1f6',
			accentA: '255,122,3',
			accentB: '124,202,246',
			lineAlpha: dark ? 0.14 : 0.16,
			dotAlpha: dark ? 0.5 : 0.52,
			glowAlpha: dark ? 0.11 : 0.14
		};
	}

	function particleCount() {
		var area = window.innerWidth * window.innerHeight;
		var density = prefersReducedMotion ? 1 / 52000 : 1 / 32000;
		var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
		var maxPoints = isMobile ? 48 : 72;
		return Math.max(18, Math.min(maxPoints, Math.round(area * density)));
	}

	function randomParticle(width, height) {
		var speed = prefersReducedMotion ? 0.08 : 0.22;
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * speed,
			vy: (Math.random() - 0.5) * speed,
			r: 1 + Math.random() * 1.7,
			hue: Math.random() > 0.5 ? 'a' : 'b'
		};
	}

	function resize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		var targetCount = particleCount();
		if (particles.length > targetCount) {
			particles.length = targetCount;
		}
		while (particles.length < targetCount) {
			particles.push(randomParticle(w, h));
		}
	}

	function moveParticle(p, width, height) {
		p.x += p.vx;
		p.y += p.vy;

		if (p.x < -20) p.x = width + 20;
		if (p.x > width + 20) p.x = -20;
		if (p.y < -20) p.y = height + 20;
		if (p.y > height + 20) p.y = -20;

		if (pointer.active) {
			var dx = pointer.x - p.x;
			var dy = pointer.y - p.y;
			var distSq = dx * dx + dy * dy;
			if (distSq < 34000 && distSq > 1) {
				var pull = prefersReducedMotion ? 0.00008 : 0.0002;
				p.vx += dx * pull;
				p.vy += dy * pull;
			}
		}

		p.vx *= 0.992;
		p.vy *= 0.992;
	}

	function drawBackdrop(width, height, palette) {
		ctx.fillStyle = palette.base;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.globalAlpha = palette.glowAlpha;
		var gradA = ctx.createLinearGradient(0, 0, width, height);
		gradA.addColorStop(0, 'rgba(' + palette.accentA + ',0.16)');
		gradA.addColorStop(0.5, 'rgba(' + palette.accentA + ',0.02)');
		gradA.addColorStop(1, 'rgba(' + palette.accentB + ',0.12)');
		ctx.fillStyle = gradA;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();

		ctx.save();
		ctx.globalAlpha = palette.glowAlpha * 0.8;
		var gradB = ctx.createRadialGradient(width * 0.18, height * 0.25, 0, width * 0.18, height * 0.25, width * 0.45);
		gradB.addColorStop(0, 'rgba(' + palette.accentA + ',0.16)');
		gradB.addColorStop(1, 'rgba(' + palette.accentA + ',0)');
		ctx.fillStyle = gradB;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();
	}

	function drawNetwork(width, height, palette) {
		for (var i = 0; i < particles.length; i++) {
			var p = particles[i];
			moveParticle(p, width, height);

			for (var j = i + 1; j < particles.length; j++) {
				var q = particles[j];
				var dx = p.x - q.x;
				var dy = p.y - q.y;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 120) {
					var alpha = (1 - dist / 120) * palette.lineAlpha;
					ctx.strokeStyle = 'rgba(' + palette.accentA + ',' + alpha.toFixed(3) + ')';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(q.x, q.y);
					ctx.stroke();
				}
			}

			var rgb = p.hue === 'a' ? palette.accentA : palette.accentB;
			ctx.fillStyle = 'rgba(' + rgb + ',' + palette.dotAlpha + ')';
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function loop() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var palette = buildPalette();
		ctx.clearRect(0, 0, width, height);
		drawBackdrop(width, height, palette);
		drawNetwork(width, height, palette);
		window.requestAnimationFrame(loop);
	}

	function handlePointerMove(event) {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		pointer.active = true;
	}

	function handlePointerLeave() {
		pointer.active = false;
	}

	window.addEventListener('resize', resize);
	window.addEventListener('pointermove', handlePointerMove, { passive: true });
	window.addEventListener('pointerleave', handlePointerLeave);

	resize();
	window.requestAnimationFrame(loop);
})();
