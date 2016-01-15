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
	return text.replace(/<!--\s+#state\s+(\S+)\s+-->/g,
		function (m, state) {
			return badge(mapping[state] || { style: 'default', content: state });
		}
	);
};
