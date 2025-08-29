import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Fetches Pokemon data from PokeAPI
 * @param {string} pokemonName The name or ID of the Pokemon to fetch
 * @returns {Promise<Object|null>} Pokemon data or null if failed
 */
async function fetchPokemonData(pokemonName) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Pokemon data:', error);
    return null;
  }
}

/**
 * Creates the Pokemon card HTML structure
 * @param {Object} pokemonData The Pokemon data from the API
 * @returns {HTMLElement} The Pokemon card element
 */
function createPokemonCard(pokemonData) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';

  // Pokemon name and ID
  const header = document.createElement('div');
  header.className = 'pokemon-header';
  header.innerHTML = `
    <h3 class="pokemon-name">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</h3>
    <span class="pokemon-id">#${pokemonData.id.toString().padStart(3, '0')}</span>
  `;

  // Pokemon image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'pokemon-image-container';
  const image = document.createElement('img');
  image.src = pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default;
  image.alt = `${pokemonData.name} artwork`;
  image.className = 'pokemon-image';
  imageContainer.appendChild(image);

  // Pokemon types
  const typesContainer = document.createElement('div');
  typesContainer.className = 'pokemon-types';
  pokemonData.types.forEach(type => {
    const typeSpan = document.createElement('span');
    typeSpan.className = `pokemon-type pokemon-type-${type.type.name}`;
    typeSpan.textContent = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);
    typesContainer.appendChild(typeSpan);
  });

  // Pokemon stats
  const statsContainer = document.createElement('div');
  statsContainer.className = 'pokemon-stats';
  const statsTitle = document.createElement('h4');
  statsTitle.textContent = 'Base Stats';
  statsContainer.appendChild(statsTitle);

  pokemonData.stats.forEach(stat => {
    const statRow = document.createElement('div');
    statRow.className = 'pokemon-stat-row';
    
    const statName = document.createElement('span');
    statName.className = 'pokemon-stat-name';
    statName.textContent = stat.stat.name.replace('-', ' ').toUpperCase();
    
    const statValue = document.createElement('span');
    statValue.className = 'pokemon-stat-value';
    statValue.textContent = stat.base_stat;
    
    const statBar = document.createElement('div');
    statBar.className = 'pokemon-stat-bar';
    const statFill = document.createElement('div');
    statFill.className = 'pokemon-stat-fill';
    statFill.style.width = `${Math.min(stat.base_stat / 2, 100)}%`;
    statBar.appendChild(statFill);
    
    statRow.appendChild(statName);
    statRow.appendChild(statValue);
    statRow.appendChild(statBar);
    statsContainer.appendChild(statRow);
  });

  // Pokemon abilities
  const abilitiesContainer = document.createElement('div');
  abilitiesContainer.className = 'pokemon-abilities';
  const abilitiesTitle = document.createElement('h4');
  abilitiesTitle.textContent = 'Abilities';
  abilitiesContainer.appendChild(abilitiesTitle);

  const abilitiesList = document.createElement('ul');
  pokemonData.abilities.forEach(ability => {
    const abilityItem = document.createElement('li');
    abilityItem.className = ability.is_hidden ? 'pokemon-ability hidden-ability' : 'pokemon-ability';
    abilityItem.textContent = ability.ability.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (ability.is_hidden) {
      abilityItem.title = 'Hidden Ability';
    }
    abilitiesList.appendChild(abilityItem);
  });
  abilitiesContainer.appendChild(abilitiesList);

  // Pokemon physical info
  const physicalInfo = document.createElement('div');
  physicalInfo.className = 'pokemon-physical-info';
  physicalInfo.innerHTML = `
    <div class="pokemon-info-item">
      <span class="info-label">Height:</span>
      <span class="info-value">${pokemonData.height / 10} m</span>
    </div>
    <div class="pokemon-info-item">
      <span class="info-label">Weight:</span>
      <span class="info-value">${pokemonData.weight / 10} kg</span>
    </div>
    <div class="pokemon-info-item">
      <span class="info-label">Base Experience:</span>
      <span class="info-value">${pokemonData.base_experience}</span>
    </div>
  `;

  // Assemble the card
  card.appendChild(header);
  card.appendChild(imageContainer);
  card.appendChild(typesContainer);
  card.appendChild(physicalInfo);
  card.appendChild(statsContainer);
  card.appendChild(abilitiesContainer);

  return card;
}

/**
 * Creates a loading spinner
 * @returns {HTMLElement} Loading spinner element
 */
function createLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'pokemon-loading';
  spinner.innerHTML = `
    <div class="pokemon-spinner"></div>
    <p>Loading Pokemon data...</p>
  `;
  return spinner;
}

/**
 * Creates an error message
 * @param {string} message The error message to display
 * @returns {HTMLElement} Error message element
 */
function createErrorMessage(message) {
  const error = document.createElement('div');
  error.className = 'pokemon-error';
  error.innerHTML = `
    <p>❌ ${message}</p>
    <p>Please check the Pokemon name and try again.</p>
  `;
  return error;
}

/**
 * Decorates the Pokemon block
 * @param {Element} block The Pokemon block element
 */
export default async function decorate(block) {
  // Get the Pokemon name from the block content
  const pokemonName = block.textContent.trim() || 'pikachu';
  
  // Clear the block and show loading state
  block.textContent = '';
  const loadingSpinner = createLoadingSpinner();
  block.appendChild(loadingSpinner);

  try {
    // Fetch Pokemon data
    const pokemonData = await fetchPokemonData(pokemonName);
    
    // Remove loading spinner
    block.removeChild(loadingSpinner);
    
    if (pokemonData) {
      // Create and add the Pokemon card
      const pokemonCard = createPokemonCard(pokemonData);
      moveInstrumentation(block, pokemonCard);
      block.appendChild(pokemonCard);
    } else {
      // Show error message
      const errorMessage = createErrorMessage(`Could not find Pokemon: ${pokemonName}`);
      block.appendChild(errorMessage);
    }
  } catch (error) {
    // Remove loading spinner and show error
    if (block.contains(loadingSpinner)) {
      block.removeChild(loadingSpinner);
    }
    const errorMessage = createErrorMessage('Failed to load Pokemon data');
    block.appendChild(errorMessage);
    console.error('Pokemon block error:', error);
  }
}
