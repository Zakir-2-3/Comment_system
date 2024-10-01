import User from "./modules/User.js";
import Storage from "./modules/Storage.js";
import Comment from "./modules/Comment.js";
import Filter from "./modules/Filter.js";
import EventHandler from "./modules/EventHandler.js";
const userAvatar = document.querySelector(".main-user-avatar");
const userInfo = document.querySelector(".user-info__name");
const filterBtn = document.querySelector("#filter-settings-comment");
const filterMenu = document.querySelector(".filter-comment__container");
const input = document.querySelector(".input-message");
const btn = document.querySelector("#btn");
const output = document.querySelector(".output");
const maxText = document.querySelector("#max-text");
const maxLength = document.querySelector(".input__max-text");
const btnSortingComments = document.querySelector("#filter-sorting-comment");
const emptyCommentsMessage = document.querySelector(".error-message__empty-comments");
const filterListContainer = document.querySelector(".filter-comment__container-menu");
const answerMessageContainer = document.querySelector(".second-section__answer-comments-container");
const btnSortingFavoritesComments = document.querySelector("#filter-favorites");
// Инициализация пользователя
let user;
if (userAvatar && userInfo) {
    user = new User(userAvatar, userInfo);
    user.fetchUserData();
}
else {
    console.error("User avatar or info element not found");
}
// Инициализация комментариев
let comment;
if (answerMessageContainer) {
    comment = new Comment(answerMessageContainer);
    comment.renderComments();
}
else {
    console.error("Element for answerMessageContainer not found");
}
// Инициализация фильтра
const filter = new Filter(filterBtn, filterMenu, filterListContainer, answerMessageContainer, btnSortingFavoritesComments, comment, // '!', чтобы указать, что comment не undefined
btnSortingComments);
// Инициализация хранилища
const storage = new Storage();
// Инициализация обработчика событий
const eventHandler = new EventHandler(comment, storage, // Передаем экземпляр Storage
user !== null && user !== void 0 ? user : {
    avatarUrl: "",
    firstName: "",
    lastName: "",
    fetchUserData: () => { },
}, input, btn, output, maxText, maxLength, emptyCommentsMessage);
eventHandler.init();
