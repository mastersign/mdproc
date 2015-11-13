/* global require */
var url = require('url');

module.exports = function (oldExt, newExt) { 
	return function (mdtxt) {
		return mdtxt.replace(/([^!])\[([^\[\]]+)\]\((\S+)\)/g,
			function(str, prefix, label, uri) {
				var uriParsed = url.parse(uri);
				if (uriParsed.protocol) {
					return str;
				}
				var p = uriParsed.pathname;
				if (p && p.endsWith(oldExt)) {
					var uriAdapted = {
						pathname: p.slice(0, -oldExt.length) + newExt,
						hash: uriParsed.hash
					};
					return prefix + '[' + label + '](' + url.format(uriAdapted) + ')'; 
				}
				return str;
			});
	};
};
