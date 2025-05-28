document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const productsContainer = document.getElementById('products');
  const addressModal = document.getElementById('addressModal');
  const closeAddressModal = document.querySelector('#addressModal .close');
  const addressForm = document.getElementById('addressForm');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const termsModal = document.getElementById('termsModal');
  const acceptTermsButton = document.getElementById('acceptTermsButton');
  const productCountElement = document.getElementById('productCount');

  // --- State Variables ---
  let selectedPod = null;
  let termsAccepted = false; // Flag para rastrear aceitação dos termos
  let allPods = []; // Array que armazenará os pods após carregamento

  // --- Webhook URLs do Discord ---
  // ATENÇÃO: Os dois webhooks estão com a mesma URL. Se você deseja enviar
  // pedidos e rastreamentos para canais diferentes, substitua os URLs abaixo
  // pelos seus webhooks reais e distintos.
  const DISCORD_ORDER_WEBHOOK_URL = 'https://discord.com/api/webhooks/1377427951204962345/vA5CdtbV8Dg0MDyLLCeLw2BnwkfxYU5nEusi7rKbsR0shB2hmSRdKTZnxqlR-v6fuacQ'; // Para detalhes do pedido
  const DISCORD_TRACKING_WEBHOOK_URL = 'https://discord.com/api/webhooks/1377427951204962345/vA5CdtbV8Dg0MDyLLCeLw2BnwkfxYU5nEusi7rKbsR0shB2hmSRdKTZnxqlR-v6fuacQ'; // Para códigos de rastreio

  const FALLBACK_IMAGE = 'https://via.placeholder.com/300x200?text=Imagem+Indisponivel';

  // --- Initial Checks & Setup ---
  if (!productsContainer || !addressModal || !closeAddressModal || !addressForm ||
      !searchInput || !searchButton || !termsModal || !acceptTermsButton || !productCountElement) {
    console.error('Erro: Um ou mais elementos essenciais do HTML não foram encontrados. Verifique seu index.html.');
    return; // Interrompe a execução do script se algo vital estiver faltando
  }

  addressModal.style.display = 'none'; // Oculta o modal de endereço inicialmente
  termsModal.style.display = 'flex'; // O modal de termos aparece por padrão

  // --- Functions ---

  /**
   * Fetches product data from `lib/pods.json`.
   */
  const fetchProducts = async () => {
    try {
      const response = await fetch('lib/pods.json');
      if (!response.ok) {
        throw new Error(`Erro HTTP ao carregar pods.json: ${response.status} ${response.statusText}`);
      }
      allPods = await response.json();
      console.log('Pods carregados com sucesso:', allPods);
      renderProducts(allPods);
      updateProductCount(allPods.length);
      updateBuyButtonsState(); // Ensure initial state of buttons is correct
    } catch (error) {
      console.error('Erro ao carregar os pods:', error);
      productsContainer.innerHTML = '<p class="no-results">Não foi possível carregar os produtos no momento. Por favor, tente novamente mais tarde.</p>';
      updateProductCount(0);
    }
  };

  /**
   * Updates the product count display.
   * @param {number} count - The number of products.
   */
  const updateProductCount = (count) => {
    productCountElement.textContent = `A melhor seleção de pods do BR (${count} produtos)`;
  };

  /**
   * Renders product cards to the DOM.
   * @param {Array<Object>} podsToRender - Array of pod objects to display.
   */
  const renderProducts = (podsToRender) => {
    productsContainer.innerHTML = ''; // Clear existing products

    if (podsToRender.length === 0) {
      productsContainer.innerHTML = '<p class="no-results">Nenhum pod encontrado com a sua pesquisa.</p>';
      return;
    }

    podsToRender.forEach(pod => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      const imageUrl = pod.photo && pod.photo.startsWith('http') ? pod.photo : FALLBACK_IMAGE;

      productCard.innerHTML = `
        <img src="${imageUrl}" alt="${pod.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
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
      productsContainer.appendChild(productCard);
    });
  };

  /**
   * Formats a ranking ID string for display.
   * @param {string} id - The ranking ID (e.g., "mais-vendidos").
   * @returns {string} Formatted string (e.g., "Mais Vendidos").
   */
  const formatRankingId = (id) => {
    if (!id) return '';
    switch (id) {
      case 'mais-vendidos': return 'Mais Vendidos';
      case 'destaques': return 'Destaques';
      case 'novidades': return 'Novidades';
      case 'recarregaveis': return 'Recarregáveis';
      case 'mod-pods': return 'Mod Pods';
      default:
        return id.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  /**
   * Performs a search on the loaded products based on the search input.
   */
  const performSearch = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPods = allPods.filter(pod =>
      (pod.name && pod.name.toLowerCase().includes(searchTerm)) ||
      (pod.description && pod.description.toLowerCase().includes(searchTerm)) ||
      (pod.rankingId && pod.rankingId.toLowerCase().includes(searchTerm))
    );
    renderProducts(filteredPods);
    updateProductCount(filteredPods.length);
  };

  /**
   * Generates a random tracking code.
   * @returns {string} The generated tracking code.
   */
  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ZPL${result}`;
  };

  /**
   * Updates the disabled state of all "Comprar" buttons.
   */
  const updateBuyButtonsState = () => {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.disabled = !termsAccepted;
    });
  };

  // --- Event Listeners ---

  // Event Delegation for 'Comprar' buttons
  productsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy-button') && termsAccepted) {
      const podId = event.target.dataset.podId;
      selectedPod = allPods.find(p => p.id === podId);
      if (selectedPod) {
        addressModal.style.display = 'flex';
      } else {
        console.error('Pod não encontrado para o ID:', podId);
        alert('Erro: Produto não encontrado. Por favor, tente novamente.');
      }
    }
  });

  // Search functionality
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  });

  // Address Modal functionality
  closeAddressModal.addEventListener('click', () => {
    addressModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === addressModal) {
      addressModal.style.display = 'none';
    }
  });

  addressForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!selectedPod) {
      alert('Nenhum produto selecionado para compra. Por favor, selecione um pod antes de prosseguir.');
      return;
    }

    const name = document.getElementById('name').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;

    const fullAddress = `${street}, ${city} - ${state}, CEP: ${zip}`;
    const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const orderDiscordMessage = {
      embeds: [{
        title: '🎉 Novo Pedido ZPL Pods 🎉',
        description: `Um novo pedido foi realizado!`,
        color: 0x6a0572,
        fields: [
          { name: '✨ Produto', value: selectedPod.name, inline: true },
          { name: '💰 Preço Original', value: `R$${selectedPod.originalPrice?.toFixed(2).replace('.', ',') || 'N/A'}`, inline: true },
          { name: '💰 Preço Atual', value: `R$${selectedPod.currentPrice.toFixed(2).replace('.', ',')}`, inline: true },
          { name: '👤 Nome do Comprador', value: name, inline: false },
          { name: '📍 Endereço Completo', value: fullAddress, inline: false },
          { name: '📅 Data/Hora', value: date, inline: false }
        ],
        thumbnail: { url: selectedPod.photo || FALLBACK_IMAGE },
        footer: { text: 'ZPL Pods - Automação de Pedidos' },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const orderResponse = await fetch(DISCORD_ORDER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDiscordMessage)
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Erro ao enviar pedido para o Discord: ${orderResponse.status} ${orderResponse.statusText} - Resposta: ${errorText}`);
      }

      const trackingCode = generateTrackingCode();

      const trackingDiscordMessage = {
        embeds: [{
          title: '🚚 Novo Código de Rastreio Gerado 📦',
          description: `Um código de rastreio foi gerado para o pedido de **${selectedPod.name}**!`,
          color: 0x4CAF50,
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

      const trackingResponse = await fetch(DISCORD_TRACKING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingDiscordMessage)
      });

      if (!trackingResponse.ok) {
        const errorText = await trackingResponse.text();
        throw new Error(`Erro ao enviar código de rastreio para o Discord: ${trackingResponse.status} ${trackingResponse.statusText} - Resposta: ${errorText}`);
      }

      alert(`Pedido finalizado! O código de rastreio **${trackingCode}** foi gerado. Você será redirecionado para a página de pagamento.`);
      addressModal.style.display = 'none';
      addressForm.reset();
      window.location.href = selectedPod.purchaseLink;
      selectedPod = null;

    } catch (error) {
      console.error('Erro durante o processo de compra:', error);
      alert('Ocorreu um erro ao finalizar a compra. Por favor, tente novamente. Detalhes: ' + error.message);
    }
  });

  // Terms and Conditions Modal functionality
  acceptTermsButton.addEventListener('click', () => {
    termsAccepted = true;
    termsModal.style.display = 'none';
    updateBuyButtonsState(); // Enable the 'Comprar' buttons
  });

  // --- Initial Load ---
  fetchProducts();
});
