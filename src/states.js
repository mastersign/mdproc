/* global module */

module.exports = function (text) {
	return text.replace(/<!--\s+#state\s+(\S+)\s+-->/g,
		function (m, typ) {
			switch (typ) {
			case 'open':
				return '<span class="state open">offen</span>';
			case 'in-progress':
				return '<span class="state in-progress">in Bearbeitung</span>';
			case 'closed':
				return '<span class="state closed">abgeschlossen</span>';
			default:
				return '<span class="state unknown">unbekannt</span>';
			}
		}
	);
};
