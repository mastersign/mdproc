/* global module */

var mapping = {
	'todo': { style: 'highlight', content: 'ToDo' },
	'selected': { style: 'highlight', content: 'Selected' },
	'open': { style: 'active', content: 'Open' },
	'in-progress': { style: 'info', content: 'In Progress' },
	'closed': { style: 'success', content: 'Closed' },
	'invalid': { style: 'warning', content: 'Invalid' },
	'failed': { style: 'error', content: 'Failed' },
	'rejected': { style: 'passive', content: 'Rejected' }
};

var badge = function (typ) {
	'use strict';
	return '<div class="badge ' + typ.style + '">' + typ.content + '</div>';
};

module.exports = function (text) {
	'use strict';

	/*
	 * States to Badges
	 */
	text = text.replace(/<!--\s+#state\s+(\S+)\s+-->/g,
		function (m, state) {
			var typ = mapping[state] || { style: 'default', content: state };
			return '<!-- #badge ' + typ.style + ' ' + typ.content + ' -->';
		}
	);

	/*
	 * Badges to HTML
	 */
	text = text.replace(
		/((?:\r?\n)(?:\r?\n)+)<!--\s+#badge\s+(\S+)\s+(.+?)\s+-->((?:\r?\n)(?:\r?\n)+)/g,
		'$1<div class="badge $2">$3</div>$4');
	text = text.replace(
		/<!--\s+#badge\s+(\S+)\s+(.+?)\s+-->/g,
		'<span class="badge $1">$2</span>');

	return text;
};
