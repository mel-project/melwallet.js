// export default {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   testMatch: ['<rootDir>/tests/*.ts'],
//   testPathIgnorePatterns: ['/node_modules/'],
//   coverageDirectory: './coverage',
//   coveragePathIgnorePatterns: ['node_modules', 'src/database', 'src/test', 'src/types'],
//   // reporters: ['default', 'jest-junit'],
//   globals: { 'ts-jest': { diagnostics: false } },
//   transform: {},
//   };

export default {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  // transformIgnorePatterns: ["node_modules/(?!(json-big)/)"], // not what you want  
  moduleFileExtensions: ['ts', 'js'],

  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  testEnvironment: 'node',
  testRegex: '(/__test__/.*|.(test|spec)).(ts|tsx|js)$',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  // moduleDirectories: ['<rootDir>/node_modules/', 'src'],
  // roots: ['<rootDir>'],
  // modulePaths: ['<rootDir>'],
}
