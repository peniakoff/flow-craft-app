
// Type declarations for importing CSS/SCSS files in TypeScript
// Allow side-effect imports like `import './globals.css'`
declare module '*.css'

// Typed declarations for CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss'

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
