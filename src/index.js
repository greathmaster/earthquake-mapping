import * as d3 from "d3";
import { feature } from "topojson";
import "../styles/styles.css";

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const projection = d3.geoOrthographic();
const pathGenerator = d3.geoPath().projection(projection);

// const g = svg.append("g");

//TODO: consider adding debouncing, one scroll make ~100 events
// svg.call(
// 	d3.zoom().on("zoom", () => {
// 		g.attr("transform", event.transform);
// 	})
// );
drawEarth();
drawGraticules();
rotation();
function drawEarth() {
	svg.append("path")
		.attr("class", "sphere")
		.attr("d", pathGenerator({ type: "Sphere" }));

	d3.json(
		"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
	).then(data => {
		const countries = feature(data, data.objects.countries);

		svg.selectAll("path.feature")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "country")
			.attr("d", d => pathGenerator(d))
			.on("mouseover", function(d) {
				// d3.select(this).style("fill", "lightgrey");
				d3.select(this).attr("class", "country-mouse-over");
			})
			.on("mouseout", function(d) {
				let c = d3.select(this);
				c.attr("class", null);
				c.attr("class", "country");
			});
	});
}

function drawGraticules() {
	// Add the graticule to the figure
	const graticule = d3.geoGraticule().step([10, 10]);

	svg.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", pathGenerator);
	// .style("fill", "green")
	// .style("stroke", "red");
}
const config = {
	speed: 0.005,
	verticalTilt: -15,
	horizontalTilt: 0,
};
function rotation() {
	d3.timer(function(elapsed) {
		projection.rotate([
			config.speed * elapsed - 120,
			config.verticalTilt,
			config.horizontalTilt,
		]);

		svg.selectAll("path").attr("d", pathGenerator);
	});
}
