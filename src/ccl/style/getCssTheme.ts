import { createTheme } from '@mui/material';

const theme = createTheme();


export const getCssTheme = () => {
  const cssTheme = {};
  
  const parseTheme = (theme: Record<string, any>, parentName: string) => {
    Object.keys(theme).forEach((key) => {
      const value = theme[key];
      if (typeof value === 'object' && !Array.isArray(value)) {
        parseTheme(value, `${parentName}-${key}`);
      } else if (Array.isArray(value)) {
        value.forEach((v, index) => {
          if (typeof v === 'object' && !Array.isArray(v)) {
            parseTheme(v, `${parentName}-${key}-${index}`);
          } else {
            cssTheme[`${parentName}-${key}-${index}`] = `${v}`;
          }
        });
      } else if (typeof value === 'string' || typeof value === 'number') {
        cssTheme[`${parentName}-${key}`] = `${value}`;
      }
    });
  }
  parseTheme(theme, '-');
  const cssThemeString = Object.keys(cssTheme).map((key) => `${key}: ${cssTheme[key]};`).join('\n');
  const cssThemeObject = Object.keys(cssTheme).reduce((acc, key) => {
    acc[key.replace('--', '')] = cssTheme[key];
    return acc;
  }, {});
  (window as any).cssThemeObject = cssThemeObject;
  return cssThemeString;
};
