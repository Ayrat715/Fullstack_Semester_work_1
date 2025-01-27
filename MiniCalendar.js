import { isSameDate, getMonday, getFullMonthName } from './utils.js';

export class MiniCalendar {
    constructor(
        miniCalendarGrid,
        currentMonthElem,
        selectedDateRef,
        onChangeDate
    ) {
        // DOM-элементы
        this.miniCalendarGrid = miniCalendarGrid;
        this.currentMonthElem = currentMonthElem;
        // Храним ссылку на текущую выбранную дату из App
        this.selectedDateRef = selectedDateRef;
        this.onChangeDate = onChangeDate;
    }

    /* Календарь по месяцам */
    renderMiniCalendar(date) {
        this.miniCalendarGrid.innerHTML = '';
        const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
        dayNames.forEach(dn => {
            const hdCell = document.createElement('div');
            hdCell.classList.add('day-header-cell');
            hdCell.textContent = dn;
            this.miniCalendarGrid.appendChild(hdCell);
        });

        const year = date.getFullYear();
        const month = date.getMonth();
        this.currentMonthElem.textContent = `${getFullMonthName(month)} ${year}`;

        // Задаем 42 ячейки (6 строк и 7 столбцов)
        const firstDayOfMonth = new Date(year, month, 1);
        let wd = firstDayOfMonth.getDay();
        if (wd === 0) wd = 7;
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - (wd - 1));

        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);

            const cell = document.createElement('div');
            cell.classList.add('calendar-cell');
            cell.textContent = cellDate.getDate();

            if (cellDate.getMonth() !== month) {
                cell.classList.add('other-month');
            }
            if (isSameDate(cellDate, new Date())) {
                cell.classList.add('today-day');
            }
            // Проверяем, совпадает ли с текущей выбранной датой
            if (isSameDate(cellDate, this.selectedDateRef.value)) {
                cell.classList.add('selected-day');
            }

            cell.addEventListener('click', () => {
                // При клике обновляем selectedDate
                this.selectedDateRef.value = cellDate;
                // Перерисовываем сам мини-календарь, чтобы подсветить новую дату
                this.renderMiniCalendar(date);
                // Вызываем колбэк, чтобы «большой» календарь тоже обновился
                this.onChangeDate(cellDate);
            });

            this.miniCalendarGrid.appendChild(cell);
        }
    }
}