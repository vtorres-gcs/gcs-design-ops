// GCS Design System — breakpoint constants for CSS-in-JS component styles.
// Keep these numbers in sync with the --bp-* custom properties declared in
// tokens/breakpoints.css — this file exists because CSS cannot resolve a
// var() inside an @media condition, so components that build their styles
// via template literals import these instead of hardcoding pixel values.
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};
