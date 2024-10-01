import Storage from "./Storage.js";
class Comment {
    constructor(container) {
        this.container = container;
        this.saveData = Storage.getData("saveData") || [];
    }
    // Метод для форматирования даты
    getDateComments(date) {
        const dateFormat = new Date(date);
        const datePart = dateFormat.toLocaleDateString("ru-RU", {
            month: "numeric",
            day: "numeric",
        });
        const timePart = dateFormat.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${datePart} ${timePart}`; // Объединение без запятой
    }
    // Генерация HTML главного комментария
    generateCommentHTML(commentData, index) {
        const ratingColor = commentData.rating < 0 ? "color: red;" : "color: #8ac540;";
        return `
    <div class="main-comments" data-id="${index}">
      <div class="main-comments__container">
        <div class="main-comments__avatar-container">
          <img class="main-user-avatar" src="${commentData.avatar}" alt="user-img" />
        </div>
        <div class="main-comments__wrapper-container">
          <div class="main-comments__info-container">
            <span class="user-info__name">
              ${commentData.firstName} ${commentData.lastName}
            </span>
            <span class="user-info__date">
              ${this.getDateComments(commentData.date)}
            </span>
          </div>
          <div class="main-comments__message-container">
            ${commentData.message}
          </div>
          <div class="main-comments__buttons-container">
            <span class="reply-button" data-id="${index}">
              <img src="./assets/icons/answer-arrow.svg" alt="Arrow" />Ответить
            </span>
            <span class="favorites-button" data-old="${commentData.favorites}">
              <img src="./assets/icons/${commentData.favorites ? "in" : "to"}-favorites.svg" class="favorites-button-img" alt="${commentData.favorites ? "В избранном" : "В избранное"}" />
              ${commentData.favorites ? "В избранном" : "В избранное"}
            </span>
            <div class="rating-button">
              <div class="rating-button__negative" data-old="${commentData.rating}">
                -
              </div>
              <div class="rating-button__score score-${index}" style="${ratingColor}">
                ${commentData.rating}
              </div>
              <div class="rating-button__positive" data-old="${commentData.rating}">
                +
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reply-comments__container"></div>
    </div>`;
    }
    // Генерация HTML для ответа на комментарий
    generateCommentReplyHTML(answerData, // Ответы используют AnswerData
    parentComment, // Главный комментарий
    indexAnswerId) {
        const ratingColor = answerData.rating < 0 ? "color: red;" : "color: #8ac540;";
        return `
    <div class="reply-comments" data-id="${indexAnswerId}">
      <div class="reply-comments__avatar-container">
        <img class="main-user-avatar" src="${answerData.avatar}" alt="user-img" />
      </div>
      <div class="reply-comments__wrapper-container">
        <div class="reply-comments__info-container">
          <span class="user-info__name">
            ${answerData.firstName} ${answerData.lastName}
          </span>
          <span class="user-info__answer">
            <img src="./assets/icons/answer-arrow.svg" alt="Arrow"/>
            ${parentComment.firstName ? parentComment.firstName : "Unknown"} 
            ${parentComment.lastName ? parentComment.lastName : "User"}
          </span>
          <span class="user-info__date">
            ${this.getDateComments(answerData.date)}
          </span>
        </div>
        <div class="reply-comments__message-container">
          ${answerData.message}
        </div>
        <div class="reply-comments__buttons-container">
          <span class="favorites-button favorites-button__reply" data-old="${answerData.favorites}">
            <img src="./assets/icons/${answerData.favorites ? "in" : "to"}-favorites.svg" class="favorites-button-img" alt="${answerData.favorites ? "В избранном" : "В избранное"}" />
            ${answerData.favorites ? "В избранном" : "В избранное"}
          </span>
          <div class="rating-button">
            <div class="rating-button__negative rating-button__negative--reply">-</div>
            <div class="rating-button__score rating-button__score--reply" style="${ratingColor}" data-answer-id="${indexAnswerId}">
              ${answerData.rating}
            </div>
            <div class="rating-button__positive rating-button__positive--reply">+</div>
          </div>
        </div>
      </div>
    </div>`;
    }
    // Метод для отображения всех комментариев и их ответов
    renderComments() {
        this.container.innerHTML = "";
        this.saveData.forEach((commentData, index) => {
            const commentHTML = this.generateCommentHTML(commentData, index);
            this.container.insertAdjacentHTML("beforeend", commentHTML);
            // Отображение ответов на комментарии
            if (commentData.answers.length > 0) {
                const replyCommentsContainer = this.container.querySelector(`.main-comments[data-id="${index}"] .reply-comments__container`);
                // Проверка на null перед использованием
                if (replyCommentsContainer) {
                    commentData.answers.forEach((answer, answerIndex) => {
                        const replyHTML = this.generateCommentReplyHTML(answer, // Используем AnswerData для ответов
                        commentData, // Главный комментарий
                        answerIndex);
                        replyCommentsContainer.insertAdjacentHTML("beforeend", replyHTML);
                    });
                }
                else {
                    console.error(`Reply comments container not found for comment index ${index}`);
                }
            }
        });
    }
}
export default Comment;
