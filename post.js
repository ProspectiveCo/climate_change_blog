// This file is used with post.html to inject Perspectives
// because currently Perspectives can not be exported
// through Jupyter.
// So let's simulate it!
// We started by editing post.html lightly to add
// <perspective-viewer> elements at the appropriate cell outputs.
// Then we create the Table objects, and wire up the viewers.

import perspective from "https://cdn.jsdelivr.net/npm/@finos/perspective/dist/cdn/perspective.js";

// TODO: use the final address here.
const TEMPERATURE_DATA_URL =
  "https://prospectiveco.github.io/climate_change_blog/temperature.arrow";
const GLACIER_DATA_URL =
  "https://prospectiveco.github.io/climate_change_blog/glacier_daily_weather.arrow";
const ENERGY_DATA_URL =
  "https://prospectiveco.github.io/climate_change_blog/energy.arrow";

const worker = perspective.worker();

const pv1_layout = {
  filter: [['integer("time")', "==", 2022]],
  columns: ["longitude", "latitude", '- "temperature"', null, null],
  expressions: ['integer("time")', '- "temperature"'],
  plugin: "Map Scatter",
};

const pv2_layout = {
  group_by: ["year"],
  aggregates: { temperature: "avg" },
  columns: ["temperature"],
  expressions: ['// year\ninteger("time")'],
  plugin: "Y Line",
  title: "Temperature Time Series",
};

const pv3_layout = {
  group_by: ["bucket(\"Date\", 'Y')"],
  split_by: ["Glacier"],
  aggregates: { Temperature: "avg" },
  columns: ["Temperature"],
  expressions: ["bucket(\"Date\", 'Y')"],
  plugin: "Y Line",
};

const continent = `
// Continent
(
    "Entity" == 'Africa' or
    "Entity" == 'Asia' or
    "Entity" == 'Europe' or
    "Entity" == 'North America' or
    "Entity" == 'Oceania' or
    "Entity" == 'South America'
)
`.trim();

const fossils = `
// Fossil Fuels
(
    "Type" == 'Oil consumption - TWh' or
    "Type" == 'Coal consumption - TWh' or
    "Type" == 'Gas consumption - TWh'
)
`.trim();

const pv4_layout = {
  group_by: ["Year"],
  split_by: ["Entity"],
  filter: [
    ["Continent", "==", true],
    ["Fossil Fuels", "==", true],
  ],
  aggregates: { TWh: "avg" },
  columns: ["TWh"],
  expressions: [continent, fossils],
  plugin: "Y Area",
  plugin_config: { legend: { left: "56px", top: "10px" } },
};

const pv5_layout = {
  group_by: ["Year"],
  split_by: ["Entity"],
  filter: [
    ["Continent", "==", true],
    ["Fossil Fuels", "==", false],
  ],
  aggregates: { TWh: "avg" },
  columns: ["TWh"],
  expressions: [continent, fossils],
  plugin: "Y Area",
  plugin_config: { legend: { left: "56px", top: "10px" } },
};

const temp_data = await (await fetch(TEMPERATURE_DATA_URL)).arrayBuffer();
const temp_table = worker.table(temp_data);

const glacier_data = await (await fetch(GLACIER_DATA_URL)).arrayBuffer();
const glacier_table = worker.table(glacier_data);

const energy_data = await (await fetch(ENERGY_DATA_URL)).arrayBuffer();
const energy_table = worker.table(energy_data);

const pv1 = document.querySelector("#pv1");
const pv2 = document.querySelector("#pv2");
const pv3 = document.querySelector("#pv3");
const pv4 = document.querySelector("#pv4");
const pv5 = document.querySelector("#pv5");

pv1.load(temp_table);
await pv1.restore(pv1_layout);
pv2.load(temp_table);
await pv2.restore(pv2_layout);

pv3.load(glacier_table);
await pv3.restore(pv3_layout);

pv4.load(energy_table);
await pv4.restore(pv4_layout);

pv5.load(energy_table);
await pv5.restore(pv5_layout);
