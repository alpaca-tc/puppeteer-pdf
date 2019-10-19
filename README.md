[![CircleCI](https://circleci.com/gh/alpaca-tc/puppeteer-pdf.svg?style=svg)](https://circleci.com/gh/alpaca-tc/puppeteer-pdf)

# PDF Converter by using puppeteer.

## Usage

```sh
$ git clone https://github.com/alpaca-tc/puppeteer-pdf
$ docker build . -t puppeteer-pdf
$ docker run -p 8080:8080 -t puppeteer-pdf

# Generate PDF from html source
$ http --form post http://127.0.0.1:8080/api/items source="<html><body><h1>hello world</h1></body></html>" format="A4"

# Generate PDF from url
$ http --form post http://127.0.0.1:8080/api/items url="https://google.com"
```

## Development

```sh
# Install dependencies
$ yarn install

# Run test
$ yarn run test

# Run tslint
$ yarn run tslint

# Build typescript
$ yarn run build

# Run express
$ yarn run start
```
