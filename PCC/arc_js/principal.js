document.addEventListener('DOMContentLoaded', async () => {
    const charactersPerPage = 12;
    let allCharacters = [];
    let filteredCharacters = [];
    let currentPage = 1;

    // Mostrar loader mientras se cargan los personajes
    const loadingElement = document.createElement("div");
    loadingElement.id = "loading";
    loadingElement.textContent = "Cargando personajes...";
    document.body.appendChild(loadingElement);

    await fetchCharacters();
    renderPage(currentPage);

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });

    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    const modal = document.getElementById('modal');

    // Evento para cerrar modal haciendo clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function openModal(character) {
        const modalContent = modal.querySelector('.modal-content');
    
        modalContent.innerHTML = `
            <img src="${character.image}" alt="${character.name}" class="modal-image">
            <h3>${character.name}</h3>
            <p>${character.species} - ${character.status}</p>
            <div id="modalDetails">
                <p><strong>Género:</strong> ${character.gender}</p>
                <p><strong>Ubicación:</strong> 
                    <a href="${character.location.url}" target="_blank">
                        ${character.location.name || "Desconocido"}
                    </a>
                </p>
                <p><strong>Origen:</strong> 
                    <a href="${character.origin.url}" target="_blank">
                        ${character.origin.name || "Desconocido"}
                    </a>
                </p>
            </div>
            <h4>Últimos Episodios:</h4>
            <ul id="modalEpisodes" class="episode-list"></ul>
            <button id="toggleEpisodes" class="toggle-button hidden">+ Mostrar más</button>
        `;
    
        const modalEpisodesList = modal.querySelector('#modalEpisodes');
        const toggleButton = modal.querySelector('#toggleEpisodes');
        modalEpisodesList.innerHTML = '';
    
        const episodePromises = character.episode.map(url => fetch(url).then(res => res.json()));
    
        Promise.all(episodePromises)
            .then(episodes => {
                episodes.forEach((episode, index) => {
                    const episodeItem = document.createElement('li');
                    episodeItem.textContent = `${episode.episode} - ${episode.name}`;
                    if (index >= 5) episodeItem.classList.add('hidden-episode');
                    modalEpisodesList.appendChild(episodeItem);
                });
    
                if (episodes.length > 5) {
                    toggleButton.classList.remove('hidden');
                    toggleButton.addEventListener('click', () => {
                        const hiddenEpisodes = modalEpisodesList.querySelectorAll('.hidden-episode');
                        if (hiddenEpisodes.length > 0) {
                            hiddenEpisodes.forEach(ep => ep.classList.remove('hidden-episode'));
                            toggleButton.textContent = "- Mostrar menos";
                        } else {
                            modalEpisodesList.querySelectorAll('li').forEach((ep, i) => {
                                if (i >= 5) ep.classList.add('hidden-episode');
                            });
                            toggleButton.textContent = "+ Mostrar más";
                        }
                    });
                }
            })
            .catch(error => console.error('Error al cargar episodios:', error));
    
        modal.classList.add('visible');
        document.body.classList.add('modal-open', 'blurred');
    }
    

    function closeModal() {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open', 'blurred');
    }

    function renderPage(page) {
        const container = document.querySelector('.personajes-container');
        const noResultsMessage = document.getElementById("no-results");
        const pageNumbers = document.getElementById('pageNumbers');
        const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
    
        const startIndex = (page - 1) * charactersPerPage;
        const endIndex = startIndex + charactersPerPage;
        const charactersToShow = filteredCharacters.slice(startIndex, endIndex);
    
        container.innerHTML = '';
    
        // Si no hay personajes que coincidan, mostrar el mensaje
        if (filteredCharacters.length === 0) {
            noResultsMessage.classList.remove("hidden"); // Mostrar mensaje
            return;
        } else {
            noResultsMessage.classList.add("hidden"); // Ocultar mensaje si hay resultados
        }
    
        container.innerHTML = charactersToShow
            .map((character, index) => generateCharacterCard(character, startIndex + index))
            .join('');
    
        document.querySelectorAll('.container-card').forEach((card) => {
            let img = card.querySelector('.image');
            img.style.cursor = "pointer"; 
    
            img.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                openModal(filteredCharacters[index]);
            });
        });
    
        pageNumbers.textContent = `Página ${page} de ${totalPages}`;
    }    

    async function fetchCharacters() {
        const loadingElement = document.getElementById("loading");
        loadingElement.classList.remove("hidden"); // Muestra el loader
    
        let characters = [];
        let nextPage = 'https://rickandmortyapi.com/api/character';
    
        try {
            while (nextPage) {
                const response = await fetch(nextPage);
                const data = await response.json();
                characters = [...characters, ...data.results];
                nextPage = data.info.next;
            }
    
            allCharacters = characters;
            filteredCharacters = characters;
        } catch (error) {
            console.error('Error al obtener los personajes:', error);
            loadingElement.textContent = "Error al cargar personajes.";
        } finally {
            loadingElement.classList.add("hidden"); // Oculta el loader correctamente
        }
    }    

    function generateCharacterCard(character, index) {
        const statusClass = character.status.toLowerCase();
        return `
            <div class="container-card" data-index="${index}">
                <img src="${character.image}" alt="${character.name}" class="image">
                <div class="container-text">
                    <h3>${character.name}</h3>
                    <p class="status ${statusClass}">${character.status} - ${character.species}</p>
                    <div class="container-info">
                        <p><span>Género:</span> ${character.gender}</p>
                        <p><span>Ubicación:</span> <a href="${character.location.url}" target="_blank">${character.location.name}</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    function applyFilters() {
        const searchText = document.getElementById('searchInput').value.toLowerCase();
        const selectedStatus = document.getElementById('statusFilter').value.toLowerCase();

        filteredCharacters = allCharacters.filter(character => {
            const matchesSearch = character.name.toLowerCase().includes(searchText) || 
                                  character.species.toLowerCase().includes(searchText);
            const matchesStatus = !selectedStatus || character.status.toLowerCase() === selectedStatus;
            return matchesSearch && matchesStatus;
        });

        currentPage = 1;
        renderPage(currentPage);
    }
});
