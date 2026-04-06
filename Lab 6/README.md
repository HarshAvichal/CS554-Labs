# PokeAPI Explorer

A React single page application for exploring Pokemon data using the PokeAPI.

## Setup

```
npm install
npm run dev
```

## Features

- Browse Pokemon, Abilities, and Types with paginated lists
- View detailed information for each Pokemon, ability, and type
- All related resources (types, abilities, Pokemon) are cross-linked
- 404 handling for invalid routes, IDs, and page numbers

## Extra Credit: Search/Filtering

All three list pages (Pokemon, Abilities, Types) include a search bar that filters by name. When you start typing, the app fetches the full list from the API and searches across all entries, not just the current page. Results are shown as clickable links. When the search box is cleared, the normal paginated view returns. The search is case-insensitive and capped at 20 results for Pokemon/Abilities to keep the page manageable.
