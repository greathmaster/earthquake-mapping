import * as d3 from "d3";
import { feature } from "topojson";
import "../styles/styles.css";

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const projection = d3.geoOrthographic();
const pathGenerator = d3.geoPath().projection(projection);

//TODO: consider adding debouncing, one scroll make ~100 events

const config = {
	speed: 0.005,
	verticalTilt: -15,
	horizontalTilt: 0,
};

svg.append("path")
	.attr("class", "sphere")
	.attr("d", pathGenerator({ type: "Sphere" }));

const graticules = svg
	.append("g")
	.append("path")
	.datum(d3.geoGraticule().step([10, 10]))
	.attr("class", "graticule")
	.attr("d", pathGenerator);

drawEarth();

function drawEarth() {
	Promise.all([
		d3.json(
			"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
		),
		d3.json(
			"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
		),
		d3.json(
			"https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
		),
	]).then(([geoData, earthquakeData, tectonicData]) => {
		var countries = feature(geoData, geoData.objects.countries);
		var country = svg
			.append("g")
			.selectAll("path.feature")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "country")
			.attr("d", d => pathGenerator(d))
			.on("mouseover", function(d) {
				d3.select(this).attr("class", "country-mouse-over");
			})
			.on("mouseout", function(d) {
				let c = d3.select(this);
				c.attr("class", null);
				c.attr("class", "country");
			});

		var earthquakeLocations = svg
			.append("g")
			.attr("class", "points")
			.selectAll("path")
			.data(earthquakeData.features)
			.enter()
			.append("path")
			.attr("class", "cityPoint")
			.attr("d", pathGenerator);

		var tectonicPlatesLines = svg
			.append("g")
			.selectAll("path")
			.data(tectonicData.features)
			.enter()
			.append("path")
			.attr("class", "techtonic-lines")
			.attr("d", pathGenerator);

		// const graticules = svg
		// 	.append("g")
		// 	.datum(d3.geoGraticule().step([10, 10]))
		// 	.append("path")
		// 	.attr("class", "graticule")
		// 	.attr("d", pathGenerator);

		// svg.append("g");

		rotation();

		function rotation() {
			d3.timer(function(elapsed) {
				projection.rotate([
					config.speed * elapsed - 120,
					config.verticalTilt,
					config.horizontalTilt,
				]);
				tectonicPlatesLines.attr("d", pathGenerator);
				earthquakeLocations.attr("d", pathGenerator);
				country.attr("d", pathGenerator);
				graticules.attr("d", pathGenerator);
			});
		}
	});
}
