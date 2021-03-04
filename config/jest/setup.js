/* eslint-disable no-unused-vars, no-console */
import raf from './tempPolyfills';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect'; // Provides Testing Library matchers
import { configure } from '@testing-library/react';
import * as matchers from './matchers';
import setupPortals from 'src/__testHelpers__/setupPortals';
import MutationObserver from '@sheerun/mutationobserver-shim';

// Provides enzyme assertions.
// See https://github.com/blainekasten/enzyme-matchers#assertions
import 'jest-enzyme';

expect.extend(matchers); // register custom matchers

Enzyme.configure({ adapter: new Adapter() });

// React testing library configuration
configure({
  testIdAttribute: 'data-id', // Overriding the default test ID used by `getByTestId` matcher - `data-testid` isn't used so we can also use these attributes for analytics tagging
});

setupPortals();
document.body.setAttribute('tabindex', '-1'); // Allows the <body/> to programmatically receive focus

beforeEach(() => {
  // Verifies that at least one assertion is called during a test
  // See https://facebook.github.io/jest/docs/en/expect.html#expecthasassertions
  expect.hasAssertions();
});

jest.mock('src/components/hibana/HibanaStyleHandler', () => undefined); // TODO: Remove when OG theme is removed

Object.defineProperty(global.navigator, 'userAgent', { value: 'node.js', configurable: true });
Object.defineProperty(global.navigator, 'language', { value: 'en-US', configurable: true });
// Mocks window `matchMedia` method used by:
// https://design.sparkpost.com/components/hooks#usebreakpoint
Object.defineProperty(global.window, 'matchMedia', {
  value: () => ({
    matches: true,
    addListener: jest.fn,
    removeListener: jest.fn,
  }),
});
Object.defineProperty(global.window, 'scrollTo', { value: jest.fn(), configurable: true });

// Show a stack track for unhandled rejections to help
// track them down.
process.on('unhandledRejection', reason => {
  console.log(reason);
});

const mockLocalStorage = {
  clear: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
};

Object.defineProperty(global.window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(global.window, 'MutationObserver', { value: MutationObserver });
