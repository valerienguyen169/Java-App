import 'express-session';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!

    authenticatedCustomer: {
      customerId: string;
      username: string;
    };
    isLoggedIn: boolean;
    logInAttempts: number;
    logInTimeout: Date;
  }
}
