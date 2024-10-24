import User from "./modules/User.js";
import Storage from "./modules/Storage.js";
import Comment from "./modules/Comment.js";
import Filter from "./modules/Filter.js";
import EventHandler from "./modules/EventHandler.js";

const userAvatar = document.querySelector<HTMLImageElement>(".main-user-avatar")!;
const userInfo = document.querySelector<HTMLSpanElement>(".user-info__name")!;
const filterBtn = document.querySelector<HTMLButtonElement>("#filter-settings-comment")!;
const filterMenu = document.querySelector<HTMLDivElement>(".filter-comment__container")!;
const input = document.querySelector<HTMLDivElement>(".input-message")!;
const btn = document.querySelector<HTMLButtonElement>("#btn")!;
const output = document.querySelector<HTMLOutputElement>(".output")!;
const maxText = document.querySelector<HTMLParagraphElement>("#max-text")!;
const maxLength = document.querySelector<HTMLParagraphElement>(".input__max-text")!;
const btnSortingComments = document.querySelector<HTMLImageElement>("#filter-sorting-comment")!;
const emptyCommentsMessage = document.querySelector<HTMLParagraphElement>(".error-message__empty-comments")!;
const filterListContainer = document.querySelector<HTMLUListElement>(".filter-comment__container-menu")!;
const answerMessageContainer = document.querySelector<HTMLDivElement>(".second-section__answer-comments-container")!;
const btnSortingFavoritesComments = document.querySelector<HTMLSpanElement>("#filter-favorites")!;

// Инициализация пользователя
let user: User | undefined;
if (userAvatar && userInfo) {
  user = new User(userAvatar, userInfo);
  user.fetchUserData();
} else {
  console.error("User avatar or info element not found");
}

// Инициализация комментариев
let comment: Comment | undefined;
if (answerMessageContainer) {
  comment = new Comment(answerMessageContainer);
  comment.renderComments();
} else {
  console.error("Element for answerMessageContainer not found");
}

// Инициализация фильтра
const filter = new Filter(
  filterBtn,
  filterMenu,
  filterListContainer,
  answerMessageContainer,
  btnSortingFavoritesComments,
  comment!, // '!', чтобы указать, что comment не undefined
  btnSortingComments
);

// Инициализация хранилища
const storage = new Storage();

// Инициализация обработчика событий
const eventHandler = new EventHandler(
  comment!,
  storage, // Передаем экземпляр Storage
  user ?? {
    avatarUrl: "",
    firstName: "",
    lastName: "",
    fetchUserData: () => {},
  },
  input,
  btn,
  output,
  maxText,
  maxLength,
  emptyCommentsMessage
);

eventHandler.init();