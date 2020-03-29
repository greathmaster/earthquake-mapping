import * as d3 from "d3";
import { feature } from "topojson";
import "../styles/styles.css";

var config = {
	speed: 1,
	verticalTilt: -15,
	horizontalTilt: 0,
	countries: null,
	timerActive: false,
	accumulatedRotation: 0,
};

const projection = d3.geoOrthographic().clipAngle(90);

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
function drawHiddenCanvas(geo, earthquakeData) {
	// var countries = geo.features;
	// countries.forEach(function(el, i) {
	// 	hiddenContext.beginPath();
	// 	hiddenPath(el);
	// 	hiddenContext.fillStyle = `rgb(${i}, 0, 0)`;
	// 	hiddenContext.fill();
	// });

	earthquakeData.features.forEach((el, i) => {
		//console.log(el)
		hiddenContext.beginPath();
		hiddenPath(el);
		hiddenContext.fillStyle = `rgb(0, 0, ${i})`;
		hiddenContext.lineWidth = 10;
		hiddenContext.fill();
		// hiddenContext.stroke();
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
		d3.json(
			"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
		),
		d3.json(
			"https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
		),
	]).then(([geoData, earthquakeData, tectonicData]) => {
		//]).then(([geoData, tectonicData]) => {

		var map = feature(geoData, geoData.objects.countries);

		timer = d3.timer(render);

		function render(elapsed) {
			currentTime = d3.now();
			let diff = currentTime - prevTime;
			prevTime = currentTime;

			hiddenContext.clearRect(0, 0, 900, 600);
			drawHiddenCanvas(map, earthquakeData);

			canvas.on("mousemove", highlightPicking);

			if (diff < elapsed) {
				let rotation = projection.rotate();
				rotation[0] += diff / 50;
				rotation[1] = config.verticalTilt;
				rotation[2] = config.horizontalTilt;
				projection.rotate(rotation);

				context.clearRect(0, 0, 900, 600);

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

				earthquakeData.features.forEach(d => {
					context.beginPath();
					geoPath(d);
					context.fillStyle = "orange";
					context.strokeStyle = "orange";
					context.lineWidth = 5;
					context.fill();
					context.stroke();
				});
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

				const inEarth = inGlobe(pos);

				if (inEarth && config.timerActive) {
					config.timerActive = false;
					timer.stop();
				}
				if (!inEarth && !config.timerActive) {
					config.timerActive = true;

					timer.restart(render);
				}

				const selected =
					inEarth && pickedColor[3] === 255 ? pickedColor[0] : false; // checking for inGlobe (above) and antialiasing

				const selectedEarthquake =
					inEarth && pickedColor[3] === 255 ? pickedColor[2] : false; // checking for inGlobe (above) and antialiasing

				//const country = map.features[selected].properties.name;
				const eq = earthquakeData.features[selectedEarthquake];
				if (selectedEarthquake !== false) showTooltip(pos, eq); // build tooltip
				if (selectedEarthquake === false) hideTooltip();
			}
		}

		// checking if the position is within the globe bounds
		function inGlobe(pos) {
			return (
				Math.abs(pos[0] - projection(projection.invert(pos))[0]) <
					0.5 &&
				Math.abs(pos[1] - projection(projection.invert(pos))[1]) < 0.5
			);
		}

		function showTooltip(mouse, element) {
			var data = element.properties;
			d3.select("#info-header h1").html("Additional Information");
			d3.select(".date").html(
				`Date: ${new Date(data.time).toUTCString()}`
			);
			d3.select(".magnitude").html(`Magnitude: ${data.mag}`);
			d3.select(".location-string").html(`Location: ${data.place}`);
			d3.select(".coordinates").html(
				`Coordinates: [${element.geometry.coordinates[0]}, ${element.geometry.coordinates[1]}]`
			);

			d3.select("#info-card")
				.style("left", mouse[0] + 20 + "px")
				.style("top", mouse[1] + 20 + "px")
				.transition()
				.duration(50)
				.style("opacity", 0.98);
		}

		function hideTooltip() {
			d3.select("#info-card")
				.transition()
				.duration(50)
				.style("opacity", 0);
		}
	});
}
