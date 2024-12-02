module.exports = {
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/pages/Group.tsx',  // Exclude Group.tsx
    'src/types/'
  ],
}; 