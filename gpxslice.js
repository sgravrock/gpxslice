(function() {
	document.querySelector("#file").addEventListener("change", function(e) {
		e.target.files[0].text()
			.then(function(text) {
				init(parseTrack(text));
			});
	});

	function init(track) {
		document.body.className = "showing-map";
		const map = showMap(track);

		const start = document.querySelector("[name=start]")
		start.value = 0;
		createMarker(start, track, map);

		const end = document.querySelector("[name=end]");
		end.value = track.length - 1;
		createMarker(end, track, map);

		document.querySelector("#slice").addEventListener("click", function() {
			createSlice(track);
		});
	}

	function showMap(track) {
		const map = L.map('map');
		const line = L.polyline(track, {color: 'red'});
		line.addTo(map);
		map.fitBounds(line.getBounds());
		map.addLayer(new L.StamenTileLayer("terrain"));

		return map;
	}

	function createMarker(input, track, map) {
		const marker = L.marker(getLatLng());
		marker.addTo(map);

		input.addEventListener("change", function() {
			marker.setLatLng(getLatLng());
		});

		function getLatLng() {
			return track[parseInt(input.value, 10)];
		}
	}

	function createSlice(track) {
		const start = parseInt(document.querySelector("[name=start]").value, 10);
		const end = parseInt(document.querySelector("[name=end]").value, 10);
		const slice = track.slice(start, end + 1);
		document.querySelector("#output").textContent = JSON.stringify(slice);
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
