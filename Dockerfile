# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM node:10-slim

ENV APP_DIR /usr/src/app
ENV FONT_DIR /usr/share/fonts
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-unstable

WORKDIR $APP_DIR

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-ipafont-mincho fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf unzip \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install noto font
RUN mkdir -p /tmp/noto \
    && curl -LsS https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip > /tmp/noto/font.zip \
    && unzip /tmp/noto/font.zip -d /tmp/noto \
    && find /tmp/noto/ -type f -not -name '*otf' -and -not -name '*otc' | xargs rm -r \
    && mv /tmp/noto $FONT_DIR/opentype/ \
    && chmod 644 -R $FONT_DIR/opentype/noto \
    && fc-cache -fv

RUN groupadd -r app && useradd -r -g app -G audio,video app \
    && mkdir -p /home/app/Downloads \
    && chown -R app:app /home/app \
    && chown -R app:app $APP_DIR

COPY --chown=app:app . .

# Install puppeteer so it's available in the container.
RUN yarn install --frozen-lockfile --no-cache \
      && NODE_ENV=production yarn run build \
      && rm -rf node_modules src \
      && yarn install --frozen-lockfile --no-cache --production \
      && yarn cache clean

USER app:app

ENV NODE_ENV production
EXPOSE 8080

CMD ["yarn", "run", "start"]
