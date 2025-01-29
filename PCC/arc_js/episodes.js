document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const episodeId = params.get('episode');

  if (episodeId) {
    await getOneEpisode(episodeId);
  } else {
    await getPage(1);
  }
});

const selectPage = document.getElementById('select');
const selectCharacter = document.getElementById('select_one_episode');
const inputFilter = document.querySelector('.filter');
const container = document.querySelector('.container');

for (let i = 1; i <= 3; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.text = `Página ${i}`;
  option.className = 'page-link';
  selectPage.appendChild(option);
}

for (let i = 1; i <= 52; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.text = `Episodio ${i}`;
  option.className = 'page-link';
  selectCharacter.appendChild(option);
}

selectPage.addEventListener('change', async () => {
  const value = selectPage.value;
  await getPage(value);
});

selectCharacter.addEventListener('change', async () => {
  const value = selectCharacter.value;
  window.history.pushState({}, '', `?episode=${value}`);
  await getOneEpisode(value);
});

inputFilter.addEventListener('input', () => {
  const filterValue = inputFilter.value;
  filterEpisodesByName(filterValue);
});

const getPage = async (id) => {
  container.innerHTML = '<p>Cargando episodios...</p>';
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${id}`);
    if (!response.ok) throw new Error('Error en la respuesta de la API');
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      container.innerHTML = '<p>No se encontraron episodios.</p>';
      return;
    }
    
    container.innerHTML = data.results.map(generateEpisodeCard).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Error al cargar los episodios.</p>';
  }
};

const getOneEpisode = async (id) => {
  container.innerHTML = '<p>Cargando episodio...</p>';
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/episode/${id}`);
    if (!response.ok) throw new Error('Error en la respuesta de la API');
    
    const card = await response.json();
    if (!card.id) {
      container.innerHTML = '<p>Episodio no encontrado.</p>';
      return;
    }
    
    container.innerHTML = generateEpisodeCard(card);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Error al cargar el episodio.</p>';
  }
};

const filterEpisodesByName = async (name) => {
  container.innerHTML = '<p>Filtrando episodios...</p>';
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/episode/?name=${name}`);
    if (!response.ok) throw new Error('Error en la respuesta de la API');
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      container.innerHTML = '<p>No se encontraron episodios con ese nombre.</p>';
      return;
    }
    
    container.innerHTML = data.results.map(generateEpisodeCard).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Error al cargar los episodios.</p>';
  }
};

const generateEpisodeCard = (card) => {
  return `
    <div class="container-card">
      <img src="img/rick-morty-critica.webp" alt="image of port" class="image">
      <div class="container-text">
        <h3>${card.name}</h3>
        <p>${card.episode} - ${card.air_date}</p>
        <div class="container3">
          <div class="container-info">
            <p><span>URL:</span> <a href="?episode=${card.id}">${card.url}</a></p>
            <p><span>CREATED:</span> ${card.created}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
