export default {
  preset: 'ts-jest',
  transform: {
    '^.+\.(ts|tsx)?$': 'ts-jest',
    '^.+\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/.pnpm'],

  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\.ts?$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  testEnvironment: 'node',
  testRegex: '(/__test__/.*|\.(test|spec))\.(ts|tsx|js)$',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
}
