gpxslice lets you trim unwanted parts from the start or the end of a GPX file.

To use it, either go to <https://www.panix.com/~sdg/gpxslice/> or:

1. Open index.html in a web browser (no need for a server).
2. Choose a GPX file.
3. Drag the markers until the portion of the track that you want to keep is
between them.
4. Click Slice.

To run the tests, simply open test/SpecRunner.html in a browser.

Known issues:
* If you move the start marker after the end marker you get an empty track.
* Files with multiple track segments are not supported.
* Because the metadata isn't updated, Strava will think that the new track is
a duplicate of the original unless the original is deleted before the new one
is uploaded.
* The UI could use some polish.
