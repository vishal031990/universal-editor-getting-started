import { moveInstrumentation } from "../../scripts/scripts.js";

// Import Preact from CDN
const preactScript = document.createElement("script");
preactScript.src = "https://unpkg.com/preact@10.15.1/dist/preact.umd.js";
document.head.appendChild(preactScript);

// Import hooks
const preactHooksScript = document.createElement("script");
preactHooksScript.src =
  "https://unpkg.com/preact@10.15.1/hooks/dist/hooks.umd.js";
document.head.appendChild(preactHooksScript);

// Import htm for JSX-like syntax
const htmScript = document.createElement("script");
htmScript.src = "https://unpkg.com/htm@3.1.1/dist/htm.umd.js";
document.head.appendChild(htmScript);

// Initialize a promise to track when Preact is loaded
const preactLoaded = new Promise((resolve) => {
  if (window.preact && window.preactHooks && window.htm) {
    resolve();
  } else {
    let loaded = 0;
    const checkLoaded = () => {
      loaded += 1;
      if (loaded === 3) {
        resolve();
      }
    };
    preactScript.onload = checkLoaded;
    preactHooksScript.onload = checkLoaded;
    htmScript.onload = checkLoaded;
  }
});

/**
 * Fetches Pokemon data from PokeAPI
 * @param {string} pokemonName The name or ID of the Pokemon to fetch
 * @returns {Promise<Object|null>} Pokemon data or null if failed
 */
async function fetchPokemonData(pokemonName) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    return null;
  }
}

/**
 * Main Pokemon Block component using Preact
 */
function PokemonBlock({ pokemonName = "pikachu" }) {
  const { h } = window.preact;
  const { useState, useEffect } = window.preactHooks;
  const html = window.htm.bind(h);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pokemonData, setPokemonData] = useState(null);

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const data = await fetchPokemonData(pokemonName);
        if (data) {
          setPokemonData(data);
        } else {
          setError(`Could not find Pokemon: ${pokemonName}`);
        }
      } catch (e) {
        setError("Failed to load Pokemon data");
        console.error("Pokemon block error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [pokemonName]);

  if (loading) {
    return html`<${LoadingSpinner} />`;
  }

  if (error) {
    return html`<${ErrorMessage} message=${error} />`;
  }

  return html`<${PokemonCard} pokemonData=${pokemonData} />`;
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  return html`
    <div class="pokemon-loading">
      <div class="pokemon-spinner"></div>
      <p>Loading Pokemon data...</p>
    </div>
  `;
}

/**
 * Error message component
 */
function ErrorMessage({ message }) {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  return html`
    <div class="pokemon-error">
      <p>❌ ${message}</p>
      <p>Please check the Pokemon name and try again.</p>
    </div>
  `;
}

/**
 * Pokemon Card component - Compact version with minimal information
 */
function PokemonCard({ pokemonData }) {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  return html`
    <div class="pokemon-card pokemon-card-compact">
      <${PokemonHeader} name=${pokemonData.name} id=${pokemonData.id} />
      <${PokemonImage} sprites=${pokemonData.sprites} name=${pokemonData.name} />
      <${PokemonTypes} types=${pokemonData.types} />
    </div>
  `;
}

/**
 * Pokemon Header component
 */
function PokemonHeader({ name, id }) {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const formattedId = id.toString().padStart(3, "0");

  return html`
    <div class="pokemon-header">
      <h3 class="pokemon-name">${capitalizedName}</h3>
      <span class="pokemon-id">#${formattedId}</span>
    </div>
  `;
}

/**
 * Pokemon Image component
 */
function PokemonImage({ sprites, name }) {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  const imageUrl =
    sprites.other["official-artwork"].front_default || sprites.front_default;

  return html`
    <div class="pokemon-image-container">
      <img src=${imageUrl} alt="${name} artwork" class="pokemon-image" />
    </div>
  `;
}

/**
 * Pokemon Types component
 */
function PokemonTypes({ types }) {
  const { h } = window.preact;
  const html = window.htm.bind(h);

  return html`
    <div class="pokemon-types">
      ${types.map((type) => {
        const typeName = type.type.name;
        const capitalizedType =
          typeName.charAt(0).toUpperCase() + typeName.slice(1);
        return html`
          <span class="pokemon-type pokemon-type-${typeName}">
            ${capitalizedType}
          </span>
        `;
      })}
    </div>
  `;
}


/**
 * Decorates the Pokemon block
 * @param {Element} block The Pokemon block element
 */
export default async function decorate(block) {
  // Get the Pokemon name from the block content
  const pokemonName = block.textContent.trim() || "pikachu";

  // Clear the block
  block.textContent = "";

  try {
    // Make sure Preact is loaded
    await preactLoaded;

    // Setup Preact
    const { h, render } = window.preact;
    const html = window.htm.bind(h);

    // Create a container for our Preact app
    const appContainer = document.createElement("div");
    moveInstrumentation(block, appContainer);
    block.appendChild(appContainer);

    // Render the Preact component
    render(html`<${PokemonBlock} pokemonName=${pokemonName} />`, appContainer);
  } catch (error) {
    console.error("Failed to render Pokemon block with Preact:", error);

    // Fallback to show an error if Preact fails to load
    const errorElement = document.createElement("div");
    errorElement.className = "pokemon-error";
    errorElement.innerHTML = `
      <p>❌ Failed to load Pokemon block</p>
      <p>Error: ${error.message}</p>
    `;
    block.appendChild(errorElement);
  }
}
