gpxslice = {
	boot: function() {
		document.querySelector("#file").addEventListener("change", function (e) {
			gpxslice.readFile(e.target.files[0], function (text) {
				gpxslice.showEditor(gpxslice.parseTrack(text));
			});
		});
	},

	readFile: function(file, onComplete) {
		const reader = new FileReader();
		reader.onload = function(event) {
			onComplete(event.target.result);
		};
		reader.readAsText(file);
	},

	showEditor: function(track) {
		document.body.className = "showing-map";
		let start = 0, end = track.points.length - 1;
		const map = new gpxslice.Map(track.points);
		const slider = new gpxslice.Slider(document.querySelector("#slider"), end);

		map.onRangeChange(function(newStart, newEnd) {
			start = newStart;
			end = newEnd;
			slider.setRange(Math.min(start, end), Math.max(start, end));
		});

		slider.onRangeChange(function(newStart, newEnd) {
			start = newStart;
			end = newEnd;
			map.setRange(Math.min(start, end), Math.max(start, end));
		});

		document.querySelector("#slice").addEventListener("click", function() {
			gpxslice.showSlice(track, start, end);
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

		for (let i = 0; i < pointsInSlice.length; i++) {
			trkseg.appendChild(pointsInSlice[i]);
		}

		const xml = new XMLSerializer()
			.serializeToString(track.dom)
			.replace(/\n\s*\n/m, '\n'); // collapse adjacent blank lines

		for (let i = 0; i < pointsInSlice.length; i++) {
			trkseg.removeChild(pointsInSlice[i]);
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

		for (let i = 0; i < pointEls.length; i++) {
			pointEls[i].parentNode.removeChild(pointEls[i]);
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
	},

	Map: (function() {
		function Map(points) {
			this._points = points;
			this._map = L.map('map');
			const line = L.polyline(points, {color: 'red'});
			line.addTo(this._map);
			this._map.fitBounds(line.getBounds());
			this._map.addLayer(new L.StamenTileLayer("terrain"));

			this._start = 0;
			this._end = points.length - 1;
			this._startMarker = L.marker(points[this._start], {draggable: true});
			this._startMarker.addTo(this._map);
			this._endMarker = L.marker(points[this._end], {draggable: true});
			this._endMarker.addTo(this._map);

			this._startMarker.on("drag", function(e) {
				this._start = this._constrainMarker(e);

				if (this._handler) {
					this._handler(this._start, this._end);
				}
			}.bind(this));

			this._endMarker.on("drag", function(e) {
				this._end = this._constrainMarker(e);

				if (this._handler) {
					this._handler(this._start, this._end);
				}
			}.bind(this));
		}

		Map.prototype._constrainMarker = function(event) {
			const latLng = gpxslice.closestPoint(this._points, event.latlng);
			event.target.setLatLng(latLng);
			return this._points.indexOf(latLng);
		};

		Map.prototype.onRangeChange = function(handler) {
			this._handler = handler;
		};

		Map.prototype.setRange = function(start, end) {
			this._start = start;
			this._end = end;
			this._startMarker.setLatLng(this._points[start]);
			this._endMarker.setLatLng(this._points[end]);
		};

		return Map;
	})(),

	Slider: (function() {
		function Slider (element, maxValue) {
			var el = document.getElementById("slider");
			this._slider = noUiSlider.create(el, {
				range: {min: 0, max: maxValue},
				step: 1,
				start: [0, maxValue],
				connect: true,
				behaviour: 'tap-drag'
			});
		}

		Slider.prototype.onRangeChange = function(handler) {
			this._slider.on('slide', function (values) {
				handler(values[0], values[1]);
			});
		};

		Slider.prototype.setRange = function(start, end) {
			this._slider.set([start, end]);
		};

		return Slider;
	})(),
};
