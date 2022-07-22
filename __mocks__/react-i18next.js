<<<<<<< HEAD
const React = require("react");
const reactI18next = require("react-i18next");

const hasChildren = (node) =>
  node && (node.children || (node.props && node.props.children));

const getChildren = (node) =>
  node && node.children ? node.children : node.props && node.props.children;

const renderNodes = (reactNodes) => {
  if (typeof reactNodes === "string") {
=======
/** At present, this entire mock is boilerplate. */

const React = require('react');
const reactI18next = require('react-i18next');

const hasChildren = node => node && (node.children || (node.props && node.props.children));

const getChildren = node => (node && node.children ? node.children : node.props && node.props.children);

const renderNodes = reactNodes => {
  if (typeof reactNodes === 'string') {
>>>>>>> fix the module to watch it
    return reactNodes;
  }

  return Object.keys(reactNodes).map((key, i) => {
    const child = reactNodes[key];
    const isElement = React.isValidElement(child);

<<<<<<< HEAD
    if (typeof child === "string") {
=======
    if (typeof child === 'string') {
>>>>>>> fix the module to watch it
      return child;
    }
    if (hasChildren(child)) {
      const inner = renderNodes(getChildren(child));
      return React.cloneElement(child, { ...child.props, key: i }, inner);
    }
<<<<<<< HEAD
    if (typeof child === "object" && !isElement) {
      return Object.keys(child).reduce(
        (str, childKey) => `${str}${child[childKey]}`,
        ""
      );
=======
    if (typeof child === 'object' && !isElement) {
      return Object.keys(child).reduce((str, childKey) => `${str}${child[childKey]}`, '');
>>>>>>> fix the module to watch it
    }

    return child;
  });
};

<<<<<<< HEAD
const useMock = [(k) => k, {}];
useMock.t = (k) => k;
=======
const useMock = [k => k, {}];
useMock.t = (k, o) => (o && o.defaultValue) || (typeof o === 'string' ? o : k);
>>>>>>> fix the module to watch it
useMock.i18n = {};

module.exports = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  Trans: ({ children }) => renderNodes(children),
<<<<<<< HEAD
  Translation: ({ children }) => children((k) => k, { i18n: {} }),
=======
  Translation: ({ children }) => children(k => k, { i18n: {} }),
>>>>>>> fix the module to watch it
  useTranslation: () => useMock,

  // mock if needed
  I18nextProvider: reactI18next.I18nextProvider,
  initReactI18next: reactI18next.initReactI18next,
  setDefaults: reactI18next.setDefaults,
  getDefaults: reactI18next.getDefaults,
  setI18n: reactI18next.setI18n,
  getI18n: reactI18next.getI18n,
};
