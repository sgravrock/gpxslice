(function() {
	document.querySelector("#file").addEventListener("change", function(e) {
		e.target.files[0].text()
			.then(function(text) {
				init(parseTrack(text));
			});
	});

	function init(track) {
		document.body.className = "showing-map";
		const map = showMap(track.points);

		const start = document.querySelector("[name=start]")
		start.value = 0;
		createMarker(start, track.points, map);

		const end = document.querySelector("[name=end]");
		end.value = track.points.length - 1;
		createMarker(end, track.points, map);

		document.querySelector("#slice").addEventListener("click", function() {
			createSlice(track);
		});
	}

	function showMap(points) {
		const map = L.map('map');
		const line = L.polyline(points, {color: 'red'});
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
		const pointsInSlice = track.pointEls.slice(start, end + 1);
		const trkseg = track.dom.querySelector("trkseg");

		for (let p of pointsInSlice) {
			trkseg.appendChild(p);
		}

		document.querySelector("#output").textContent = 
			new XMLSerializer().serializeToString(track.dom);

		for (let p of pointsInSlice) {
			trkseg.removeChild(p);
		}
	}

	function parseTrack(src) {
		const dom = new DOMParser().parseFromString(src, 'application/xml');

		if (dom.querySelector('parsererror')) {
			throw new Error('Invalid GPX');
		}

		if (dom.querySelectorAll('trkseg').length !== 1) {
			throw new Error("Can't handle multi-segment tracks");
		}

		const pointEls = Array.prototype.slice.call(dom.querySelectorAll('trkpt'));

		for (let p of pointEls) {
			p.parentNode.removeChild(p);
		}

		return {
			dom: dom,
			pointEls: pointEls,
			points: pointEls.map(translatePoint)
		};
	}

	function translatePoint(el) {
		return {
			lat: parseFloat(el.getAttribute('lat')),
			lon: parseFloat(el.getAttribute('lon')),
		};
	}
}());
