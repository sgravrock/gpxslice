gpxslice = {
	boot: function() {
		document.querySelector("#file").addEventListener("change", function(e) {
			e.target.files[0].text()
				.then(function(text) {
					gpxslice.showEditor(gpxslice.parseTrack(text));
				});
		});
	},

	showEditor: function(track) {
		document.body.className = "showing-map";
		const map = gpxslice.showMap(track.points);

		let start = 0, end = track.points.length - 1;
		gpxslice.createMarker(start, track.points, map, function(value) {
			start = value;
		});

		gpxslice.createMarker(end, track.points, map, function(value) {
			end = value;
		});

		document.querySelector("#slice").addEventListener("click", function() {
			gpxslice.showSlice(track, start, end);
		});
	},

	showMap: function(points) {
		const map = L.map('map');
		const line = L.polyline(points, {color: 'red'});
		line.addTo(map);
		map.fitBounds(line.getBounds());
		map.addLayer(new L.StamenTileLayer("terrain"));

		return map;
	},

	createMarker: function(initialIndex, track, map, onMove) {
		const marker = L.marker(track[initialIndex], {draggable: true});
		marker.addTo(map);

		marker.on("drag", function(e) {
			const latLng = gpxslice.closestPoint(track, e.latlng);
			marker.setLatLng(latLng);
			onMove(track.indexOf(latLng));
		});
	},

	showSlice: function(track, startIx, endIx) {
		const output = document.querySelector("#output");
		output.textContent = gpxslice.createSlice(track, startIx, endIx);
		output.classList.add("has-contents");
	},

	createSlice: function(track, startIx, endIx) {
		if (endIx < startIx) {
			const tmp = endIx;
			endIx = startIx;
			startIx = tmp;
		}

		const pointsInSlice = track.pointEls.slice(startIx, endIx + 1);
		const trkseg = track.dom.querySelector("trkseg");

		for (let p of pointsInSlice) {
			trkseg.appendChild(p);
		}

		const xml = new XMLSerializer().serializeToString(track.dom);

		for (let p of pointsInSlice) {
			trkseg.removeChild(p);
		}

		return xml;
	},

	parseTrack: function(src) {
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
			points: pointEls.map(function(el) {
				return {
					lat: parseFloat(el.getAttribute('lat')),
					lon: parseFloat(el.getAttribute('lon')),
				};
			})
		};
	},

	closestPoint: function(points, sample) {
		const result = points.reduce(function(acc, p) {
			// Distances should be very small, so we can act as if the Earth
			// is flat.
			const latDist = Math.abs(sample.lat - p.lat),
				lonDist = Math.abs(sample.lng - p.lon),
				dist = Math.sqrt(latDist*latDist + lonDist*lonDist);

			if (acc && acc.dist < dist) {
				return acc;
			} else {
				return { p: p, dist: dist };
			}
		});

		return result && result.p;
	}
};
