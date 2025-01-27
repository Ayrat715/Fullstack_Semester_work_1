import { getDayOfWeekShort, getMonthShortName } from './utils.js';

export class SearchManager {
    constructor(
        searchOverlay,
        searchModal,
        searchInput,
        closeSearchBtn,
        searchResultsContainer,
        onSelectEvent,
        eventsRef
    ) {
        this.searchOverlay = searchOverlay;
        this.searchModal = searchModal;
        this.searchInput = searchInput;
        this.closeSearchBtn = closeSearchBtn;
        this.searchResultsContainer = searchResultsContainer;
        this.onSelectEvent = onSelectEvent; // колбэк для показа деталей
        this.eventsRef = eventsRef;

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.doSearch();
            }
        });
        this.closeSearchBtn.addEventListener('click', () => {
            this.hideSearchOverlay();
        });
    }

    /* Поиск по событиям */
    doSearch() {
        const q = this.searchInput.value.toLowerCase().trim();
        this.searchResultsContainer.innerHTML = '';
        if (!q) {
            this.searchResultsContainer.innerHTML = '<p>Пустой запрос</p>';
            this.showSearchOverlay();
            return;
        }
        const found = this.eventsRef.value.filter(e => e.title.toLowerCase().includes(q));
        if (found.length === 0) {
            this.searchResultsContainer.innerHTML = '<p>Нет совпадений</p>';
        } else {
            let html = '';
            found.forEach(e => {
                const dt = new Date(e.date);
                const dow = getDayOfWeekShort(dt.getDay());
                const dnum = dt.getDate();
                const mon = getMonthShortName(dt.getMonth());
                html += `
          <div class="search-item" data-id="${e.id}">
            <strong>${dow}, ${dnum} ${mon}, ${e.start}-${e.end}</strong><br/>
            ${e.title}
          </div>
        `;
            });
            this.searchResultsContainer.innerHTML = html;

            // Вешаем клик
            const items = this.searchResultsContainer.querySelectorAll('.search-item');
            items.forEach(it => {
                it.addEventListener('click', () => {
                    const eId = Number(it.dataset.id);
                    this.hideSearchOverlay();
                    this.onSelectEvent(eId); // показать детали события
                });
            });
        }
        this.searchInput.value = '';
        this.showSearchOverlay();
    }

    showSearchOverlay() {
        this.searchOverlay.classList.add('show');
        this.searchModal.classList.add('show');
    }

    hideSearchOverlay() {
        this.searchOverlay.classList.remove('show');
        this.searchModal.classList.remove('show');
    }
}