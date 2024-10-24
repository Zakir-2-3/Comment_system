import Comment from "./Comment.js";
import Storage from "./Storage.js";

interface CommentData {
  avatar: string;
  firstName: string;
  lastName: string;
  message: string;
  rating: number;
  favorites: boolean;
  date: string;
  answers: CommentData[];
}

class EventHandler {
  private comment: Comment;
  private storage: Storage;
  private user: {
    avatarUrl: string;
    firstName: string;
    lastName: string;
    fetchUserData: () => void;
  };
  private input: HTMLDivElement;
  private btn: HTMLButtonElement;
  private output: HTMLOutputElement;
  private maxText: HTMLParagraphElement;
  private maxLength: HTMLParagraphElement;
  private emptyCommentsMessage: HTMLParagraphElement;
  private MAXLENGTH: number = 1000;
  private replyToCommentId: number | null = null;
  private previousElement: HTMLElement | null = null;
  private newElement: HTMLElement = document.createElement("span");
  private containerText: HTMLDivElement | null = document.querySelector(".form-text-container");

  constructor(
    comment: Comment,
    storage: Storage,
    user: {
      avatarUrl: string;
      firstName: string;
      lastName: string;
      fetchUserData: () => void;
    },
    input: HTMLDivElement,
    btn: HTMLButtonElement,
    output: HTMLOutputElement,
    maxText: HTMLParagraphElement,
    maxLength: HTMLParagraphElement,
    emptyCommentsMessage: HTMLParagraphElement
  ) {
    this.comment = comment;
    this.storage = storage;
    this.user = user;
    this.input = input;
    this.btn = btn;
    this.output = output;
    this.maxText = maxText;
    this.maxLength = maxLength;
    this.emptyCommentsMessage = emptyCommentsMessage;
  }

  private initializeInputHandler() {
    this.input.addEventListener("keyup", () => {
      const textLength = this.input.textContent?.length || 0;
      this.output.textContent = `${textLength}/${this.MAXLENGTH}`;

      if (textLength > this.MAXLENGTH) {
        this.output.style.cssText = "color: red; display: block";
        this.maxText.textContent = "Слишком длинное сообщение";
        this.maxText.style.cssText =
          "color: red; font-size: 14px; position: absolute;";
        this.maxLength.textContent = "";
        this.btn.style.cssText = "none";
        this.btn.disabled = true;
      } else if (textLength === 0) {
        this.maxLength.textContent = "Макс. 1000 символов";
        this.maxText.style.display = "none";
        this.output.style.display = "none";
        this.btn.style.cssText = "none";
        this.btn.disabled = true;
        this.emptyCommentsMessage.style.display = "none";
      } else {
        this.maxLength.textContent = "";
        this.maxText.style.display = "none";
        this.output.style.cssText = "none";
        this.output.style.display = "block";
        this.btn.disabled = false;
        this.emptyCommentsMessage.style.display = "none";
        this.btn.style.cssText =
          "cursor: pointer; background: #abd873; color: #000; pointer-events: auto";
      }
    });
  }

  private sendMessageHandler() {
    this.btn.addEventListener("click", () => {
      const commentText = this.input.textContent?.trim() || "";

      if (commentText.length === 0) {
        this.emptyCommentsMessage.style.display = "flex";
        return;
      } else {
        this.emptyCommentsMessage.style.display = "none";
      }

      // Общие свойства для всех комментариев
      const baseCommentData = {
        avatar: this.user.avatarUrl,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        message: commentText,
        rating: 0,
        favorites: false,
        date: new Date().toISOString(),
      };

      if (this.replyToCommentId !== null) {
        const parentComment = this.comment.saveData[this.replyToCommentId!];

        // Проверка, что у родительского комментария есть массив answers
        if (!parentComment.answers) {
          parentComment.answers = [];
        }

        // Создаем ответ, без answers
        const replyData = {
          ...baseCommentData, // Используем общие свойства
        };

        parentComment.answers.push(replyData); // Добавляем ответ без answers

        const replyCommentHTML = this.comment.generateCommentReplyHTML(
          replyData, // Используем объект ответа
          parentComment,
          parentComment.answers.length - 1
        );

        const replyCommentsContainer = document.querySelector(
          `.main-comments[data-id="${this.replyToCommentId}"] .reply-comments__container`
        ) as HTMLElement;
        replyCommentsContainer.insertAdjacentHTML(
          "beforeend",
          replyCommentHTML
        );

        this.replyToCommentId = null; // Сбрасываем ID после ответа
      } else {
        // Создаем основной комментарий, включая поле answers
        const commentData: CommentData = {
          ...baseCommentData, // Используем общие свойства
          answers: [], // Добавляем поле answers только для основного комментария
        };

        this.comment.saveData.push(commentData); // Добавляем основной комментарий
        const commentHTML = this.comment.generateCommentHTML(
          commentData,
          this.comment.saveData.length - 1
        );
        this.comment.container.insertAdjacentHTML("beforeend", commentHTML);
      }

      // Очистка полей и обновление данных
      this.btn.style.cssText = "none";
      this.output.style.display = "none";
      this.maxText.textContent = "";
      this.maxLength.textContent = "Макс. 1000 символов";
      this.maxText.style.cssText = "none";
      this.input.textContent = "";
      this.newElement.textContent = "";

      Storage.saveData("saveData", this.comment.saveData);
      this.updateCommentCount();
      this.user.fetchUserData(); // Новый пользователь
    });
  }

  // Счет всех комментариев
  private updateCommentCount() {
    const numberComments =
      document.querySelector<HTMLSpanElement>("#number-comments");
    const totalComments = this.comment.saveData.reduce(
      (total, comment) => total + 1 + (comment.answers?.length || 0),
      0
    );
    if (numberComments) {
      numberComments.textContent = `(${totalComments})`;
    }
  }

  // Ответ на комментарии, кому будет ответ
  private replyHandler() {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;

      if (target && target.classList.contains("reply-button")) {
        this.input.focus();
        this.input.scrollIntoView({ behavior: "smooth", block: "center" });

        const id = target.closest(".main-comments")?.getAttribute("data-id");

        // Проверяем, что id не undefined и не null
        if (id !== undefined && id !== null) {
          this.replyToCommentId = parseInt(id, 10);

          if (this.containerText) {
            const { firstName, lastName } =
              this.comment.saveData[this.replyToCommentId];

            const replyUserName = `<img src="./assets/icons/answer-arrow.svg" alt="Arrow">${firstName} ${lastName}`;

            this.newElement.className =
              "user-info__answer user-info__answer-style";
            this.newElement.innerHTML = replyUserName;

            if (this.previousElement) {
              this.containerText.removeChild(this.previousElement);
            }

            this.previousElement = this.newElement;
            const referenceElement = this.containerText.firstChild;
            this.containerText.insertBefore(this.newElement, referenceElement);
          }
        } else {
          // Если id равен undefined или null
          console.error("ID не найден");
        }
      }
    });
  }

  // Рейтинг комментариев
  private ratingCommentHandler() {
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Обработка кнопок рейтинга
      if (
        target.classList.contains("rating-button__negative") ||
        target.classList.contains("rating-button__positive") ||
        target.classList.contains("rating-button__negative--reply") ||
        target.classList.contains("rating-button__positive--reply")
      ) {
        const isReply =
          target.classList.contains("rating-button__negative--reply") ||
          target.classList.contains("rating-button__positive--reply");

        const targetClass = isReply ? "reply-comments" : "main-comments";
        const scoreClass = isReply
          ? "rating-button__score--reply"
          : "rating-button__score";
        const oldRating = +target.getAttribute("data-old")!;

        const commentElement = target.closest(`.${targetClass}`) as HTMLElement;
        if (!commentElement) return; // Проверка на наличие комментария

        const commentId = commentElement.getAttribute("data-id")!;
        const currentScoreElement = commentElement.querySelector(
          `.${scoreClass}`
        ) as HTMLElement;
        if (!currentScoreElement) return; // Проверка на наличие элемента оценки

        let currentScore = +currentScoreElement.innerText;

        // Обновление рейтинга
        if (
          target.classList.contains("rating-button__negative") ||
          target.classList.contains("rating-button__negative--reply")
        ) {
          if (oldRating === currentScore || oldRating < currentScore) {
            currentScore -= 1;
          }
        } else if (
          target.classList.contains("rating-button__positive") ||
          target.classList.contains("rating-button__positive--reply")
        ) {
          if (oldRating === currentScore || oldRating > currentScore) {
            currentScore += 1;
          }
        }

        currentScoreElement.textContent = currentScore.toString();
        currentScoreElement.style.color = currentScore < 0 ? "red" : "#8ac540";

        // Обновление рейтинга в данных
        const parentId = isReply
          ? parseInt(
              commentElement
                .closest(".main-comments")
                ?.getAttribute("data-id") || "",
              10
            )
          : null;
        const answerId = isReply ? parseInt(commentId, 10) : null;

        if (isReply && parentId !== null && answerId !== null) {
          this.comment.saveData[parentId].answers[answerId].rating =
            currentScore;
        } else {
          const commentIdNumber = parseInt(commentId, 10);
          if (!isNaN(commentIdNumber)) {
            this.comment.saveData[commentIdNumber].rating = currentScore;
          }
        }

        Storage.saveData("saveData", this.comment.saveData);
      }

      // Обработка кнопок "Избранное"
      if (
        target.classList.contains("favorites-button") ||
        target.classList.contains("favorites-button-img")
      ) {
        const commentElement = target.closest(
          ".main-comments, .reply-comments"
        ) as HTMLElement;
        if (!commentElement) return; // Проверка на наличие комментария

        const commentId = commentElement.getAttribute("data-id")!;
        const isReply = commentElement.classList.contains("reply-comments");
        const parentId = isReply
          ? parseInt(
              commentElement
                .closest(".main-comments")
                ?.getAttribute("data-id") || "",
              10
            )
          : null;

        let comment;
        if (isReply && parentId !== null) {
          const answerId = parseInt(commentId, 10);
          if (!isNaN(answerId)) {
            comment = this.comment.saveData[parentId];
            if (comment && comment.answers[answerId]) {
              comment.answers[answerId].favorites =
                !comment.answers[answerId].favorites; // Переключаем избранное
              this.updateFavoritesButton(
                commentElement.querySelector(
                  ".favorites-button-img"
                ) as HTMLImageElement,
                commentElement.querySelector(
                  ".favorites-button"
                ) as HTMLElement,
                comment.answers[answerId].favorites
              );
            }
          }
        } else {
          const commentIdNumber = parseInt(commentId, 10);
          if (!isNaN(commentIdNumber)) {
            comment = this.comment.saveData[commentIdNumber];
            if (comment) {
              comment.favorites = !comment.favorites; // Переключаем избранное
              this.updateFavoritesButton(
                commentElement.querySelector(
                  ".favorites-button-img"
                ) as HTMLImageElement,
                commentElement.querySelector(
                  ".favorites-button"
                ) as HTMLElement,
                comment.favorites
              );
            }
          }
        }

        // Сохраняем изменения в localStorage
        Storage.saveData("saveData", this.comment.saveData);
      }
    });
  }

  // Меняем кнопку и текст "В избранное"
  updateFavoritesButton(
    imgElement: HTMLImageElement,
    textElement: HTMLElement,
    isFavorite: boolean
  ) {
    if (isFavorite) {
      imgElement.src = "./assets/icons/in-favorites.svg";
      imgElement.alt = "В избранном";
      textElement.innerHTML = `<img src="./assets/icons/in-favorites.svg" class="favorites-button-img" alt="В избранном" />В избранном`;
    } else {
      imgElement.src = "./assets/icons/to-favorites.svg";
      imgElement.alt = "В избранное";
      textElement.innerHTML = `<img src="./assets/icons/to-favorites.svg" class="favorites-button-img" alt="В избранное" />В избранное`;
    }
  }

  public init() {
    this.initializeInputHandler();
    this.sendMessageHandler();
    this.replyHandler();
    this.ratingCommentHandler();
    this.updateCommentCount();
  }
}

export default EventHandler;
