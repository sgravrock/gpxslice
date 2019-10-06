(function() {
	document.querySelector("#file").addEventListener("change", function(e) {
		e.target.files[0].text()
			.then(function(text) {
				showMap(parseTrack(text));
			});
	});

	function showMap(track) {
		document.body.className = "showing-map";
		var map = L.map('map');
		var line = L.polyline(track, {color: 'red'});
		line.addTo(map);
		map.fitBounds(line.getBounds());
		var layer = new L.StamenTileLayer("terrain");
		map.addLayer(layer);
	}

	function parseTrack(src) {
		const dom = new DOMParser().parseFromString(src, 'application/xml');

		if (dom.querySelector('parsererror')) {
			throw new Error('Invalid GPX');
		}

		const points = dom.querySelectorAll('trkpt');
		return Array.prototype.map.call(points, translatePoint);
	}

	function translatePoint(el) {
		return {
			lat: parseFloat(el.getAttribute('lat')),
			lon: parseFloat(el.getAttribute('lon')),
		};
	}
}());
