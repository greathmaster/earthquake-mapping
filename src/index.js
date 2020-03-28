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
function drawHiddenCanvas(geo) {
	var countries = geo.features;
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
		//	d3.json(
		//		"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
		//	),
		d3.json(
			"https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
		),
		//	]).then(([geoData, earthquakeData, tectonicData]) => {
	]).then(([geoData, tectonicData]) => {
		canvas.on("mousemove", highlightPicking);

		var map = feature(geoData, geoData.objects.countries);

		timer = d3.timer(render);

		function render(elapsed) {
			currentTime = d3.now();
			let diff = currentTime - prevTime;
			prevTime = currentTime;

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

				let earthquakeData = {
					type: "FeatureCollection",
					metadata: {
						generated: 1585419428000,
						url:
							"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
						title: "USGS Significant Earthquakes, Past Month",
						status: 200,
						api: "1.8.1",
						count: 14,
					},
					features: [
						{
							type: "Feature",
							properties: {
								mag: 5,
								place: "41km W of Mentone, Texas",
								time: 1585235787715,
								updated: 1585418215394,
								tz: -360,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us70008ggn",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us70008ggn.geojson",
								felt: 1836,
								cdi: 5.3,
								mmi: 5.608,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 915,
								net: "us",
								code: "70008ggn",
								ids: ",us70008ggn,",
								sources: ",us,",
								types:
									",dyfi,general-text,geoserve,ground-failure,losspager,moment-tensor,oaf,origin,phase-data,shakemap,",
								nst: null,
								dmin: 0.224,
								rms: 0.78,
								gap: 43,
								magType: "mww",
								type: "earthquake",
								title: "M 5.0 - 41km W of Mentone, Texas",
							},
							geometry: {
								type: "Point",
								coordinates: [-104.0386, 31.7078, 6.64],
							},
							id: "us70008ggn",
						},
						{
							type: "Feature",
							properties: {
								mag: 7.5,
								place: "219km SSE of Severo-Kuril'sk, Russia",
								time: 1585104561313,
								updated: 1585244167763,
								tz: 660,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us70008fi4",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us70008fi4.geojson",
								felt: 27,
								cdi: 5.6,
								mmi: 5.246,
								alert: "green",
								status: "reviewed",
								tsunami: 1,
								sig: 881,
								net: "us",
								code: "70008fi4",
								ids: ",at00q7qai7,pt20085000,us70008fi4,",
								sources: ",at,pt,us,",
								types:
									",dyfi,finite-fault,general-text,geoserve,ground-failure,impact-link,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: null,
								dmin: 4.087,
								rms: 0.85,
								gap: 39,
								magType: "mww",
								type: "earthquake",
								title:
									"M 7.5 - 219km SSE of Severo-Kuril'sk, Russia",
							},
							geometry: {
								type: "Point",
								coordinates: [157.6933, 48.9864, 56.65],
							},
							id: "us70008fi4",
						},
						{
							type: "Feature",
							properties: {
								mag: 3.94,
								place: "8km NNE of Magna, Utah",
								time: 1584926235310,
								updated: 1585322812957,
								tz: -420,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/uu60369062",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/uu60369062.geojson",
								felt: 5296,
								cdi: 4.2,
								mmi: 4.73,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 659,
								net: "uu",
								code: "60369062",
								ids: ",uu60369062,us70008eak,",
								sources: ",uu,us,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: 44,
								dmin: 0.01894,
								rms: 0.19,
								gap: 52,
								magType: "ml",
								type: "earthquake",
								title: "M 3.9 - 8km NNE of Magna, Utah",
							},
							geometry: {
								type: "Point",
								coordinates: [-112.053, 40.779, 9.98],
							},
							id: "uu60369062",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.4,
								place: "3km SW of Kasina, Croatia",
								time: 1584854643828,
								updated: 1585327136820,
								tz: 60,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us70008dx7",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us70008dx7.geojson",
								felt: 1178,
								cdi: 7.5,
								mmi: 6.787,
								alert: "yellow",
								status: "reviewed",
								tsunami: 0,
								sig: 1400,
								net: "us",
								code: "70008dx7",
								ids: ",us70008dx7,",
								sources: ",us,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: null,
								dmin: 0.802,
								rms: 0.8,
								gap: 13,
								magType: "mww",
								type: "earthquake",
								title: "M 5.4 - 3km SW of Kasina, Croatia",
							},
							geometry: {
								type: "Point",
								coordinates: [15.9662, 45.8972, 10],
							},
							id: "us70008dx7",
						},
						{
							type: "Feature",
							properties: {
								mag: 4.5,
								place: "6km N of Johnson Lane, Nevada",
								time: 1584754415369,
								updated: 1585330718464,
								tz: -480,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/nn00719663",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/nn00719663.geojson",
								felt: 6810,
								cdi: 5.1,
								mmi: 5.16,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 822,
								net: "nn",
								code: "00719663",
								ids: ",nn00719663,us70008dbv,",
								sources: ",nn,us,",
								types:
									",dyfi,geoserve,ground-failure,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: 31,
								dmin: 0.029,
								rms: 0.1334,
								gap: 28.07,
								magType: "ml",
								type: "earthquake",
								title: "M 4.5 - 6km N of Johnson Lane, Nevada",
							},
							geometry: {
								type: "Point",
								coordinates: [-119.7361, 39.1112, 8.4],
							},
							id: "nn00719663",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.7,
								place: "24km E of Xegar, China",
								time: 1584667995377,
								updated: 1585262793080,
								tz: 480,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us70008cld",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us70008cld.geojson",
								felt: 12,
								cdi: 8.6,
								mmi: 6.731,
								alert: "yellow",
								status: "reviewed",
								tsunami: 0,
								sig: 660,
								net: "us",
								code: "70008cld",
								ids: ",us70008cld,",
								sources: ",us,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: null,
								dmin: 0.79,
								rms: 0.89,
								gap: 30,
								magType: "mww",
								type: "earthquake",
								title: "M 5.7 - 24km E of Xegar, China",
							},
							geometry: {
								type: "Point",
								coordinates: [87.3298, 28.6065, 10],
							},
							id: "us70008cld",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.21,
								place: "15km W of Petrolia, CA",
								time: 1584569300920,
								updated: 1585372373273,
								tz: -480,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/nc73355700",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/nc73355700.geojson",
								felt: 1941,
								cdi: 6.4,
								mmi: 5.89,
								alert: "green",
								status: "reviewed",
								tsunami: 1,
								sig: 1058,
								net: "nc",
								code: "73355700",
								ids: ",at00q7ethv,nc73355700,us70008bvk,",
								sources: ",at,nc,us,",
								types:
									",dyfi,geoserve,ground-failure,impact-link,losspager,moment-tensor,nearby-cities,oaf,origin,phase-data,scitech-link,shake-alert,shakemap,",
								nst: 34,
								dmin: 0.105,
								rms: 0.16,
								gap: 248,
								magType: "mw",
								type: "earthquake",
								title: "M 5.2 - 15km W of Petrolia, CA",
							},
							geometry: {
								type: "Point",
								coordinates: [-124.4561667, 40.3475, 28.61],
							},
							id: "nc73355700",
						},
						{
							type: "Feature",
							properties: {
								mag: 4.57,
								place: "5km NE of Magna, Utah",
								time: 1584558743610,
								updated: 1585375972299,
								tz: -420,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/uu60364832",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/uu60364832.geojson",
								felt: 3956,
								cdi: 5.4,
								mmi: 5.59,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 861,
								net: "uu",
								code: "60364832",
								ids: ",uu60364832,us70008bq9,",
								sources: ",uu,us,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: 39,
								dmin: 0.02976,
								rms: 0.21,
								gap: 47,
								magType: "mw",
								type: "earthquake",
								title: "M 4.6 - 5km NE of Magna, Utah",
							},
							geometry: {
								type: "Point",
								coordinates: [-112.059, 40.751, 10.65],
							},
							id: "uu60364832",
						},
						{
							type: "Feature",
							properties: {
								mag: 6.2,
								place: "246km S of Kangin, Indonesia",
								time: 1584553538838,
								updated: 1584808095002,
								tz: 480,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us60008hzl",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us60008hzl.geojson",
								felt: 154,
								cdi: 5.8,
								mmi: 0,
								alert: "green",
								status: "reviewed",
								tsunami: 1,
								sig: 681,
								net: "us",
								code: "60008hzl",
								ids: ",us60008hzl,",
								sources: ",us,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: null,
								dmin: 2.747,
								rms: 1.06,
								gap: 24,
								magType: "mww",
								type: "earthquake",
								title: "M 6.2 - 246km S of Kangin, Indonesia",
							},
							geometry: {
								type: "Point",
								coordinates: [115.131, -11.0591, 17.59],
							},
							id: "us60008hzl",
						},
						{
							type: "Feature",
							properties: {
								mag: 4.59,
								place: "7km NNE of Magna, Utah",
								time: 1584540132830,
								updated: 1585287757936,
								tz: -420,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/uu60363822",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/uu60363822.geojson",
								felt: 1395,
								cdi: 6,
								mmi: 4.65,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 924,
								net: "uu",
								code: "60363822",
								ids: ",us60008ht8,uu60363822,",
								sources: ",us,uu,",
								types:
									",dyfi,geoserve,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: 21,
								dmin: 0.03587,
								rms: 0.19,
								gap: 58,
								magType: "mw",
								type: "earthquake",
								title: "M 4.6 - 7km NNE of Magna, Utah",
							},
							geometry: {
								type: "Point",
								coordinates: [-112.0693333, 40.7605, 9.07],
							},
							id: "uu60363822",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.7,
								place: "6km NNE of Magna, Utah",
								time: 1584536971530,
								updated: 1585412384809,
								tz: -420,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/uu60363602",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/uu60363602.geojson",
								felt: 36060,
								cdi: 6.7,
								mmi: 7.77,
								alert: "yellow",
								status: "reviewed",
								tsunami: 0,
								sig: 1320,
								net: "uu",
								code: "60363602",
								ids: ",uu60363602,us60008hqt,",
								sources: ",uu,us,",
								types:
									",dyfi,general-link,general-text,geoserve,ground-failure,losspager,moment-tensor,oaf,origin,phase-data,shakemap,",
								nst: 54,
								dmin: 0.04022,
								rms: 0.2,
								gap: 50,
								magType: "mw",
								type: "earthquake",
								title: "M 5.7 - 6km NNE of Magna, Utah",
							},
							geometry: {
								type: "Point",
								coordinates: [-112.0783333, 40.751, 11.9],
							},
							id: "uu60363602",
						},
						{
							type: "Feature",
							properties: {
								mag: 6.3,
								place: "298km NE of Raoul Island, New Zealand",
								time: 1584180077383,
								updated: 1584266633243,
								tz: -720,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/us60008fl8",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us60008fl8.geojson",
								felt: 3,
								cdi: 2.4,
								mmi: 0,
								alert: "green",
								status: "reviewed",
								tsunami: 1,
								sig: 611,
								net: "us",
								code: "60008fl8",
								ids: ",us60008fl8,pt20074000,at00q76h61,",
								sources: ",us,pt,at,",
								types:
									",associate,dyfi,geoserve,impact-link,losspager,moment-tensor,origin,phase-data,shakemap,",
								nst: null,
								dmin: 2.687,
								rms: 1.03,
								gap: 22,
								magType: "mww",
								type: "earthquake",
								title:
									"M 6.3 - 298km NE of Raoul Island, New Zealand",
							},
							geometry: {
								type: "Point",
								coordinates: [-175.6847, -27.4196, 10],
							},
							id: "us60008fl8",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.77,
								place: "69km W of Petrolia, CA",
								time: 1583722748860,
								updated: 1585364957143,
								tz: -480,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/nc73351710",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/nc73351710.geojson",
								felt: 2836,
								cdi: 5.6,
								mmi: 4.83,
								alert: "green",
								status: "reviewed",
								tsunami: 1,
								sig: 1072,
								net: "nc",
								code: "73351710",
								ids: ",nc73351710,at00q6woai,us60008ca4,",
								sources: ",nc,at,us,",
								types:
									",dyfi,geoserve,ground-failure,impact-link,losspager,moment-tensor,nearby-cities,oaf,origin,phase-data,scitech-link,shakemap,",
								nst: 40,
								dmin: 0.5832,
								rms: 0.29,
								gap: 277,
								magType: "mw",
								type: "earthquake",
								title: "M 5.8 - 69km W of Petrolia, CA",
							},
							geometry: {
								type: "Point",
								coordinates: [-125.0936667, 40.3916667, 3.19],
							},
							id: "nc73351710",
						},
						{
							type: "Feature",
							properties: {
								mag: 5.49,
								place: "71km SE of Estacion Coahuila, B.C., MX",
								time: 1583553123180,
								updated: 1584846674628,
								tz: -420,
								url:
									"https://earthquake.usgs.gov/earthquakes/eventpage/ci38385946",
								detail:
									"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/ci38385946.geojson",
								felt: 4806,
								cdi: 4.8,
								mmi: 6.64,
								alert: "green",
								status: "reviewed",
								tsunami: 0,
								sig: 944,
								net: "ci",
								code: "38385946",
								ids: ",us60008bh2,ci38385946,",
								sources: ",us,ci,",
								types:
									",dyfi,geoserve,ground-failure,losspager,moment-tensor,nearby-cities,origin,phase-data,scitech-link,shake-alert,shakemap,trump-losspager,trump-shakemap,",
								nst: 13,
								dmin: 0.3208,
								rms: 0.35,
								gap: 106,
								magType: "mw",
								type: "earthquake",
								title:
									"M 5.5 - 71km SE of Estacion Coahuila, B.C., MX",
							},
							geometry: {
								type: "Point",
								coordinates: [-114.5405, 31.6893333, 9.98],
							},
							id: "ci38385946",
						},
					],
					bbox: [-175.6847, -27.4196, 3.19, 157.6933, 48.9864, 56.65],
				};

				earthquakeData.features.forEach(d => {
					context.beginPath();
					geoPath(d);
					context.fillStyle = "red";
					context.strokeStyle = "red";
					context.lineWidth = 5;
					context.fill();
					context.stroke();
				});
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

			//const country = map.features[selected].properties.name;
			const country = map.features[selected];
			// console.log(country)
			if (selected !== false) showTooltip(pos, country); // build tooltip
			if (selected === false) hideTooltip();
		}

		function showTooltip(mouse, element) {
			console.log("toolitp")
			var countryProps = element.properties;
		
				d3.select("#info-header h1").html("Hi Card");
				d3.select("#info-header div").html("Hi detils");

				d3.select("#info-card")
					.style("left", mouse[0] + 20 + "px")
					.style("top", mouse[1] + 20 + "px")
					.transition()
					.duration(100)
					.style("opacity", 0.98);
			
		}

		function hideTooltip() {
			console.log("hide tooltip")
			d3.select('#info-card')
			  .transition().duration(100)
			  .style('opacity', 0);
		  }
	});
}
