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
	.append("path")
	.datum(d3.geoGraticule().step([10, 10]))
	.attr("class", "graticule")
	.attr("d", pathGenerator);
drawEarth();

function drawEarth() {
	d3.json(
		"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
	).then(data => {
		var countries = feature(data, data.objects.countries);

		var country = svg
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
		// svg.append("g");

		rotation();

		function rotation() {
			d3.timer(function(elapsed) {
				projection.rotate([
					config.speed * elapsed - 120,
					config.verticalTilt,
					config.horizontalTilt,
				]);

				country.attr("d", pathGenerator);
				graticules.attr("d", pathGenerator);
			});
		}
	});
}
