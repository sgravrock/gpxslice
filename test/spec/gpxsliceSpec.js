describe('gpxslice', function() {
	describe('parseTrack', function() {
		describe('When the file is valid XML with a single trkseg', function() {
			it('returns the dom, point elements, and points', function() {
				const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
					'<trk> <trkseg> <trkpt lat="47.6664020" lon="-122.3778910"/> <trkpt lat="47.6663460" lon="-122.3778740"/>' +
					'</trkseg> </trk> </gpx>';
				const result = gpxslice.parseTrack(gpxSrc);

				expect(result).toEqual({
					dom: jasmine.any(Document),
					pointEls: [
						jasmine.any(Element),
						jasmine.any(Element)
					],
					points: [
						{lat: 47.6664020, lon: -122.3778910},
						{lat: 47.6663460, lon: -122.3778740}
					]
				});
			});

			it('removes the point elements from the DOM', function() {
				const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
					'<trk> <trkseg> <trkpt lat="47.6664020" lon="-122.3778910"/> <trkpt lat="47.6663460" lon="-122.3778740"/>' +
					'</trkseg> </trk> </gpx>';
				const result = gpxslice.parseTrack(gpxSrc);
				const pointEls = result.dom.querySelectorAll('trkpt');

				expect(pointEls.length).toEqual(0);
			});
		});

		describe('When the file is valid XML with multiple trkseg elements', function() {
			it('throws an exception', function() {
				const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
					'<trk> <trkseg></trkseg> <trkseg></trkseg> </trk> </gpx>';
				expect(function() { gpxslice.parseTrack(gpxSrc); })
					.toThrowError('Can\'t handle multi-segment tracks');
			});
		});

		describe('When the file is invalid XML', function() {
			it('throws an exception', function() {
				const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <';
				expect(function() { gpxslice.parseTrack(gpxSrc); })
					.toThrowError('Invalid GPX');
			});
		});
	});

	describe("createSlice", function() {
		it("serializes only the points requested", function() {
			const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
				'<trk> <trkseg> ' +
				'<trkpt lat="47.6664020" lon="-122.3778910"/> ' +
				'<trkpt lat="47.6663460" lon="-122.3778740"/>' +
				'<trkpt lat="47.6663461" lon="-122.3778741"/>' +
				'<trkpt lat="47.6663462" lon="-122.3778742"/>' +
				'</trkseg> </trk> </gpx>';
			const track = gpxslice.parseTrack(gpxSrc);

			const resultXml = gpxslice.createSlice(track, 1, 2);
			const resultPoints = gpxslice.parseTrack(resultXml).points;
			expect(resultPoints).toEqual([
				{lat: 47.6663460, lon: -122.3778740},
				{lat: 47.6663461, lon: -122.3778741}
			])
		});

		it("does not leave points in the track DOM", function() {
			const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
				'<trk> <trkseg> ' +
				'<trkpt lat="47.6664020" lon="-122.3778910"/> ' +
				'<trkpt lat="47.6663460" lon="-122.3778740"/>' +
				'<trkpt lat="47.6663461" lon="-122.3778741"/>' +
				'<trkpt lat="47.6663462" lon="-122.3778742"/>' +
				'</trkseg> </trk> </gpx>';
			const track = gpxslice.parseTrack(gpxSrc);

			gpxslice.createSlice(track, 1, 2);

			const pointEls = track.dom.querySelectorAll('trkpt');
			expect(pointEls.length).toEqual(0);
		});

		it("accepts endpoints in either order", function() {
			const gpxSrc = '<?xml version="1.0" encoding="UTF-8"?> <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"> ' +
				'<trk> <trkseg> ' +
				'<trkpt lat="47.6664020" lon="-122.3778910"/> ' +
				'<trkpt lat="47.6663460" lon="-122.3778740"/>' +
				'<trkpt lat="47.6663461" lon="-122.3778741"/>' +
				'<trkpt lat="47.6663462" lon="-122.3778742"/>' +
				'</trkseg> </trk> </gpx>';
			const track = gpxslice.parseTrack(gpxSrc);

			const resultXml1 = gpxslice.createSlice(track, 1, 2);
			const resultXml2 = gpxslice.createSlice(track, 2, 1);

			expect(resultXml2).toEqual(resultXml1);
		});

		it("removes extra whitespace from the output", function() {
			const input = '<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<gpx>\n' +
				' <trk>\n' +
				'  <trkseg>\n' +
				'    <trkpt />\n' +
				'    <trkpt />\n' +
				'    <trkpt />\n' +
				'    <trkpt />\n' +
				'  </trkseg>\n' +
				' </trk>\n' +
				'</gpx>\n';
			const track = gpxslice.parseTrack(input);

			const output = gpxslice.createSlice(track, 1, 2);

			expect(output).not.toMatch(/\n\s*\n/m);
		})
	});
});
