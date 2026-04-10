import 'styled-components';
import type { lightTheme } from '../styles/theme';

type AppTheme = typeof lightTheme;

declare module 'styled-components' {
    export interface DefaultTheme extends AppTheme {}
}