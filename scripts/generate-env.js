const fs = require('fs')
const token = process.env.TMDB_BEARER_TOKEN ?? ''

console.log('[generate-env] TMDB_BEARER_TOKEN present:', !!token, '| length:', token.length)

fs.mkdirSync('src/environments', { recursive: true })

fs.writeFileSync(
  'src/environments/environment.ts',
  `export const environment = {
  production: false,
  tmdbApiUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  tmdbBearerToken: '${token}',
}
`
)

fs.writeFileSync(
  'src/environments/environment.prod.ts',
  `export const environment = {
  production: true,
  tmdbApiUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  tmdbBearerToken: '${token}',
}
`
)
