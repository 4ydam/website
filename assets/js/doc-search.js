(function () {
	'use strict';

	var HIGHLIGHT_CLASS = 'doc-search-highlight';
	var ACTIVE_CLASS = 'doc-search-highlight-active';
	var container, input, countEl, prevBtn, nextBtn;
	var matches = [];
	var currentIndex = -1;

	function escapeRegExp(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function clearHighlights() {
		var marks = document.querySelectorAll('mark.' + HIGHLIGHT_CLASS);
		for (var i = marks.length - 1; i >= 0; i--) {
			var mark = marks[i];
			var parent = mark.parentNode;
			parent.replaceChild(document.createTextNode(mark.textContent), mark);
			parent.normalize();
		}
		matches = [];
		currentIndex = -1;
	}

	function highlightMatches(query) {
		clearHighlights();
		if (!query) {
			updateCount();
			return;
		}

		var contentArea = document.querySelector('.asset-content-stack');
		if (!contentArea) return;

		var regex = new RegExp(escapeRegExp(query), 'gi');
		walkTextNodes(contentArea, regex);

		matches = Array.prototype.slice.call(
			document.querySelectorAll('mark.' + HIGHLIGHT_CLASS)
		);
		updateCount();

		if (matches.length > 0) {
			currentIndex = 0;
			setActive(0);
		}
	}

	function walkTextNodes(root, regex) {
		var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
		var textNodes = [];
		while (walker.nextNode()) {
			textNodes.push(walker.currentNode);
		}

		for (var i = 0; i < textNodes.length; i++) {
			var node = textNodes[i];
			if (!node.nodeValue || !regex.test(node.nodeValue)) continue;

			// Skip nodes inside script/style/mark
			var tag = node.parentNode.tagName;
			if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') continue;

			regex.lastIndex = 0;
			var frag = document.createDocumentFragment();
			var lastIdx = 0;
			var match;

			while ((match = regex.exec(node.nodeValue)) !== null) {
				if (match.index > lastIdx) {
					frag.appendChild(document.createTextNode(node.nodeValue.substring(lastIdx, match.index)));
				}
				var mark = document.createElement('mark');
				mark.className = HIGHLIGHT_CLASS;
				mark.textContent = match[0];
				frag.appendChild(mark);
				lastIdx = regex.lastIndex;
			}

			if (lastIdx < node.nodeValue.length) {
				frag.appendChild(document.createTextNode(node.nodeValue.substring(lastIdx)));
			}

			node.parentNode.replaceChild(frag, node);
		}
	}

	function setActive(index) {
		if (matches.length === 0) return;
		for (var i = 0; i < matches.length; i++) {
			matches[i].classList.remove(ACTIVE_CLASS);
		}
		currentIndex = ((index % matches.length) + matches.length) % matches.length;
		matches[currentIndex].classList.add(ACTIVE_CLASS);
		matches[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
		updateCount();
	}

	function updateCount() {
		if (!countEl) return;
		if (matches.length === 0) {
			countEl.textContent = input && input.value ? 'No results' : '';
		} else {
			countEl.textContent = (currentIndex + 1) + ' of ' + matches.length;
		}
	}

	function onInput() {
		highlightMatches(input.value.trim());
	}

	function onKeyDown(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (e.shiftKey) {
				goToPrev();
			} else {
				goToNext();
			}
		}
		if (e.key === 'Escape') {
			input.value = '';
			clearHighlights();
			updateCount();
			input.blur();
		}
	}

	function goToNext() {
		if (matches.length === 0) return;
		setActive(currentIndex + 1);
	}

	function goToPrev() {
		if (matches.length === 0) return;
		setActive(currentIndex - 1);
	}

	function init() {
		container = document.querySelector('.doc-search');
		if (!container) return;

		input = container.querySelector('.doc-search-input');
		countEl = container.querySelector('.doc-search-count');
		prevBtn = container.querySelector('.doc-search-prev');
		nextBtn = container.querySelector('.doc-search-next');

		if (input) {
			input.addEventListener('input', onInput);
			input.addEventListener('keydown', onKeyDown);
		}
		if (prevBtn) prevBtn.addEventListener('click', goToPrev);
		if (nextBtn) nextBtn.addEventListener('click', goToNext);
	}

	// Support pages that use data-include (wait for includes to load)
	document.addEventListener('includes:loaded', init);
	// Also try immediately in case includes already loaded or not used
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
