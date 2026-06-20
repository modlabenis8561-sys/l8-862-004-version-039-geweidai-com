import { MOVIE_SEARCH_INDEX } from './search-data.js';

const form = document.querySelector('[data-search-page-form]');
const input = document.querySelector('[data-search-page-input]');
const results = document.querySelector('[data-search-results]');
const summary = document.querySelector('[data-search-summary]');
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

const escapeHTML = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const createCard = (movie) => `
    <article class="movie-card" data-search="${escapeHTML(movie.searchText)}">
        <a href="./${escapeHTML(movie.href)}" class="poster-link" aria-label="观看${escapeHTML(movie.title)}">
            <img src="${escapeHTML(movie.cover)}" alt="${escapeHTML(movie.title)}封面" loading="lazy">
            <span class="type-badge">${escapeHTML(movie.category)}</span>
            <span class="play-badge">▶</span>
        </a>
        <div class="movie-card-body">
            <h3><a href="./${escapeHTML(movie.href)}">${escapeHTML(movie.title)}</a></h3>
            <p>${escapeHTML(movie.description)}</p>
            <div class="meta-line">
                <span>${escapeHTML(movie.year)}</span>
                <span>${escapeHTML(movie.region)}</span>
                <span>${escapeHTML(movie.type)}</span>
            </div>
            <div class="card-bottom">
                <a href="./category-${escapeHTML(movie.categorySlug)}.html">${escapeHTML(movie.category)}</a>
                <span>${escapeHTML(movie.genre)}</span>
            </div>
        </div>
    </article>
`;

const render = (query) => {
    const normalized = query.trim().toLowerCase();
    const matched = normalized
        ? MOVIE_SEARCH_INDEX.filter((movie) => movie.searchText.toLowerCase().includes(normalized))
        : MOVIE_SEARCH_INDEX.slice(0, 40);

    const limited = matched.slice(0, 120);
    results.innerHTML = limited.map(createCard).join('');

    if (summary) {
        if (normalized) {
            summary.textContent = `搜索“${query}”共找到 ${matched.length} 部影片，当前显示前 ${limited.length} 部。`;
        } else {
            summary.textContent = '未输入关键词，默认展示前 40 部影片。';
        }
    }
};

if (input) {
    input.value = initialQuery;
}

form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input?.value.trim() || '';
    const nextUrl = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
    window.history.replaceState(null, '', nextUrl);
    render(query);
});

input?.addEventListener('input', () => {
    render(input.value);
});

render(initialQuery);
