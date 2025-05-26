function drawViz(data, element, config) {
  element.innerHTML = "";

  const ds = data.tables.DEFAULT;
  if (ds.length === 0) return;

  const categories = ds.map(row => row[0].formatted);
  const value1 = ds.map(row => row[1].parsed);
  const value2 = ds.map(row => row[2].parsed);

  const width = 600;
  const height = 400;
  const margin = { top: 20, bottom: 20, left: 100, right: 100 };

  const svg = d3.select(element)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const valueScale = d3.scaleLinear()
    .domain([d3.min([...value1, ...value2]), d3.max([...value1, ...value2])])
    .range([height - margin.bottom, margin.top]);

  const xScale = d3.scalePoint()
    .domain(["Valor 1", "Valor 2"])
    .range([margin.left, width - margin.right]);

  const lineColor = config.options.lineColor || "#007acc";
  const textColor = config.options.textColor || "#333";
  const textSize = config.options.textSize || 12;
  const lineWidth = config.options.lineWidth || 2;
  const showGrid = config.options.showGrid !== false;
  const showCategoryLabels = config.options.showCategoryLabels !== false;

  if (showGrid) {
    const yTicks = valueScale.ticks(5);
    svg.selectAll("line.grid")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", margin.left - 10)
      .attr("x2", width - margin.right + 10)
      .attr("y1", d => valueScale(d))
      .attr("y2", d => valueScale(d))
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "4,2");
  }

  categories.forEach((cat, i) => {
    svg.append("line")
      .attr("x1", xScale("Valor 1"))
      .attr("y1", valueScale(value1[i]))
      .attr("x2", xScale("Valor 2"))
      .attr("y2", valueScale(value2[i]))
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    if (showCategoryLabels) {
      svg.append("text")
        .attr("x", xScale("Valor 1") - 10)
        .attr("y", valueScale(value1[i]) + 5)
        .attr("text-anchor", "end")
        .text(`${cat} (${value1[i]})`)
        .attr("fill", textColor)
        .attr("font-size", `${textSize}px`);

      svg.append("text")
        .attr("x", xScale("Valor 2") + 10)
        .attr("y", valueScale(value2[i]) + 5)
        .attr("text-anchor", "start")
        .text(`${value2[i]}`)
        .attr("fill", textColor)
        .attr("font-size", `${textSize}px`);
    }
  });
}

looker.plugins.visualizations.add({
  id: "slopegraph_custom",
  label: "Slopegraph",
  options: {
    lineColor: {
      type: "COLOR",
      label: "Cor das linhas",
      defaultValue: "#007acc"
    },
    textColor: {
      type: "COLOR",
      label: "Cor do texto",
      defaultValue: "#333333"
    },
    textSize: {
      type: "NUMBER",
      label: "Tamanho do texto",
      defaultValue: 12
    },
    lineWidth: {
      type: "NUMBER",
      label: "Espessura da linha",
      defaultValue: 2
    },
    showGrid: {
      type: "BOOLEAN",
      label: "Mostrar linhas de grade",
      defaultValue: true
    },
    showCategoryLabels: {
      type: "BOOLEAN",
      label: "Mostrar rótulos das categorias",
      defaultValue: true
    }
  },
  create: function (element, config) {
    const script = document.createElement("script");
    script.src = "https://d3js.org/d3.v6.min.js";
    script.onload = () => { this.d3Loaded = true; };
    element.appendChild(script);
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    if (this.d3Loaded) {
      drawViz(data, element, config);
      done();
    }
  }
});