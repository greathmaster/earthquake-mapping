import { select, json, geoPath, geoMercator, geoOrthographic, zoom, event } from "d3";
import { feature } from "topojson";
import "../styles/styles.css";

const svg = select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const projection = geoOrthographic();
const pathGenerator = geoPath().projection(projection);

svg.append("path")
	.attr("class", "sphere")
	.attr("d", pathGenerator({ type: "Sphere" }));

//TODO: consider adding debouncing, one scroll make ~100 events
svg.call(
	zoom().on("zoom", () => {
		g.attr('transform', event.transform)
	})
);

json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(
	data => {
		const countries = feature(data, data.objects.countries);

		svg.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "country")
			.attr("d", d => pathGenerator(d))
			.append("title")
			.text(d => {
				return d.properties.name;
			});
	}
);

// svg.style("background-color", "blue")
