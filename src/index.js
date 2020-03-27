import * as d3 from "d3";
import { feature } from "topojson";
import "../styles/styles.css";
import { path } from "d3";

const svg = d3.select("svg");
// const width = +svg.attr("width");
// const height = +svg.attr("height");
// const pathGenerator = d3.geoPath().projection(projection);

//TODO: consider adding debouncing, one scroll make ~100 events
const projection = d3.geoOrthographic().clipAngle(90);

const config = {
	speed: 0.005,
	verticalTilt: -15,
	horizontalTilt: 0,
};

const context = d3
	.select("canvas")
	.attr("width", 900)
	.attr("height", 600)
	.node()
	.getContext("2d");

const geoPath = d3
	.geoPath()
	.projection(projection)
	.context(context);

//outline for entire earth
const sphere = { type: "Sphere" };

//longitude and latitude lines
const graticules = d3.geoGraticule()();

drawEarth();

function drawEarth() {
	Promise.all([
		d3.json(
			"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
		),
		// d3.json(
		// 	"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
		// ),
		d3.json(
			"https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
		),
		// ]).then(([geoData, earthquakeData, tectonicData]) => {
	]).then(([geoData, tectonicData]) => {
		var map = feature(geoData, geoData.objects.countries);
		d3.timer(function(elapsed) {
			context.clearRect(0, 0, 900, 600);
			projection.rotate([
				config.speed * elapsed,
				config.verticalTilt,
				config.horizontalTilt,
			]);

			context.beginPath();
			geoPath(sphere);
			context.fillStyle = "#D9EAEF";
			context.fill();

			map.features.forEach(d => {
				context.beginPath();
				geoPath(d);
				context.fillStyle = "lightgreen";
				context.strokeStyle = "black";
				context.lineWidth = 0.1;
				context.fill();
				context.stroke();
			});

			//graticules
			context.beginPath();
			geoPath(graticules);
			context.lineWidth = 0.2;
			context.strokeStyle = "grey";
			context.stroke();

			tectonicData.features.forEach(d => {
				context.beginPath();
				geoPath(d);
				context.fillStyle = "red";
				context.strokeStyle = "red";
				context.lineWidth = 0.5;
				// context.fill();
				context.stroke();
			});

			// earthquakeData.features.forEach(d => {
			// 	context.beginPath();
			// 	geoPath(d);
			// 	context.fillStyle = "red";
			// 	context.strokeStyle = "red";
			// 	context.lineWidth = 5;
			// 	context.fill();
			// 	context.stroke();
			// });
		});
		// }
	});
}
