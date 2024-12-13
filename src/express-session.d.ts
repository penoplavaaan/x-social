import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userData?: {
      picture?: string;
      name?: string;
      nickName?: string;
    };
  }
}
