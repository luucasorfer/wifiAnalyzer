// File: static/js/chartjs.js
document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("nivel6Chart").getContext("2d");
  let chartInstance = null;

  function criarGraficoBase(ssid) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    const data = {
      labels: [],
      datasets: [
        {
          label: `RSSI de ${ssid}`,
          data: [],
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
    const config = {
      type: "line",
      data,
      options: {
        responsive: true,
        plugins: {
          title: { display: false, text: `RSSI para "${ssid}"` },
          legend: { display: false }, // Legenda ocultada
        },
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: "RSSI (dBm)" },
          },
          x: { title: { display: false, text: "Medidas mais recentes" } },
        },
      },
    };
    chartInstance = new Chart(ctx, config);
  }

  function atualizarGrafico(ssid, last_n) {
    const nivel4 = JSON.parse(localStorage.getItem("nivel_4") || "{}");
    if (!nivel4[ssid] || !nivel4[ssid].rssi_values) {
      alert(`Sem dados de RSSI para a rede "${ssid}".`);
      return false; // indica que não tem dados
    }

    const todosValores = nivel4[ssid].rssi_values;
    if (todosValores.length < last_n) {
      // Ainda não tem dados suficientes
      return false;
    }

    const dadosRecentes = todosValores.slice(-last_n);

    criarGraficoBase(ssid);

    chartInstance.options.plugins.title.text = `Últimas ${last_n} medições de RSSI para "${ssid}"`;
    chartInstance.data.labels = dadosRecentes.map((_, i) => `Medida ${i + 1}`);
    chartInstance.data.datasets[0].label = `RSSI de ${ssid}`;
    chartInstance.data.datasets[0].data = dadosRecentes;
    chartInstance.update();

    const average =
      dadosRecentes.reduce((a, b) => a + b, 0) / dadosRecentes.length;
    const min = Math.min(...dadosRecentes);
    const max = Math.max(...dadosRecentes);
    const mediaGeral =
      todosValores.reduce((a, b) => a + b, 0) / todosValores.length;

    document.getElementById("analyzedNetwork").textContent = ssid;
    document.getElementById("averageRssi").textContent = mediaGeral.toFixed(2);
    document.getElementById("lastNAverage").textContent = average.toFixed(2);
    document.getElementById("minValue").textContent = min;
    document.getElementById("maxValue").textContent = max;

    return true; // dados atualizados com sucesso
  }

  // Função que vai monitorar as atualizações no localStorage para mostrar gráfico atualizado
  function monitorarAtualizacoes() {
    const paramJSON = localStorage.getItem("nivel_6_param");
    if (!paramJSON) return;

    const param = JSON.parse(paramJSON);
    if (param.status !== "pending") return; // só roda se estiver pending

    const ssid = param.ssid;
    const last_n = param.last_n;

    const atualizado = atualizarGrafico(ssid, last_n);
    if (atualizado) {
      // Quando os dados estiverem prontos, mudamos o status para 'done'
      param.status = "done";
      localStorage.setItem("nivel_6_param", JSON.stringify(param));
    }
  }

  // Evento do botão analisar
  document.getElementById("analyzeBtn").addEventListener("click", () => {
    const ssid = document.getElementById("networkName").value.trim();
    const lastN = parseInt(document.getElementById("measurements").value, 10);

    if (!ssid) {
      alert("Digite o nome da rede.");
      return;
    }

    if (isNaN(lastN) || lastN <= 0) {
      alert("Digite um número válido para medidas.");
      return;
    }

    // Define o parâmetro no localStorage com status "pending"
    const param = {
      ssid: ssid,
      last_n: lastN,
      status: "pending",
    };
    localStorage.setItem("nivel_6_param", JSON.stringify(param));

    // Tenta atualizar imediatamente (se já tiver dados)
    if (!atualizarGrafico(ssid, lastN)) {
      // Se ainda não tiver dados suficientes, mostra mensagem e aguarda monitorarAtualizacoes
      alert("Aguardando novas medições para atualizar o gráfico...");
    }
  });

  // Verifica atualizações a cada 2 segundos (ou o intervalo que desejar)
  setInterval(monitorarAtualizacoes, 2000);
});
