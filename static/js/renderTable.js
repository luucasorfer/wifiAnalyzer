// File: static/js/renderTable.js
// Função que lê os dados do localStorage e retorna as redes Wi-Fi
function carregarRedesNivel4() {
  const nivel4JSON = localStorage.getItem("nivel_4");

  if (!nivel4JSON) {
    console.warn("Chave 'nivel_4' não encontrada no localStorage.");
    return [];
  }

  try {
    const dados = JSON.parse(nivel4JSON);

    if (typeof dados === "object" && dados !== null && !Array.isArray(dados)) {
      const redesConvertidas = [];

      for (const nome in dados) {
        const rede = dados[nome];
        if (rede && Array.isArray(rede.rssi_values)) {
          redesConvertidas.push({
            name: nome,
            rssi: rede.rssi_values,
            channel: `${rede.channel} (${rede.frequency} GHz)`,
          });
        }
      }

      return redesConvertidas;
    } else {
      console.warn("Formato inesperado em nivel_4. Esperado: objeto.");
    }

    return [];
  } catch (e) {
    console.error("Erro ao fazer parse de 'nivel_4':", e);
    return [];
  }
}

// Função que monta as tabelas no HTML a partir do array de redes
function atualizarInterface(redes) {
  const wifiListElement = document.getElementById("wifiList");
  const bestRssiListElement = document.getElementById("bestRssiList");

  if (!redes || redes.length === 0) {
    wifiListElement.innerHTML =
      '<div class="text-gray-700">Nenhuma rede abstraída encontrada no localStorage.</div>';
    bestRssiListElement.innerHTML =
      '<div class="text-gray-700">Nenhuma rede para exibir.</div>';
    return;
  }

  const redesComUltimoRssi = redes
    .filter((r) => Array.isArray(r.rssi) && r.rssi.length > 0)
    .map((r) => ({
      name: r.name,
      lastRssi: r.rssi[r.rssi.length - 1],
      channel: r.channel,
    }));

  redesComUltimoRssi.sort((a, b) => a.lastRssi - b.lastRssi);

  let tabelaTodasRedes = `
    <table class="min-w-full border-b border-gray-300 overflow-hidden">
      <thead class="bg-red-100">
        <tr>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Rede</th>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Canal</th>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Frequência (GHz)</th>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Última RSSI (dBm)</th>
        </tr>
      </thead>
      <tbody>
    `;

  redesComUltimoRssi.forEach((rede) => {
    const canalRegex = /^(\d+)\s+\(([\d.]+)\s*GHz\)$/;
    let canal = "";
    let frequencia = "";
    const match = canalRegex.exec(rede.channel);
    if (match) {
      canal = match[1];
      frequencia = match[2];
    }

    tabelaTodasRedes += `
        <tr class="hover:bg-red-50">
          <td class="py-2 px-4 border-b border-gray-300">${rede.name}</td>
          <td class="py-2 px-4 border-b border-gray-300">${canal}</td>
          <td class="py-2 px-4 border-b border-gray-300">${frequencia}</td>
          <td class="py-2 px-4 border-b border-gray-300">${rede.lastRssi}</td>
        </tr>
      `;
  });

  tabelaTodasRedes += `</tbody></table>`;
  wifiListElement.innerHTML = tabelaTodasRedes;

  const top5 = redesComUltimoRssi.slice(-5).reverse();

  let tabelaTop5 = `
    <table class="min-w-full border-b border-gray-300 overflow-hidden">
      <thead class="bg-red-100">
        <tr>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Posição</th>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">Rede</th>
          <th class="text-left uppercase py-1 px-4 border-b border-gray-300">RSSI (dBm)</th>
        </tr>
      </thead>
      <tbody>
    `;

  top5.forEach((rede, i) => {
    tabelaTop5 += `
        <tr class="hover:bg-red-50">
          <td class="py-2 px-4 border-b border-gray-300">${i + 1}</td>
          <td class="py-2 px-4 border-b border-gray-300">${rede.name}</td>
          <td class="py-2 px-4 border-b border-gray-300">${rede.lastRssi}</td>
        </tr>
      `;
  });

  tabelaTop5 += `</tbody></table>`;
  bestRssiListElement.innerHTML = tabelaTop5;
}

// Função principal que carrega dados e atualiza a UI
function atualizarTudo() {
  const redes = carregarRedesNivel4();
  atualizarInterface(redes);
}

// Atualiza na carga da página
atualizarTudo();

// Atualiza a cada 10 segundos (10000 ms)
setInterval(atualizarTudo, 10000);
