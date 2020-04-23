import * as d3 from "d3";
import { feature } from "topojson";
import "../styles/styles.css";
import noUiSlider from "nouislider";
import "nouislider/distribute/nouislider.css";
import wNumb from "wnumb";

let WIDTH = window.innerHeight;
let HEIGHT = window.innerHeight;

var config = {
	speed: 1,
	verticalTilt: -15,
	horizontalTilt: 0,
	countries: null,
	timerActive: false,
	accumulatedRotation: 0,
};

const projection = d3
	.geoOrthographic()
	.translate([WIDTH / 2, HEIGHT / 2])
	.clipAngle(90);
const canvas = d3
	.select("#visible")
	.attr("width", WIDTH)
	.attr("height", HEIGHT);

const context = canvas.node().getContext("2d");

var hiddenCanvas = d3
	.select("#hidden")
	.attr("width", 10 * WIDTH)
	.attr("height", HEIGHT);

var hiddenContext = hiddenCanvas.node().getContext("2d");

var hiddenProjection = d3.geoEquirectangular();

var hiddenPath = d3.geoPath(hiddenProjection, hiddenContext);

//Taken from: https://observablehq.com/@camargo/canvas-picking-with-a-hidden-canvas
function* rgbColorGenerator() {
	let nextColor = 1;
	const nextColorStep = 500;

	while (nextColor < 16777216) {
		const rgb = [];

		rgb.push(nextColor & 0xff); // R.
		rgb.push((nextColor & 0xff00) >> 8); // G.
		rgb.push((nextColor & 0xff0000) >> 16); // B.

		nextColor += nextColorStep;
		yield `rgb(${rgb.join(",")})`;
	}
}

let colorToPoint = {};

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


var slider = document.getElementById("slider");
noUiSlider.create(slider, {
	start: [4.5, 10.0],
	// tooltips: [wNumb({ decimals: 1 }), wNumb({ decimals: 1 })],
	connect: true,
	range: {
		min: 4.5,
		max: 10.0,
	},
	
	pips: {
		mode: "steps",
		density: 1 / 0.55,
		filter: filterPips,
		format: wNumb({
			decimals: 1,
		}),
	},
});
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("legend-line-1").addEventListener("click", () => {
		slider.noUiSlider.set([4.5, 5.0]);
	});
	document.getElementById("legend-line-2").addEventListener("click", () => {
		slider.noUiSlider.set([5.01, 6.50]);
	});
	document.getElementById("legend-line-3").addEventListener("click", () => {
		slider.noUiSlider.set([6.51, 10.0]);
	});
	
	document.getElementById("reset-slider-1").addEventListener("click", () => {
		slider.noUiSlider.set([4.5, 10.0]);
	})
	document.getElementById("reset-slider-2").addEventListener("click", () => {
		slider.noUiSlider.set([4.5, 10.0])
	})
});

drawEarth();
function filterPips(value, type) {
	if ((value * 10) % 10 === 0) {
		return 1;
	}
	
	if ((value * 10) % 5 === 0) {
		return 2;
	}

	return 0;
}

function drawEarth() {
	Promise.all([
		d3.json(
			"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
		),
		d3.json(
			// "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
			"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
			//"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson"
		),
		d3.json(
			"https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
		),
	]).then(([geoData, earthquakeData, tectonicData]) => {
		// ]).then(([geoData, tectonicData]) => {

		var map = feature(geoData, geoData.objects.countries);

		timer = d3.timer(render);

		function drawHiddenCanvas(geo, earthquakeData) {
			let mag = slider.noUiSlider.get();

			// var countries = geo.features;
			// countries.forEach(function (el, i) {

			// 		hiddenContext.beginPath();
			// 		hiddenPath(el);
			// 		hiddenContext.fillStyle = "blue";
			// 		hiddenContext.fill();
			// 		hiddenContext.closePath();

			// });
			const hiddenCanvasColor = rgbColorGenerator();
			earthquakeData.features.forEach((el, i) => {

				if (
					parseFloat(mag[0]) <= parseFloat(el.properties.mag) &&
					parseFloat(mag[1]) >= parseFloat(el.properties.mag)
				) {

						

					hiddenContext.beginPath();
					let color = hiddenCanvasColor.next().value;
					hiddenContext.fillStyle = color;
					hiddenPath(el);
					colorToPoint[color] = el;
					hiddenContext.fill();
				}
			});
			hiddenContext.closePath();
		}

		function render(elapsed) {
			currentTime = d3.now();
			let diff = currentTime - prevTime;
			prevTime = currentTime;

			hiddenContext.clearRect(0, 0, 10*WIDTH, HEIGHT);
			drawHiddenCanvas(map, earthquakeData);

			canvas.on("mousemove", highlightPicking);

			if (diff < elapsed) {
				let rotation = projection.rotate();
				rotation[0] += diff / 50;
				rotation[1] = config.verticalTilt;
				rotation[2] = config.horizontalTilt;
				projection.rotate(rotation);

				context.clearRect(0, 0, WIDTH, HEIGHT);

				context.beginPath();
				geoPath(sphere);
				context.fillStyle = "#D9EAEF";
				context.fill();

				map.features.forEach((d) => {
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

				tectonicData.features.forEach((d) => {
					context.beginPath();
					geoPath(d);
					context.fillStyle = "red";
					context.strokeStyle = "red";
					context.lineWidth = 1;
					// context.fill();
					context.stroke();
				});
				let mag = slider.noUiSlider.get();

				let minLabel = mag[0];
				let maxLabel = mag[1];

				let format = wNumb({ decimals: 1 });

				if (mag != undefined) {
					document.getElementById(
						"min-mag-label"
					).innerHTML = format.to(parseFloat(minLabel));
					document.getElementById(
						"max-mag-label"
					).innerHTML = format.to(parseFloat(maxLabel));
				}
				earthquakeData.features.forEach((d) => {
					if (
						parseFloat(mag[0]) <= parseFloat(d.properties.mag) &&
						parseFloat(mag[1]) >= parseFloat(d.properties.mag)
					) {
						let color = "rgba(243, 229, 37, 0.897)"; //yellow
						if (
							parseFloat(d.properties.mag) > 5.0 &&
							parseFloat(d.properties.mag) <= 6.5
						) {
							color = "orange";
						}
						if (parseFloat(d.properties.mag) > 6.5) {
							color = "red";
						}
						context.beginPath();
						geoPath(d);
						context.fillStyle = color;
						context.fill();
					}
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

				const selectedEarthquake =
					inEarth &&
					colorToPoint[
						`rgb(${pickedColor[0]},${pickedColor[1]},${pickedColor[2]})`
					];
				if (!!selectedEarthquake) showTooltip(pos, selectedEarthquake); // build tooltip
				if (!!!selectedEarthquake) hideTooltip();
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
			if (element === undefined) return "";

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
