class TokenManager {
  static instance;
  static dashboardToken;

  static getInstance() {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setDashboardToken(token) {
    TokenManager.dashboardToken = token;
    localStorage.setItem('dashboardToken', token);
  }

  getDashboardToken() {
    return TokenManager.dashboardToken || localStorage.getItem('dashboardToken');
  }
}

export const tokenManager = TokenManager.getInstance();
