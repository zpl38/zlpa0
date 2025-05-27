document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const modal = document.getElementById('addressModal');
  const closeModal = document.querySelector('.close');
  const addressForm = document.getElementById('addressForm');
  const searchInput = document.getElementById('searchInput'); // New: Search input
  const searchButton = document.getElementById('searchButton'); // New: Search button
  let selectedPod = null;

  // Check for critical DOM elements
  if (!productsContainer) {
    console.error('Erro: Elemento #products não encontrado no DOM. Verifique se o elemento com id="products" está presente no HTML.');
    return;
  }
  if (!modal) {
    console.error('Erro: Elemento #addressModal não encontrado no DOM. Verifique se o elemento com id="addressModal" está presente no HTML.');
    return;
  }
  if (!closeModal) {
    console.error('Erro: Elemento .close não encontrado. Verifique se a classe "close" está definida no HTML.');
  }
  if (!addressForm) {
    console.error('Erro: Elemento #addressForm não encontrado. Verifique se o elemento com id="addressForm" está presente no HTML.');
  }
  if (!searchInput) {
    console.error('Erro: Elemento #searchInput não encontrado. Verifique se o elemento com id="searchInput" está presente no HTML.');
  }
  if (!searchButton) {
    console.error('Erro: Elemento #searchButton não encontrado. Verifique se o elemento com id="searchButton" está presente no HTML.');
  }

  // --- IMPORTANT FIX: Ensure modal is hidden on load ---
  if (modal) {
    modal.style.display = 'none'; // Explicitly hide the modal on page load
  }
  // --- END IMPORTANT FIX ---

  // Fallback image URL
  const fallbackImage = 'https://via.placeholder.com/300x200?text=Imagem+Indisponivel';

  // Dados dos pods incorporados diretamente
  const allPods = [ // Changed 'data.pods' to 'allPods' to store original list
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/61793d4f71e57473a93a378e72c4df88/produtos/669131f18f945/replay-36-berries-watermelon-ice-double-apple-ice-watermelon-cherry-ice-66964c8e2257a.jpg",
      nome: "Chilly Beats Replay 36000 Puffs",
      preco: 149.90,
      precoDe: 169.90,
      descricao: "Pod descartável com até 36.000 puffs, bateria recarregável via USB-C, fluxo de ar ajustável e sabores intensos. Ideal para longa duração."
    },
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/61793d4f71e57473a93a378e72c4df88/produtos/673253444f235/pod-descartavel-te-30000-elfbar-acai-banana-ice-67325e1406cee.jpg",
      nome: "Elf Bar TE30000 30000 Puffs",
      preco: 134.90,
      precoDe: 159.90,
      descricao: "Pod descartável com 30.000 puffs, 20mg de nicotina, design ergonômico e sabores vibrantes. Perfeito para uso prolongado."
    },
    {
      foto: "https://www.expresstabacaria.com.br/timthumb.php?src=image/catalog/pod/poddescartavel/blacksheep/20k/blueberrybluerazzlem.jpg&w=800=&h=800&zc=1",
      nome: "Black Sheep Dual Tank 20000 Puffs",
      preco: 99.90,
      precoDe: 119.90,
      descricao: "Pod descartável com tanque duplo, até 20.000 puffs, 50mg de nicotina e tecnologia de dosagem manual. Ótimo para alternar sabores."
    },
    {
      foto: "https://www.vaporgringo.com/wp-content/uploads/2025/02/Pod-Descartavel-ignite-–-P100-Pro-–-10.000-Puffs-Bateria.png",
      nome: "Ignite P100 Pro 10000 Puffs",
      preco: 69.90,
      precoDe: 89.90,
      descricao: "Pod descartável com 10.000 puffs, 20mg de nicotina, bateria de 650mAh e sabores ricos. Compacto e eficiente."
    },
    {
      foto: "https://clubedovapor.net/11735-large_default/life-pod-sk.jpg",
      nome: "Life Pod SK 10000 Puffs",
      preco: 64.90,
      precoDe: 79.90,
      descricao: "Pod descartável com 10.000 puffs, 35mg de nicotina, design leve e sabores suaves. Ideal para uso diário."
    },
    {
      foto: "https://brliquids.com/wp-content/uploads/2024/04/pod_system_xros_2_by_vaporesso_3997_1_4fb4744d9a719e397185f0b76625ac21_20230424092707.jpg",
      nome: "Lost Vape Lyra",
      preco: 79.90,
      precoDe: 99.90,
      descricao: "Pod recarregável com bateria de 1000mAh, 2ml de capacidade, bobinas Ultra Boost para sabor intenso. Perfeito para MTL."
    },
    {
      foto: "https://www.wolfshopbrasil.com/wp-content/uploads/2023/07/vaporesso_renova_zero_care_pod_system_69_1_24a45d335860ae3e341092fdde4bcd2c.jpeg",
      nome: "Vaporesso Renova Zero",
      preco: 74.90,
      precoDe: 89.90,
      descricao: "Pod recarregável com 650mAh, 2ml de capacidade, bobina CCELL de 1.0ohm para sabor consistente. Compacto e fácil de usar."
    },
    {
      foto: "https://www.wolfshopbrasil.com/wp-content/uploads/2023/07/vaporesso_xros_16w_pod_system_97_1_3769c67b1f340191a27e717bc132f160.jpg",
      nome: "Vaporesso Xros",
      preco: 89.90,
      precoDe: 109.90,
      descricao: "Pod recarregável com 1000mAh, 2ml de capacidade, fluxo de ar ajustável e bobinas de 0.8ohm/1.2ohm. Ideal para MTL e RDTL."
    },
    {
      foto: "https://clubedovapor.net/4499-thickbox_default/swag-px80-vaporesso-vaporizador.jpg",
      nome: "Vaporesso Swag PX80",
      preco: 119.90,
      precoDe: 139.90,
      descricao: "Pod mod recarregável com 4ml de capacidade, 80W de potência, bobinas GTX para vapor denso. Design elegante com tela IML."
    },
    {
      foto: "https://clubedovapor.net/5258-large_default/caliburn-a2-uwell-pod-system.jpg",
      nome: "Uwell Caliburn A2",
      preco: 84.90,
      precoDe: 99.90,
      descricao: "Pod recarregável com 520mAh, 2ml de capacidade, bobina UN2 Meshed-H de 0.9ohm para sabor rico. Leve e portátil."
    },
    {
      foto: "https://clubedovapor.net/4376-thickbox_default/luxe-q-vaporesso-pod-system.jpg",
      nome: "Vaporesso Luxe Q",
      preco: 94.90,
      precoDe: 109.90,
      descricao: "Pod recarregável com 1000mAh, 2ml de capacidade, bobinas de 0.8ohm/1.2ohm para MTL vaping. Design sofisticado."
    },
    {
      foto: "https://clubedovapor.net/5452-thickbox_default/gtx-go-40-vaporesso-pod-kit-vape.jpg",
      nome: "Vaporesso GTX GO 40",
      preco: 79.90,
      precoDe: 94.90,
      descricao: "Pod recarregável estilo caneta com 1500mAh, 3.5ml de capacidade, bobina GTX para sabor e vapor consistentes."
    },
    {
      foto: "https://www.wolfshopbrasil.com/wp-content/uploads/2023/07/uwell_caliburn_koko_prime_pod_system_15w_37_1_484e504e234ea38e9460bb97aa5d4434.jpg",
      nome: "Uwell Caliburn Koko Prime",
      preco: 99.90,
      precoDe: 114.90,
      descricao: "Pod recarregável com 690mAh, 2ml de capacidade, fluxo de ar ajustável e bobinas G para MTL/RDTL. Design compacto e estiloso."
    },
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/f03e7599453a4ef36840431d42332bec/produtos/65c653f508a59/6931938a59d4cbfb1b7a316e9e117bdf-65c653f77791f.jpg",
      nome: "Ignite V80 8000 Puffs",
      preco: 99.90,
      precoDe: 119.90,
      descricao: "Pod descartável com 8000 puffs, 50mg de nicotina, sabor Banana Cherry e bateria recarregável. Ideal para uso prolongado."
    },
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/f03e7599453a4ef36840431d42332bec/produtos/669145df33768/pod-ignite-v150-berry-blast-66991ab3da642.jpg",
      nome: "Ignite V150 15000 Puffs",
      preco: 129.90,
      precoDe: 149.90,
      descricao: "Pod descartável com 15000 puffs, 50mg de nicotina, sabor Berry Blast e design compacto. Perfeito para vapers exigentes."
    },
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/f03e7599453a4ef36840431d42332bec/produtos/6633f11585c9b/ad142bca7461dd56fcfc738fda1b05ef-6633f117d5ba6.jpg",
      nome: "Zomo Insta Bar 15000 Puffs",
      preco: 129.90,
      precoDe: 149.90,
      descricao: "Pod descartável com 15000 puffs, 20mg de nicotina, sabor Watermelon Ice e bateria recarregável. Ótimo para uso diário."
    },
    {
      foto: "https://cdn.sistemawbuy.com.br/arquivos/f03e7599453a4ef36840431d42332bec/produtos/6740a7f4e47eb/pod-lost-mary-mixer-30k-grapefruit-lemon-lime-674332017e37c.jpg",
      nome: "Lost Mary Mixer 30000 Puffs",
      preco: 139.90,
      precoDe: 169.90,
      descricao: "Pod descartável com 30000 puffs, 50mg de nicotina, sabor Aloe Grape Sour Apple e bateria recarregável. Perfeito para longa duração."
    }
  ];

  // Function to render products
  const renderProducts = (productsToRender) => {
    productsContainer.innerHTML = ''; // Clear current products
    if (productsToRender.length === 0) {
      productsContainer.innerHTML = '<p class="no-results">Nenhum produto encontrado. Tente outra pesquisa.</p>';
      return;
    }

    productsToRender.forEach((pod, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const escapedPod = JSON.stringify(pod).replace(/'/g, "&apos;");
      card.innerHTML = `
        <img src="${pod.foto || fallbackImage}" alt="${pod.nome}" onerror="this.src='${fallbackImage}'">
        <div class="product-info">
          <h3>${pod.nome}</h3>
          <p>${pod.descricao}</p>
          ${pod.precoDe ? `<p class="price-old">De: R$${pod.precoDe.toFixed(2).replace('.', ',')}</p>` : ''}
          <p class="price">Por: R$${pod.preco.toFixed(2).replace('.', ',')}</p>
          <button class="buy-button" data-pod='${escapedPod}' data-index='${index}'>Comprar</button>
        </div>
      `;
      productsContainer.appendChild(card);
    });

    // Re-attach event listeners for buy buttons after rendering
    attachBuyButtonListeners();
  };

  // Initial render of all products
  renderProducts(allPods);

  // Get the product count
  const productCount = allPods.length;
  // Update the header with the product count
  const productCountElement = document.getElementById('productCount');
  if (productCountElement) {
    productCountElement.textContent = `A melhor seleção de pods do BRASIL! ${productCount} produtos disponíveis!`;
  }

  // Function to attach event listeners to buy buttons
  function attachBuyButtonListeners() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', (e) => {
        try {
          selectedPod = JSON.parse(e.target.dataset.pod.replace(/&apos;/g, "'"));
          if (!selectedPod) {
            throw new Error('Dados do pod não encontrados no botão.');
          }
          if (modal) {
            modal.classList.add('show-modal');
          } else {
            console.error('Erro: Modal não encontrado ao tentar abrir.');
          }
        } catch (error) {
          console.error('Erro ao processar clique no botão Comprar:', error);
        }
      });
    });
  }

  // Search functionality
  const performSearch = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPods = allPods.filter(pod =>
      pod.nome.toLowerCase().includes(searchTerm) ||
      pod.descricao.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredPods);
  };

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      } else {
        // Live search as user types (optional, remove if you only want search on button click/Enter)
        performSearch();
      }
    });
  }

  // Fechar modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('show-modal');
      } else {
        console.error('Erro: Modal não encontrado ao tentar fechar.');
      }
    });
  }

  // Fechar modal ao clicar fora do conteúdo
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show-modal');
      }
    });
  }

  // Enviar formulário
  if (addressForm) {
    addressForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value?.trim();
      const street = document.getElementById('street')?.value?.trim();
      const city = document.getElementById('city')?.value?.trim();
      const state = document.getElementById('state')?.value?.trim();
      const zip = document.getElementById('zip')?.value?.trim();

      // Validação básica do formulário
      if (!name || !street || !city || !state || !zip) {
        alert('Por favor, preencha todos os campos do formulário.');
        return;
      }

      const address = `${name}, ${street}, ${city}, ${state}, ${zip}`;

      // Mensagem para WhatsApp
      try {
        const message = `Olá! Quero comprar o ${selectedPod?.nome || 'Produto não selecionado'} por R$${selectedPod?.preco?.toFixed(2).replace('.', ',') || 'Preço indisponível'}. Endereço: ${address}`;
        const whatsappUrl = `https://wa.me/+5516996963425?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Erro ao abrir WhatsApp:', error);
        alert('Erro ao abrir o WhatsApp. Tente novamente.');
      }

      // Mensagem para Discord webhook
      const webhookUrl = 'https://discord.com/api/webhooks/1376697832525791252/g-FPaGaRxwSf_g9_ivDotQYMNPLf_mZwSqagZ4wz5HJa6qfQWIznvP2Sg3IA20ZmJ_ti';
      const date = new Date().toLocaleString('pt-BR');
      const discordMessage = {
        embeds: [{
          title: 'Nova Compra no ZPL Pods!',
          color: 0x800080,
          fields: [
            { name: 'Produto', value: selectedPod?.nome || 'Produto não selecionado', inline: true },
            { name: 'Preço', value: selectedPod ? `R$${selectedPod.preco.toFixed(2).replace('.', ',')}` : 'Preço indisponível', inline: true },
            { name: 'Endereço', value: address, inline: false },
            { name: 'Data', value: date, inline: false }
          ],
          footer: { text: 'ZPL Pods - Sua loja de vapes!' },
          timestamp: new Date().toISOString()
        }]
      };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage)
        });
        if (!response.ok) {
          throw new Error(`Erro na requisição ao Discord: ${response.status} ${response.statusText}`);
        }
        if (modal) {
          modal.classList.remove('show-modal');
        }
        addressForm.reset();
      } catch (error) {
        console.error('Erro ao enviar para o Discord:', error);
        alert('Erro ao enviar os dados para o Discord. A compra foi registrada no WhatsApp.');
      }
    });
  }
});
