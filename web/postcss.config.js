const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './src/**/*.html',
    './public/**/*.html',
    './public/index.html',
    './src/**/*.svelte'
  ],
  css: ['public/global.css'],

  whitelistPatterns: [/svelte/, /html/, /body/],

  defaultExtractor: content => {
    const regExp = new RegExp(/[\w-/:]+(?<!:)/g);

    const matchedTokens = [];

    let match = regExp.exec(content);

    while (match) {
      if (match[0].startsWith('class:')) {
        matchedTokens.push(match[0].substring(6));
      } else {
        matchedTokens.push(match[0]);
      }

      match = regExp.exec(content);
    }

    return matchedTokens;
  }
  
});

const production = !process.env.ROLLUP_WATCH

module.exports = {
  plugins: [
    require('tailwindcss'),
    ...(production ? [purgecss] : [])
  ]
};
