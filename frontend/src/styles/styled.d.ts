import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      alertError: string;
      background: string;
      text: string;
    };
  }
}
