export class User {
  constructor(data = {}) {
    this.id = data.id || data.Id || 0;
    this.username = data.username || data.Username || '';
    this.email = data.email || data.Email || '';
    this.profilePictureBase64 = data.profilePictureBase64 || data.ProfilePictureBase64 || '';
    this.role = data.role || data.Role || 0;
  }

  isAdmin() {
    return this.role === 1;
  }

  getProfileImageUrl() {
    if (this.profilePictureBase64) {
      return `data:image/jpeg;base64,${this.profilePictureBase64}`;
    }
    return `https://ui-avatars.com/api/?name=${this.username}&background=random&color=fff&size=48`;
  }
}