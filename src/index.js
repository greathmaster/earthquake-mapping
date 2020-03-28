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

var config = {
	speed: 1,
	verticalTilt: -15,
	horizontalTilt: 0,
	countries: null,
	inGlobe: false,
	timerActive: false,
	accumulatedRotation: 0,
};
const canvas = d3
	.select("#visible")
	.attr("width", 900)
	.attr("height", 600);

const context = canvas.node().getContext("2d");

var hiddenCanvas = d3
	.select("#hidden")
	.attr("width", 900)
	.attr("height", 600)
	.style("display", "hidden");

var hiddenContext = hiddenCanvas.node().getContext("2d");

var hiddenProjection = d3.geoEquirectangular();

var hiddenPath = d3
	.geoPath()
	.projection(hiddenProjection)
	.context(hiddenContext);

//give each country a unique color
function drawHiddenCanvas(geo) {
	var countries = geo.features;
	// console.log(countries)
	countries.forEach(function(el, i) {
		hiddenContext.beginPath();
		hiddenPath(el);
		hiddenContext.fillStyle = `rgb(${i}, 0, 0)`;
		hiddenContext.fill();
	});
}
var timer;
var currentTime;
var prevTime = d3.now();

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
		canvas.on("mousemove", highlightPicking);
		var map = feature(geoData, geoData.objects.countries);
		
		timer = d3.timer(render);
		
		function render(elapsed) {
			//todo use CSS to set {display: hidden} on this to hide it
			currentTime = d3.now();
			let diff = currentTime - prevTime;
			prevTime = currentTime;
			
			// console.log([diff, elapsed])
			if (diff < elapsed) {
				let rotation = projection.rotate();
				rotation[0] += diff / 50;
				rotation[1] = config.verticalTilt;
				rotation[2] = config.horizontalTilt;
				projection.rotate(rotation);
				
				context.clearRect(0, 0, 900, 600);
				drawHiddenCanvas(map);
				
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
			}
		}

		function highlightPicking() {
			const pos = d3.mouse(this);
			const loglatArray = projection.invert(pos);
			const hiddenPos = hiddenProjection(loglatArray);

			var pickedColor = hiddenContext.getImageData(
				hiddenPos[0],
				hiddenPos[1],
				1,
				1
			).data; // get the pixel color at mouse hover

			config.inGlobe =
				Math.abs(pos[0] - projection(projection.invert(pos))[0]) <
					0.5 &&
				Math.abs(pos[1] - projection(projection.invert(pos))[1]) < 0.5; // checking if the mouse is within the globe bounds

			if (config.inGlobe && config.timerActive) {
				config.timerActive = false;
				timer.stop();
			}
			if (!config.inGlobe && !config.timerActive) {
				config.timerActive = true;

				timer.restart(render);
			}

			const selected =
				config.inGlobe && pickedColor[3] === 255
					? pickedColor[0]
					: false; // checking for inGlobe (above) and antialiasing
			console.log(selected)
		}

		// canvas.on("mousemove", highlightPicking);
	});
}
