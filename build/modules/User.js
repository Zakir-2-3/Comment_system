class User {
    constructor(userAvatar, userInfo) {
        this.userAvatar = userAvatar;
        this.userInfo = userInfo;
        this.firstName = "";
        this.lastName = "";
        this.avatarUrl = "";
    }
    async fetchUserData() {
        try {
            const response = await fetch("https://randomuser.me/api/");
            const data = await response.json();
            const user = data.results[0].name;
            this.firstName = user.first;
            this.lastName = user.last;
            this.avatarUrl = data.results[0].picture.large;
            this.updateUserUI();
        }
        catch (error) {
            console.error("Ошибка:", error);
        }
    }
    updateUserUI() {
        this.userAvatar.src = this.avatarUrl;
        this.userInfo.textContent = `${this.firstName} ${this.lastName}`;
    }
}
export default User;
