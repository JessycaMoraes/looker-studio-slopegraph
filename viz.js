// A função drawViz deve ser mantida fora do looker.plugins.visualizations.add
// para ser uma função global, ou você pode encapsulá-la dentro do objeto
// looker.plugins.visualizations.add se for uma função auxiliar exclusiva.
// Para simplicidade, vamos mantê-la como está, mas corrigir a chamada.

function drawViz(data, element, config) {
  // Limpa o elemento DOM do host da visualização para evitar gráficos sobrepostos
  element.innerHTML = "";

  // Verifica se há dados
  const ds = data.tables.DEFAULT;
  if (!ds || ds.length === 0) {
    // Exibe uma mensagem se não houver dados
    element.innerHTML = "<p>Nenhum dado disponível para exibir o Slopegraph.</p>";
    return;
  }

  // Mapeia os dados das colunas. As colunas são assumidas como:
  // Coluna 0: Categoria (texto)
  // Coluna 1: Valor 1 (numérico)
  // Coluna 2: Valor 2 (numérico)
  const categories = ds.map(row => row[0].formatted);
  const value1 = ds.map(row => row[1].parsed);
  const value2 = ds.map(row => row[2].parsed);

  // Define as dimensões do SVG e margens
  const width = element.clientWidth > 0 ? element.clientWidth : 600; // Usa largura disponível ou padrão
  const height = element.clientHeight > 0 ? element.clientHeight : 400; // Usa altura disponível ou padrão
  const margin = { top: 30, bottom: 30, left: 100, right: 100 }; // Margens ajustadas para rótulos

  // Cria o elemento SVG
  const svg = d3.select(element)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Define a escala linear para os valores
  const valueScale = d3.scaleLinear()
    .domain([d3.min([...value1, ...value2]), d3.max([...value1, ...value2])])
    .range([height - margin.bottom, margin.top]); // Inverte a ordem para que valores maiores fiquem no topo

  // Define a escala para as posições X dos dois pontos (Valor 1 e Valor 2)
  const xScale = d3.scalePoint()
    .domain(["Valor 1", "Valor 2"]) // Nomes dos pontos de dados
    .range([margin.left, width - margin.right]);

  // Obtém as opções de estilo do Looker Studio ou usa valores padrão
  const lineColor = config.options.lineColor?.value || "#007acc";
  const textColor = config.options.textColor?.value || "#333333";
  const textSize = config.options.textSize?.value || 12;
  const lineWidth = config.options.lineWidth?.value || 2;
  const showGrid = config.options.showGrid?.value !== false; // Se a opção não existe ou é false, mostra grade
  const showCategoryLabels = config.options.showCategoryLabels?.value !== false; // Se a opção não existe ou é false, mostra rótulos

  // Desenha as linhas de grade vertical (se ativado)
  if (showGrid) {
    svg.selectAll(".grid-line")
      .data(xScale.domain())
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("y1", margin.top)
      .attr("x2", d => xScale(d))
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");
  }

  // Desenha as linhas do slopegraph
  categories.forEach((category, i) => {
    svg.append("line")
      .attr("x1", xScale("Valor 1"))
      .attr("y1", valueScale(value1[i]))
      .attr("x2", xScale("Valor 2"))
      .attr("y2", valueScale(value2[i]))
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    // Adiciona círculos nos pontos de dados
    svg.append("circle")
      .attr("cx", xScale("Valor 1"))
      .attr("cy", valueScale(value1[i]))
      .attr("r", 4) // Raio do círculo
      .attr("fill", lineColor);

    svg.append("circle")
      .attr("cx", xScale("Valor 2"))
      .attr("cy", valueScale(value2[i]))
      .attr("r", 4) // Raio do círculo
      .attr("fill", lineColor);

    // Adiciona rótulos de categoria no lado esquerdo (se ativado)
    if (showCategoryLabels) {
      svg.append("text")
        .attr("x", xScale("Valor 1") - 10)
        .attr("y", valueScale(value1[i]) + 5)
        .attr("text-anchor", "end")
        .text(category)
        .attr("fill", textColor)
        .attr("font-size", `${textSize}px`);
    }

    // Adiciona rótulos de valor para o Valor 1
    svg.append("text")
      .attr("x", xScale("Valor 1") - 10)
      .attr("y", valueScale(value1[i]) + 5)
      .attr("text-anchor", "end")
      .text(`${value1[i]}`)
      .attr("fill", textColor)
      .attr("font-size", `${textSize}px`);

    // Adiciona rótulos de valor para o Valor 2
    svg.append("text")
      .attr("x", xScale("Valor 2") + 10)
      .attr("y", valueScale(value2[i]) + 5)
      .attr("text-anchor", "start")
      .text(`${value2[i]}`)
      .attr("fill", textColor)
      .attr("font-size", `${textSize}px`);
  });

  // Adiciona os rótulos "Valor 1" e "Valor 2" no topo
  svg.append("text")
    .attr("x", xScale("Valor 1"))
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .text("Valor 1")
    .attr("fill", textColor)
    .attr("font-size", `${textSize + 2}px`) // Um pouco maior
    .attr("font-weight", "bold");

  svg.append("text")
    .attr("x", xScale("Valor 2"))
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .text("Valor 2")
    .attr("fill", textColor)
    .attr("font-size", `${textSize + 2}px`) // Um pouco maior
    .attr("font-weight", "bold");
}

// Registro da Visualização na API do Looker Studio
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
  // O método 'create' é chamado uma vez quando a visualização é inicializada
  // Aqui, você pode fazer setup inicial do DOM se necessário.
  // Não carregue o D3.js aqui, pois ele já será carregado via manifest.json.
  create: function (element, config) {
    // Você pode adicionar um estilo CSS básico aqui, se não for usar um arquivo .css separado
    // Ex: element.style.fontFamily = "sans-serif";
  },
  // O método 'update' é chamado sempre que os dados ou as configurações mudam
  update: function (data, element, config) {
    // Chame a função drawViz globalmente definida para desenhar/redesenhar o gráfico.
    drawViz(data, element, config);
  }
});
