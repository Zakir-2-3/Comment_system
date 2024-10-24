import Storage from "./Storage.js";
class Filter {
    constructor(filterBtn, filterMenu, filterListContainer, answerMessageContainer, btnSortingFavoritesComments, comment, // Экземпляр класса Comment
    btnSortingComments) {
        this.filterBtn = filterBtn;
        this.filterMenu = filterMenu;
        this.filterListContainer = filterListContainer;
        this.answerMessageContainer = answerMessageContainer;
        this.btnSortingFavoritesComments = btnSortingFavoritesComments;
        this.currentFilterIndex = 0; // По умолчанию фильтр "По дате"
        this.isReverseSorting = false;
        this.isFavoritesFilterActive = false;
        this.comment = comment; // Используем существующий класс Comment
        this.btnSortingComments = btnSortingComments;
        this.saveData = Storage.getData("saveData") || []; // Данные комментариев, которые будут фильтроваться
        this.initializeFilterMenu();
        this.applyFilterSelection();
        this.toggleFavoritesFilter();
        this.initializeSorting();
    }
    // Метод для открытия и закрытия меню фильтров
    initializeFilterMenu() {
        this.filterBtn.addEventListener("click", () => {
            this.filterBtn.classList.toggle("filter-btn--open");
            this.filterBtn.setAttribute("aria-expanded", this.filterBtn.classList.contains("filter-btn--open") ? "true" : "false");
            if (this.filterBtn.classList.contains("filter-btn--open")) {
                this.filterMenu.style.transform = "scaleY(1)";
            }
            else {
                this.filterMenu.style.cssText =
                    "transform: scaleY(0); transform-origin: 0 0;";
            }
        });
        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!this.filterBtn.contains(target) &&
                !this.filterMenu.contains(target) &&
                target.tagName !== "IMG") {
                this.filterBtn.classList.remove("filter-btn--open");
                this.filterBtn.setAttribute("aria-expanded", "false");
                this.filterMenu.style.cssText =
                    "transform: scaleY(0); transform-origin: 0 0;";
            }
        });
    }
    // Выбор фильтра из меню
    applyFilterSelection() {
        const filterItems = this.filterListContainer.querySelectorAll(".filter-comment__container-menu--item");
        filterItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                // Обновление данных из локального хранилища перед фильтрацией
                this.saveData = Storage.getData("saveData");
                const currentActiveItem = this.filterListContainer.querySelector(".filter-active");
                if (currentActiveItem) {
                    currentActiveItem.classList.remove("filter-active");
                    const previousCheckMarkImg = currentActiveItem.querySelector("img");
                    if (previousCheckMarkImg) {
                        previousCheckMarkImg.remove();
                    }
                }
                if (!item.classList.contains("filter-active")) {
                    item.classList.add("filter-active");
                    const checkMarkImg = document.createElement("img");
                    checkMarkImg.src = "./assets/icons/check-mark.svg";
                    checkMarkImg.alt = "check-mark";
                    item.insertBefore(checkMarkImg, item.firstChild);
                }
                this.currentFilterIndex = index;
                const filteredComments = this.filterComments(index);
                this.updateComments(filteredComments);
            });
        });
    }
    // Сортировка выбранного фильтра
    filterComments(index) {
        let filteredComments = [];
        if (index === 0) {
            filteredComments = [...this.saveData].sort((a, b) => this.isReverseSorting
                ? new Date(b.date).getTime() - new Date(a.date).getTime()
                : new Date(a.date).getTime() - new Date(b.date).getTime());
            this.filterBtn.textContent = "По дате";
        }
        else if (index === 1) {
            filteredComments = [...this.saveData].sort((a, b) => this.isReverseSorting ? a.rating - b.rating : b.rating - a.rating);
            this.filterBtn.textContent = "По количеству оценок";
        }
        else if (index === 2) {
            filteredComments = [...this.saveData]; // Возвращаем комментарии в исходный порядок
            this.filterBtn.textContent = "По актуальности";
            this.isReverseSorting = false;
        }
        else if (index === 3) {
            filteredComments = [...this.saveData]
                .filter((item) => item.answers.length > 0)
                .sort((a, b) => this.isReverseSorting
                ? a.answers.length - b.answers.length
                : b.answers.length - a.answers.length);
            this.filterBtn.textContent = "По количеству ответов";
        }
        return filteredComments;
    }
    // Метод для установки фильтра по умолчанию на "По дате"
    resetToDefaultFilter() {
        const currentActiveItem = this.filterListContainer.querySelector(".filter-active");
        if (currentActiveItem) {
            currentActiveItem.classList.remove("filter-active");
            const previousCheckMarkImg = currentActiveItem.querySelector("img");
            if (previousCheckMarkImg) {
                previousCheckMarkImg.remove();
            }
        }
        const defaultFilterItem = this.filterListContainer.querySelector(".filter-comment__container-menu--item:nth-child(1)");
        if (defaultFilterItem) {
            defaultFilterItem.classList.add("filter-active");
            const checkMarkImg = document.createElement("img");
            checkMarkImg.src = "./assets/icons/check-mark.svg";
            checkMarkImg.alt = "check-mark";
            defaultFilterItem.insertBefore(checkMarkImg, defaultFilterItem.firstChild);
            this.currentFilterIndex = 0;
            this.filterBtn.textContent = "По дате";
        }
    }
    // Метод для обновления отображения комментариев
    updateComments(filteredComments) {
        // Очищаем контейнер с комментариями
        this.answerMessageContainer.innerHTML = "";
        // Вставка отфильтрованных комментариев в контейнер
        filteredComments.forEach((commentData, index) => {
            const addCommentHTML = this.comment.generateCommentHTML(commentData, index);
            this.answerMessageContainer.insertAdjacentHTML("beforeend", addCommentHTML);
            // Обновляем иконки избранного для каждого комментария
            const favoritesButtonImg = document.querySelector(`
        .main-comments[data-id="${index}"] .favorites-button-img
      `);
            if (favoritesButtonImg) {
                // Проверяем, существует ли элемент
                if (commentData.favorites) {
                    favoritesButtonImg.src = "./assets/icons/in-favorites.svg";
                }
                else {
                    favoritesButtonImg.src = "./assets/icons/to-favorites.svg";
                }
            }
            else {
                console.warn(`Element not found for index: ${index}`);
            }
            // Вставляем ответы, если они есть
            if (commentData.answers.length > 0) {
                const replyCommentsContainer = document.querySelector(`
          .main-comments[data-id="${index}"] .reply-comments__container
        `);
                if (replyCommentsContainer) {
                    commentData.answers.forEach((answer, answerIndex) => {
                        const addReplyCommentHTML = this.comment.generateCommentReplyHTML(answer, commentData, answerIndex);
                        replyCommentsContainer.insertAdjacentHTML("beforeend", addReplyCommentHTML);
                    });
                }
            }
        });
    }
    // Стрелка(треугольник) сортировки от большего к меньшему
    initializeSorting() {
        // Применяем сортировку и фильтрацию при загрузке страницы
        this.updateComments(this.filterComments(this.currentFilterIndex));
        if (this.btnSortingComments) {
            this.btnSortingComments.addEventListener("click", () => {
                this.saveData = Storage.getData("saveData");
                // Переключаем порядок сортировки только если текущий фильтр не "По актуальности"
                if (this.currentFilterIndex !== 2) {
                    this.isReverseSorting = !this.isReverseSorting;
                    // Меняем стили кнопки сортировки в зависимости от состояния сортировки
                    if (this.isReverseSorting) {
                        this.btnSortingComments.style.transform = "rotate(180deg)";
                        this.btnSortingComments.style.padding = "0px 0px 4px";
                    }
                    else {
                        this.btnSortingComments.style.transform = "rotate(0deg)";
                        this.btnSortingComments.style.padding = "";
                    }
                    // Применяем фильтрацию и обновляем интерфейс
                    this.updateComments(this.filterComments(this.currentFilterIndex));
                }
            });
        }
    }
    // Кнопка фильтрации избранных комментариев
    toggleFavoritesFilter() {
        this.btnSortingFavoritesComments.addEventListener("click", () => {
            // Перезагружаем данные из localStorage
            this.saveData = Storage.getData("saveData");
            // Переключаем состояние фильтрации по избранным
            this.isFavoritesFilterActive = !this.isFavoritesFilterActive;
            const favoritesAllIcon = document.querySelector("#favorites-all-icon");
            let filteredComments; // Создаем переменную для отфильтрованных комментариев
            if (this.isFavoritesFilterActive) {
                // Фильтруем комментарии и учитываем избранные ответы
                filteredComments = this.saveData.filter((comment) => {
                    var _a;
                    // Если сам комментарий избранный, оставляем его
                    if (comment.favorites) {
                        return true;
                    }
                    // Если хотя бы один из ответов на комментарий избранный, оставляем комментарий
                    return (_a = comment.answers) === null || _a === void 0 ? void 0 : _a.some((answer) => answer.favorites);
                });
                favoritesAllIcon.src = "./assets/icons/favorites-all-active.svg";
                // Сбрасываем сортировку до состояния по умолчанию
                if (this.isReverseSorting) {
                    this.isReverseSorting = false; // Сбрасываем обратную сортировку
                    this.currentFilterIndex = 0; // Сброс выбранного фильтра к "По дате"
                    this.btnSortingComments.style.padding = "";
                    this.btnSortingComments.style.transform = "rotate(0deg)";
                }
                // Сбрасываем фильтр на "По дате"
                this.resetToDefaultFilter();
            }
            else {
                filteredComments = [...this.saveData]; // Возвращаем все комментарии
                favoritesAllIcon.src = "./assets/icons/favorites-all.svg";
            }
            this.answerMessageContainer.innerHTML = "";
            if (filteredComments.length === 0 && this.isFavoritesFilterActive) {
                this.answerMessageContainer.innerHTML = `<div class="no-featured-comments"><img src="./assets/icons/no-featured-comments.png" alt="no-featured-comments"/>Нет избранных комментариев</div>`;
            }
            else {
                this.updateComments(filteredComments);
            }
        });
    }
}
export default Filter;
