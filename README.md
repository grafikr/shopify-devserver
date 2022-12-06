# Shopify DevServer

Shopify DevServer is a package to make [webpack DevSever](https://webpack.js.org/configuration/dev-server/) work with Shopify.

### Installation

You can install the package using Yarn:

```
$ yarn install @grafikr/shopify-devserver --save-dev
```

### Usage

In your webpack config file, add the package to the `devServer` attribute. It could look like this:

```js
const devServer = require('@grafikr/shopify-devserver');

module.exports = (env) => ({
  ...

  devServer: devServer(env),

  ...
});
```

Once this is done, you should be able to run webpack with the serve command.

For easy integration, you can add it as an action to your scripts in `package.json`.

```json
{
  "scripts": {
    "serve": "webpack serve --mode development --hot",
    "serve-no-lr": "webpack serve --node-env development --hot --env NOLR"
  }
}
```
