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
		map.fitBounds(findBounds(track));
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
			point: {
				lat: parseFloat(el.getAttribute('lat')),
				lon: parseFloat(el.getAttribute('lon')),
			},
			elevation: parseFloat(el.querySelector('ele').textContent),
			time: new Date(el.querySelector('time').textContent)
		};
	}

	function findBounds(track) {
		let minLat = 180, maxLat = -180, minLon = 180, maxLon = -180;

		for (let trkpt of track) {
			minLat = Math.min(minLat, trkpt.point.lat);
			maxLat = Math.max(maxLat, trkpt.point.lat);
			minLon = Math.min(minLon, trkpt.point.lon);
			maxLon = Math.max(maxLon, trkpt.point.lon);
		}

		return [[minLat, minLon], [maxLat, maxLon]];
	}
}());
