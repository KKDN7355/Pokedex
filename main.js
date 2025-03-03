const MAX_POKEMON = 151;

class Pokedex {
    constructor() {
        document.body.style.backgroundColor = "#D22B2B";

        this.pokemonListElement = document.getElementById("pokemon-list");
        this.searchInput = document.getElementById("search-input");
        this.leftArrow = document.getElementById("chevron-left");
        this.rightArrow = document.getElementById("chevron-right");
        this.imageElement = document.getElementById("pokemon-image");
        this.allPokemons = [];
    
        const pokedexTitle = document.getElementById("pokedex-title");
        if (pokedexTitle) {
            pokedexTitle.addEventListener("click", () => location.reload());
        }

        this.searchInput.addEventListener("keyup", () => this.handleSearch());
        if (this.leftArrow) this.leftArrow.addEventListener("click", () => this.navigatePokemon(-1));
        if (this.rightArrow) this.rightArrow.addEventListener("click", () => this.navigatePokemon(1));
    
        this.initialise();
    }

    async initialise() {
        try {
            console.log(`🔄 Starting:    initialise()`);

            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`);
            const data = await response.json();
            this.allPokemons = data.results;

            console.log(`✅ Finished:    initialise()`);

            this.displayPokemons();
            this.loadPokemon(1);
            
        } catch (error) {
            console.error(`❌ Failed:    initialise()`, error);
        }
    }

    async loadPokemon(id) {
        console.log(`🔄 Starting:    loadPokemon(${id})`);

        const pokemon_data = await this.fetchpokemon_data(id);
        if (pokemon_data) {
            this.displayPokemonDetails(pokemon_data.pokemon, pokemon_data.pokemonSpecies);
        }

        console.log(`✅ Finished:    loadPokemon(${id})`);
    }

    async fetchpokemon_data(id) {
        try {
            console.log(`🔄 Starting:    fetchpokemon_data(${id})`);

            const [pokemon, pokemonSpecies] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json()),
            ]);

            console.log(`✅ Finished:    fetchpokemon_data(${id})`);

            return { pokemon, pokemonSpecies };
        } catch (error) {
            console.error(`❌ Failed:    fetchpokemon_data(${id})`, error);
            return null;
        }
    }

    async fetchAbilityDetails(url) {
        try {
            console.log(`🔄 Starting:    fetchAbilityDetails(${url})`);

            const response = await fetch(url);
            const data = await response.json();

            const description_entry = data.effect_entries.find(entry => entry.language.name === "en");

            console.log(`✅ Finished:    fetchAbilityDetails(${url})`);

            return description_entry ? description_entry.effect : "No description available for this ability.";
        } catch (error) {
            console.error(`❌ Failed:    fetchAbilityDetails(${url})`, error);
            return "Error loading ability description.";
        }
    }

    handleSearch() {
        const search_term = this.searchInput.value.trim().toLowerCase();
        let filtered = [];
    
        if (!search_term) {
            filtered = this.allPokemons;
        } else if (!isNaN(search_term)) {
            filtered = this.allPokemons.filter(pokemon => {
                const pokemon_id = pokemon.url.match(/\/(\d+)\/$/)?.[1];
                return pokemon_id && pokemon_id.startsWith(search_term);
            });
        } else {
            filtered = this.allPokemons.filter(pokemon => pokemon.name.toLowerCase().startsWith(search_term));
        }
    
        this.displayPokemons(filtered);
    }
    
    displayPokemons(pokemonList = this.allPokemons) {
        console.log(`🔄 Starting:    displayPokemons() with ${pokemonList.length} Pokémon`);
    
        this.pokemonListElement.innerHTML = "";
    
        if (pokemonList.length === 0) {
            this.pokemonListElement.innerHTML = `<p class="text-gray-900 text-center">No Pokémon found.</p>`;
            return;
        }
    
        pokemonList.forEach((pokemon) => {
            const pokemon_id = pokemon.url.match(/\/(\d+)\/$/)?.[1];
            const list_item = document.createElement("div");
    
            list_item.className = "flex items-center w-full px-4 py-2 bg-gray-200 border border-gray-500 rounded-lg cursor-pointer hover:bg-gray-300";
            list_item.innerHTML = `
                <img src="./assets/pokeball.svg" alt="Pokeball" class="w-2 h-2 flex-shrink-0">
                <span class="flex-shrink-0 font-bold text-right
                text-gray-900
                w-12
                px-2
                text-lg">
                    ${pokemon_id.padStart(3, '0')}
                </span>
                <span class="flex-1 font-bold text-left truncate
                text-gray-900
                ml-2
                text-lg">
                    ${pokemon.name.toUpperCase()}
                </span>
            `;
    
            list_item.addEventListener("click", () => this.loadPokemon(pokemon_id));
            this.pokemonListElement.appendChild(list_item);
        });
    
        console.log(`✅ Finished:    displayPokemons() with ${pokemonList.length} Pokémon`);
    }
    
    displayPokemonDetails(pokemon, pokemonSpecies) {
        console.log(`🔄 Starting:    displayPokemons(${pokemon}, ${pokemonSpecies})`);

        document.getElementById("pokemon-name").textContent = pokemon.name.toUpperCase();
        document.getElementById("pokemon-id").textContent = `#${String(pokemon.id).padStart(3, "0")}`;
        document.getElementById("pokemon-description").textContent = this.getEnglishFlavorText(pokemonSpecies);

        // ✅ Update Image (Normal / Shiny Toggle)
        this.setupPokemonImage(pokemon.id);

        // ✅ Update Navigation Arrows
        this.updateNavigationArrows(pokemon.id);

        // ✅ Update Types
        this.updatePokemonTypes(pokemon.types);

        // ✅ Update Abilities
        this.updatePokemonAbilities(pokemon.abilities);

        // ✅ Update Stats
        this.updatePokemonStats(pokemon.stats);

        console.log(`✅ Finished:    displayPokemons(${pokemon}, ${pokemonSpecies})`);
    }

    setupPokemonImage(pokemon_id) {
        console.log(`🔄 Starting:    setupPokemonImage(${pokemon_id})`);

        const image_normal = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon_id}.png`;
        const image_shiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon_id}.png`;

        this.imageElement.src = image_normal;
        let isShiny = false;

        this.imageElement.onclick = () => {
            console.log(`🔄 Starting:    PokemonImageClicked(${pokemon_id})`);

            isShiny = !isShiny;
            this.imageElement.src = isShiny ? image_shiny : image_normal;

            console.log(`✅ Finished:    PokemonImageClicked(${pokemon_id})`);
        };

        console.log(`✅ Finished:    setupPokemonImage(${pokemon_id})`);
    }

    updateNavigationArrows(pokemon_id) {
        console.log(`🔄 Starting:    updateNavigationArrows(${pokemon_id})`);

        if (!this.leftArrow || !this.rightArrow) return;

        this.leftArrow.classList.toggle("hidden", pokemon_id === 1);
        this.rightArrow.classList.toggle("hidden", pokemon_id === MAX_POKEMON);

        this.leftArrow.onclick = () => this.navigatePokemon(-1);
        this.rightArrow.onclick = () => this.navigatePokemon(1);

        console.log(`✅ Finished:    updateNavigationArrows(${pokemon_id})`);
    }

    navigatePokemon(direction) {
        console.log(`🔄 Starting:    navigatePokemon(${direction})`);

        const current_id = parseInt(document.getElementById("pokemon-id").textContent.replace("#", ""), 10);
        const new_id = current_id + direction;

        if (new_id >= 1 && new_id <= MAX_POKEMON) {
            this.loadPokemon(new_id);
        }

        console.log(`✅ Finished:    navigatePokemon(${direction})`);
    }

    updatePokemonTypes(types) {
        console.log(`🔄 Starting:    updatePokemonTypes(${types})`);

        const types_container = document.getElementById("pokemon-types");
        types_container.innerHTML = "";

        const types_wrapper = document.createElement("div");
        types_wrapper.className = "flex w-full gap-2";

        for (let i = 0; i < 2; i++) {
            const types_badge = document.createElement("span");
            types_badge.className = `font-bold text-center w-1/2
                                   text-white
                                   m-2
                                   p-2
                                   text-sm
            `;

            if (types[i]) {
                types_badge.textContent = types[i].type.name.toUpperCase();
                types_badge.style.backgroundColor = this.getTypeColor(types[i].type.name);

            } else {
                types_badge.classList.add("bg-transparent");
                types_badge.textContent = "";
            }
            types_wrapper.appendChild(types_badge);
        }
        types_container.appendChild(types_wrapper);

        console.log(`✅ Finished:    updatePokemonTypes(${types})`);
    }

    updatePokemonAbilities(abilities) {
        console.log(`🔄 Starting:    updatePokemonAbilities(${abilities})`);

        const abilities_container = document.getElementById("pokemon-abilities");
        abilities_container.innerHTML = "";
    
        abilities.forEach(ability => {
            const li = document.createElement("li");
            li.textContent = ability.ability.name.toUpperCase();
            li.className = "cursor-pointer hover:underline text-blue-500";
    
            // ✅ Fetch ability details when clicked.
            li.addEventListener("click", async () => {
                const ability_data = await this.fetchAbilityDetails(ability.ability.url);
                this.showAbilityPopup(ability.ability.name, ability_data);
            });
    
            abilities_container.appendChild(li);
        });

        console.log(`✅ Finished:    updatePokemonAbilities(${abilities})`);
    }
    
    showAbilityPopup(name, description) {
        console.log(`🔄 Starting:    showAbilityPopup(${name}, ${description})`);

        const left_panel = document.getElementById("left-panel");

        // ✅ Ensure left panel has correct positioning
        left_panel.classList.add("relative"); // Make sure it's a reference for absolute positioning

        // ✅ Create overlay background with Tailwind's backdrop blur.
        const overlay = document.createElement("div");
        overlay.className = "absolute inset-0 bg-opacity-50 flex items-center justify-center backdrop-blur-xs";
        overlay.id = "ability-popup-overlay";
    
        // ✅ Create pop-up box.
        const popup = document.createElement("div");
        popup.className = `absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full
                              p-4
        `;
    
        // ✅ Close button.
        const close_button = document.createElement("button");
        close_button.textContent = "✖";
        close_button.className = `absolute top-2 right-2 cursor-pointer
                                 hover:text-red-500
                                 text-gray-900
                                 text-xl
        `;
        close_button.addEventListener("click", () => this.closePopup());
    
        // ✅ Add content.
        const title = document.createElement("h2");
        title.textContent = name.toUpperCase();
        title.className = `font-bold text-center
                           text-lg
                           m-2
                           p-2
        `;
    
        const desc = document.createElement("p");
        desc.textContent = description;
        desc.className = `text-justify
                          m-2
                          p-2
        `;
    
        // ✅ Append elements.
        popup.append(close_button, title, desc);
        overlay.appendChild(popup);
        left_panel.appendChild(overlay);

        // ✅ Close when clicking outside.
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                this.closePopup();
            }
        });

        console.log(`✅ Finished:    showAbilityPopup(${name}, ${description})`);
    }
    
    closePopup() {
        console.log(`🔄 Starting:    closePopup()`);

        const overlay = document.getElementById("ability-popup-overlay");
        if (overlay) overlay.remove();

        console.log(`✅ Finished:    closePopup()`);
    }
    
    updatePokemonStats(stats) {
        console.log(`🔄 Starting:    updatePokemonStats(${stats})`);

        const stats_container = document.getElementById("pokemon-stats-container");
        stats_container.innerHTML = "";
    
        stats.forEach(stat => {
            const stat_div = document.createElement("div");
            stat_div.className = "flex items-center gap-2 w-1/3";
    
            // Stat Name
            const stat_name = document.createElement("span");
            stat_name.textContent = this.getstat_name(stat.stat.name);
            stat_name.className = "font-bold text-right w-1/5";
    
            // Stat Value
            const stat_value = document.createElement("span");
            stat_value.textContent = stat.base_stat;
            stat_value.className = "font-bold text-left w-1/5";
    
            // Progress Bar Wrapper
            const progressbar_wrapper = document.createElement("div");
            progressbar_wrapper.className = `border border-black flex-grow overflow-hidden rounded
                                            bg-gray-700
                                            h-4
            `;
    
            // Progress Bar (Fill)
            const progressbar = document.createElement("div");
            progressbar.style.width = `${(stat.base_stat / 255) * 100}%`;
            progressbar.className = `h-full ${this.getStatColor(stat.stat.name)}`;
    
            // Append Elements
            progressbar_wrapper.appendChild(progressbar);
            stat_div.append(stat_name, progressbar_wrapper, stat_value);
            stats_container.appendChild(stat_div);
        });

        console.log(`✅ Finished:    updatePokemonStats(${stats})`);
    }

    getEnglishFlavorText(pokemonSpecies) {
        return pokemonSpecies.flavor_text_entries.find(entry => entry.language.name === "en")?.flavor_text.replace(/\f/g, " ") || "No description available.";
    }

    getstat_name(stat_name) {
        const stat_map = {
            "hp": "HP",
            "attack": "Attack",
            "defense": "Defense",
            "special-attack": "Sp. Atk.",
            "special-defense": "Sp. Def.",
            "speed": "Speed"
        };
        return stat_map[stat_name] || stat_name.toUpperCase();
    }

    getStatColor(stat_name) {
        const colors_map = {
            "hp": "bg-green-500",
            "attack": "bg-red-500",
            "defense": "bg-yellow-500",
            "special-attack": "bg-blue-500",
            "special-defense": "bg-purple-500",
            "speed": "bg-pink-500"
        };
        return colors_map[stat_name] || "bg-gray-500";
    }

    getTypeColor(type) {
        const typecolors_map = {
            "normal": "#A8A878",
            "fire": "#F08030",
            "water": "#6890F0",
            "electric": "#F8D030",
            "grass": "#78C850",
            "ice": "#98D8D8",
            "fighting": "#C03028",
            "poison": "#A040A0",
            "ground": "#E0C068",
            "flying": "#A890F0",
            "psychic": "#F85888",
            "bug": "#A8B820",
            "rock": "#B8A038",
            "ghost": "#705898",
            "dragon": "#7038F8",
            "dark": "#705848",
            "steel": "#B8B8D0",
            "fairy": "#EE99AC"
        };
    
        return typecolors_map[type.toLowerCase()] || "#000000";
    }
}

// ✅ Initialise Pokédex.
document.addEventListener("DOMContentLoaded", () => new Pokedex());