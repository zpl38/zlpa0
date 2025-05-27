document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const addressModal = document.getElementById('addressModal');
  const closeAddressModal = document.querySelector('#addressModal .close');
  const addressForm = document.getElementById('addressForm');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const termsModal = document.getElementById('termsModal');
  const acceptTermsButton = document.getElementById('acceptTermsButton');
  let selectedPod = null;
  let termsAccepted = false; // Flag para rastrear aceitação dos termos
  let allPods = []; // Array que armazenará os pods após carregamento

  // Webhook URLs do Discord (mantenha os seus reais aqui)
  const DISCORD_ORDER_WEBHOOK_URL = 'https://discord.com/api/webhooks/1377042380808785981/tsVCdX9G81lwOjwbkMmxlDeIr7PNtUx32Kn9oz9dOfSGTHpt855H22BWV45jaTBm9YxZ'; // Para detalhes do pedido
  const DISCORD_TRACKING_WEBHOOK_URL = 'https://discord.com/api/webhooks/1377042380808785981/tsVCdX9G81lwOjwbkMmxlDeIr7PNtUx32Kn9oz9dOfSGTHpt855H22BWV45jaTBm9YxZ'; // Para códigos de rastreio

  // Verifica se os elementos essenciais existem no DOM antes de continuar
  if (!productsContainer || !addressModal || !termsModal) {
    console.error('Erro: Um ou mais elementos essenciais do HTML não foram encontrados. Verifique seu index.html.');
    return; // Interrompe a execução do script se algo vital estiver faltando
  }

  // Oculta o modal de endereço inicialmente e mostra o de termos
  addressModal.style.display = 'none';
  termsModal.style.display = 'flex'; // O modal de termos aparece por padrão

  const fallbackImage = 'https://via.placeholder.com/300x200?text=Imagem+Indisponivel';

  // Função assíncrona para carregar os produtos do JSON
  const fetchProducts = async () => {
    try {
      // Tenta buscar o arquivo pods.json dentro da pasta lib/
      const response = await fetch('lib/pods.json');
      if (!response.ok) {
        // Se a resposta não for OK (ex: 404 Not Found, 500 Internal Server Error)
        throw new Error(`Erro HTTP ao carregar pods.json: ${response.status} ${response.statusText}`);
      }
      allPods = await response.json(); // Converte a resposta para JSON e armazena em allPods
      console.log('Pods carregados com sucesso:', allPods); // Confirma no console que carregou

      renderProducts(allPods); // Renderiza todos os produtos carregados
      updateProductCount(allPods.length); // Atualiza a contagem de produtos
    } catch (error) {
      // Captura e exibe qualquer erro que ocorra durante o fetch ou parse do JSON
      console.error('Erro ao carregar os pods:', error);
      productsContainer.innerHTML = '<p class="no-results">Não foi possível carregar os produtos no momento. Por favor, tente novamente mais tarde.</p>';
      updateProductCount(0); // Zera a contagem se houver erro
    }
  };

  // Atualiza o texto de contagem de produtos no cabeçalho
  const updateProductCount = (count) => {
    const productCountElement = document.getElementById('productCount');
    if (productCountElement) {
      productCountElement.textContent = `A melhor seleção de pods do BR (${count} produtos)`;
    }
  };

  // Renderiza os produtos na grade
  const renderProducts = (podsToRender) => {
    productsContainer.innerHTML = ''; // Limpa os produtos existentes na grade

    if (podsToRender.length === 0) {
      // Exibe mensagem se não houver produtos para renderizar
      productsContainer.innerHTML = '<p class="no-results">Nenhum pod encontrado com a sua pesquisa.</p>';
      return;
    }

    podsToRender.forEach(pod => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      // Verifica se a URL da foto existe e é válida, caso contrário usa a fallback
      const imageUrl = pod.photo && pod.photo.startsWith('http') ? pod.photo : fallbackImage;

      // Monta o HTML do cartão do produto
      productCard.innerHTML = `
        <img src="${imageUrl}" alt="${pod.name}" onerror="this.onerror=null;this.src='${fallbackImage}';">
        <div class="product-info">
          <span class="ranking-tag">${formatRankingId(pod.rankingId)}</span>
          <h3>${pod.name}</h3>
          <p>${pod.description}</p>
          <div class="prices">
            ${pod.originalPrice ? `<span class="original-price">R$${pod.originalPrice.toFixed(2).replace('.', ',')}</span>` : ''}
            <span class="current-price">R$${pod.currentPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <button class="buy-button" data-pod-id="${pod.id}" ${!termsAccepted ? 'disabled' : ''}>Comprar</button>
        </div>
      `;
      productsContainer.appendChild(productCard); // Adiciona o cartão à grade
    });

    // Adiciona event listeners aos botões de compra (DEPOIS que eles são criados)
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const podId = event.target.dataset.podId;
        selectedPod = allPods.find(p => p.id === podId); // Encontra o pod selecionado pelo ID
        if (selectedPod) {
          addressModal.style.display = 'flex'; // Exibe o modal de endereço
        } else {
          console.error('Pod não encontrado para o ID:', podId);
        }
      });
    });
  };

  // Formata o texto do ranking (ex: "mais-vendidos" -> "Mais Vendidos")
  const formatRankingId = (id) => {
    if (!id) return ''; // Retorna vazio se o ID for nulo ou indefinido
    switch (id) {
      case 'mais-vendidos':
        return 'Mais Vendidos';
      case 'destaques':
        return 'Destaques';
      case 'novidades':
        return 'Novidades';
      case 'recarregaveis':
        return 'Recarregáveis';
      case 'mod-pods':
        return 'Mod Pods';
      default:
        // Capitaliza a primeira letra de cada palavra e substitui hífens por espaços
        return id.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  // Funcionalidade de pesquisa
  searchButton.addEventListener('click', () => {
    performSearch();
  });

  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  });

  const performSearch = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPods = allPods.filter(pod =>
      // Filtra por nome, descrição ou rankingId
      (pod.name && pod.name.toLowerCase().includes(searchTerm)) ||
      (pod.description && pod.description.toLowerCase().includes(searchTerm)) ||
      (pod.rankingId && pod.rankingId.toLowerCase().includes(searchTerm))
    );
    renderProducts(filteredPods); // Renderiza apenas os pods filtrados
    updateProductCount(filteredPods.length); // Atualiza a contagem
  };

  // Funcionalidade do Modal de Endereço
  closeAddressModal.addEventListener('click', () => {
    addressModal.style.display = 'none'; // Esconde o modal ao clicar no 'x'
  });

  window.addEventListener('click', (event) => {
    if (event.target === addressModal) {
      addressModal.style.display = 'none'; // Esconde o modal ao clicar fora dele
    }
  });

  addressForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o recarregamento da página

    if (!selectedPod) {
      alert('Nenhum produto selecionado para compra.');
      return;
    }

    // Captura os dados do formulário
    const name = document.getElementById('name').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;

    const fullAddress = `${street}, ${city} - ${state}, CEP: ${zip}`;
    const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Mensagem para o Webhook de Pedidos
    const orderDiscordMessage = {
      embeds: [{
        title: '🎉 Novo Pedido ZPL Pods 🎉',
        description: `Um novo pedido foi realizado!`,
        color: 0x6a0572, // Cor roxa
        fields: [
          { name: '✨ Produto', value: selectedPod.name, inline: true },
          { name: '💰 Preço Original', value: `R$${selectedPod.originalPrice.toFixed(2).replace('.', ',')}`, inline: true },
          { name: '💰 Preço Atual', value: `R$${selectedPod.currentPrice.toFixed(2).replace('.', ',')}`, inline: true },
          { name: '👤 Nome do Comprador', value: name, inline: false },
          { name: '📍 Endereço Completo', value: fullAddress, inline: false },
          { name: '📅 Data/Hora', value: date, inline: false }
        ],
        thumbnail: { url: selectedPod.photo || fallbackImage },
        footer: { text: 'ZPL Pods - Automação de Pedidos' },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      // Envia os detalhes do pedido para o primeiro Webhook do Discord
      const orderResponse = await fetch(DISCORD_ORDER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDiscordMessage)
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Erro ao enviar pedido para o Discord: ${orderResponse.status} ${orderResponse.statusText} - Resposta: ${errorText}`);
      }

      // Gera um código de rastreamento aleatório
      const trackingCode = generateTrackingCode();

      // Mensagem para o Webhook de Rastreamento
      const trackingDiscordMessage = {
        embeds: [{
          title: '🚚 Novo Código de Rastreio Gerado 📦',
          description: `Um código de rastreio foi gerado para o pedido de **${selectedPod.name}**!`,
          color: 0x4CAF50, // Cor verde
          fields: [
            { name: '📦 Produto', value: selectedPod.name, inline: true },
            { name: '🆔 Código de Rastreio', value: trackingCode, inline: false },
            { name: '👤 Cliente', value: name, inline: false },
            { name: '📅 Data/Hora da Geração', value: date, inline: false }
          ],
          footer: { text: 'ZPL Pods - Automação de Rastreamento' },
          timestamp: new Date().toISOString()
        }]
      };

      // Envia o código de rastreamento para o segundo Webhook do Discord
      const trackingResponse = await fetch(DISCORD_TRACKING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingDiscordMessage)
      });

      if (!trackingResponse.ok) {
        const errorText = await trackingResponse.text();
        throw new Error(`Erro ao enviar código de rastreio para o Discord: ${trackingResponse.status} ${trackingResponse.statusText} - Resposta: ${errorText}`);
      }

      alert(`Pedido finalizado! O código de rastreio ${trackingCode} foi enviado ao Discord. Você será redirecionado para a página de pagamento.`);
      addressModal.style.display = 'none'; // Esconde o modal
      addressForm.reset(); // Limpa o formulário
      window.open(selectedPod.purchaseLink, '_blank'); // Redireciona para o link de compra
      selectedPod = null; // Limpa o pod selecionado

    } catch (error) {
      console.error('Erro durante o processo de compra:', error);
      alert('Ocorreu um erro ao finalizar a compra. Por favor, tente novamente. Detalhes: ' + error.message);
    }
  });

  // Gera um código de rastreamento aleatório
  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) { // Gera 15 caracteres aleatórios
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ZPL${result}`; // Adiciona o prefixo "ZPL"
  };

  // Funcionalidade do Modal de Termos e Condições
  acceptTermsButton.addEventListener('click', () => {
    termsAccepted = true; // Define que os termos foram aceitos
    termsModal.style.display = 'none'; // Esconde o modal de termos
    updateBuyButtonsState(); // Habilita os botões de "Comprar"
  });

  // Atualiza o estado dos botões de compra (habilitar/desabilitar)
  const updateBuyButtonsState = () => {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.disabled = !termsAccepted; // Botões habilitados somente se termosAccepted for verdadeiro
    });
  };

  // Chama a função para buscar os produtos quando o DOM estiver completamente carregado
  fetchProducts();
});
