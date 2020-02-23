import { createServer } from "https";
import { readFileSync } from "fs";
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const options = {
  key: readFileSync("../cert/certs/tsu.gg/privkey.pem"),
  cert: readFileSync("../cert/certs/tsu.gg/fullchain.pem"),
};

function redirect_http_to_https(req, res, next) {
  res.redirect = "https://tsu.gg";
  res.writeHead(302, {
      Location: res.redirect,
      'Content-Type': 'text/plain',
      'Content-Length': 0,
  });
  res.end();
}

if(dev){
  polka() 
    .use(
      compression({ threshold: 0 }),
      sirv('static', { dev }),
      sirv('dehydrated', { dev: true, dotfiles: true}),
      sapper.middleware()
    )
    .listen(8080, err => {
      if (err) console.log('error', err);
    });
}
else{
  const { handler } = polka() // You can also use Express
    .use(
      compression({ threshold: 0 }),
      sirv('static', { dev }),
      sapper.middleware()
    );
  createServer(options, handler)
    .listen(443, err => {
      if (err) console.log('error', err);
    });
  polka() 
    .use(
      sirv('dehydrated', { dev: true, dotfiles: true}),
      redirect_http_to_https,
    )
    .listen(80, err => {
      if (err) console.log('error', err);
    });
}
