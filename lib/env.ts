function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`환경변수 ${name} 가 설정되지 않았습니다.`);
  return v;
}

export const env = {
  get githubClientId() {
    return required("GITHUB_CLIENT_ID");
  },
  get githubClientSecret() {
    return required("GITHUB_CLIENT_SECRET");
  },
  get allowedLogin() {
    return required("ALLOWED_GITHUB_LOGIN");
  },
  get repo() {
    return required("GITHUB_REPO");
  },
  get branch() {
    return process.env.GITHUB_BRANCH || "main";
  },
  get sessionSecret() {
    return required("SESSION_SECRET");
  },
};
