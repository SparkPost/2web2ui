# SparkPost App

[![CircleCI](https://circleci.com/gh/SparkPost/2web2ui.svg?style=svg&circle-token=38db9634ea082cf65313e581edf7daea0a61906c)](https://app.circleci.com/pipelines/github/SparkPost/2web2ui)

A re-build of the SparkPost web app using React.

## Installing dependencies

This project uses `npm6`, so upgrade if you haven't.

```
npm install npm@6 -g
```

Then `npm install` to install deps.

## Local development

`npm start` will start a dev server backed by api.sparkpost.test with live reload on
http://localhost:3100/ and http://app.sparkpost.test.

### Running a Production Build

Run a production build by building the app and then starting a local web server:

```
npm run build && npm run serve
```

## Tests

### Unit Tests

To run the unit test suite:

```
npm test
```

**NOTE:** You may need to `brew install watchman` for jest to run in watch mode on OS X.
https://github.com/facebook/react-native/issues/9309#issuecomment-238966924

### End to End Tests

In order to run UI tests, the local development server needs to first be started and running on
port 3100. First, [start your development server](#local-development) and in another terminal tab,
run the following command:

```
npm run test-e2e
```

**NOTE:** The first time tests are run, the developer is prompted to answer some questions that will
then generate an env file that is ignored by source control.

To run end-to-end tests in headless mode:

```
npm run test-e2e-headless
```

### Integration Testing

Integration tests run in real browser, however, largely use
[fixtures](https://docs.cypress.io/api/commands/fixture.html) instead of true network requests. For
clear definitions with regards to the different types of automated testing, try reading
[Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/unit-vs-integration-vs-e2e-tests)
by Kent C. Dodds.

```
npm run test-integration
```

To run the integration tests in headless mode:

```
npm run test-integration-headless
```

**NOTE:** The first time _either_ end-to-end or integration tests are run, the developer is prompted
to answer some questions that will then generate an env file that is ignored by source control.

## Learning Resources

A good comparison of React and Redux and how they relate to Angular is here:
https://github.com/jasonrhodes/how-to-react

If you're new to React, you should have a basic understanding of how it works before jumping into
this project. Mainly, you should understand what `JSX` is, the difference between a
functional/stateless and class component, and how `setState` works inside class components.

Here are some resources for learning basic React:

- https://reactforbeginners.com/
- https://reactjs.org/tutorial/tutorial.html

Once you're familiar with React, you should also begin to understand what Redux is. For Redux, you
should understand what an action creator and a reducer is, how you `connect` a component to the
Redux store using `react-redux` (and using connect's 2 arguments, `mapStateToProps` and
`bindActionCreators`), and when to use Redux vs. local component state.

Good resources for learning Redux:

- https://egghead.io/courses/getting-started-with-redux
- https://learnredux.com/

A few other things you will want to understand that we make heavy use of in this app:

- [Redux Thunk](https://github.com/gaearon/redux-thunk) - A "middleware" library for redux that lets
  us dispatch a function instead of a plain object action. Helps with doing async stuff in actions.
- [React Router](https://reacttraining.com/react-router/web/guides/philosophy) - This is the router
  we use for the entire application. We add new routes using declarative config but for things like
  `Link` and `props.location.match` you'll need to understand how RR works on some level.
- [Reselect](https://github.com/reactjs/reselect) - Selectors are a redux idea that lets us move all
  logic out of `mapStateToProps` functions so it can be properly tested. The reselect library helps
  us create selectors that also get a nice memoization benefit.

## About the project

Before jumping into writing code, here are a few conventions you should be aware of:

1. We use ESLint to enforce automated linting. The config is extended from a few places and defined
   inside the package.json file, under the "eslintConfig" key (instead of using a root level
   .eslintrc file).

   - To run our linting, you can run `npm run lint` or `npm run lint -- --fix` to run in "auto fix
     mode".
   - Linting is run during the build process but NOT during tests (jest runs tests in watch mode)
   - We are always looking for ways to move things into automated linting instead of just having
     "conventions" listed later in this section.
   - We should consider looking at some combination of prettier and eslint at some point.

1. **File and folder names:** everything is camelCase except for component files and other
   class-only files, which are PascalCase. When in doubt, file names should match the default
   export's function/class/variable name.

1. **index.js "directory" files:** when there are 3 or more components in a sub-directory (e.g.
   src/pages/webhooks), export all of them inside of an index.js file there, for easier and less
   verbose imports elsewhere.

1. **Sub-directory groups:** Any time you have more than one file making up a component or related
   set of components, put them in a sub-directory (e.g. src/components/collection/\*)

1. **Magic module resolution:** we use webpack tomfoolery and jest shenanigans to make our modules
   resolve relative to `src/`, so you can `import something from whatever/yeah` so long as there is
   a `src/whatever/yeah.js` file. And so on. You should prefer this style to relative imports unless
   the files are directly next to each other or are related to each other and no more than one
   directory away.

   - Note: we should change this to resolve relative to the root, and then ever import from `src/`
     e.g. `import something from 'src/whatever/yeah'` to limit the scope of possible node_modules
     conflicts. Will need to change all existing references and then edit Jest and Webpack configs.

1. **Don't use lodash `_.chain`.** We use
   [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash#limitations) to tree-shake
   our use of lodash so we only have to bundle methods we use, but `_.chain` breaks all of that. If
   you want to do something like chaining, you can use `flow` from `lodash/fp`, which is somewhat
   explained in
   [this article](https://medium.com/making-internets/why-using-chain-is-a-mistake-9bc1f80d51ba).
   - Note: use `flow` and not `compose` bc compose is backwards and weird. ;)
   - Other note: you can import directly from `lodash/fp` because of our babel transform. (e.g.
     `import { map, flow } from 'lodash/fp'`)

### Docs

Documentation is hosted on the [GitHub Wiki](https://github.com/SparkPost/2web2ui/wiki).
