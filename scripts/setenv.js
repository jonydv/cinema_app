const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envConfigFile = `export const environment = {
  production: false,
  tmdbApiUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  tmdbBearerToken: '${process.env.TMDB_BEARER_TOKEN || process.env.TMDB_ACCESS_TOKEN || ''}'
};
`;

const prodEnvConfigFile = `export const environment = {
  production: true,
  tmdbApiUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  tmdbBearerToken: '${process.env.TMDB_BEARER_TOKEN || process.env.TMDB_ACCESS_TOKEN || ''}'
};
`;

const targetPath = path.join(__dirname, '../src/environments/environment.ts');
const targetProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

fs.mkdirSync(path.join(__dirname, '../src/environments'), { recursive: true });

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
fs.writeFileSync(targetProdPath, prodEnvConfigFile, 'utf8');

console.log('Environment files generated successfully');
