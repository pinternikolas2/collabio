const mockAdmin = {
    initializeApp: () => console.log('Mock initializeApp called'),
    firestore: () => ({
        collection: () => ({}),
        FieldValue: { serverTimestamp: () => 'mockTimestamp', increment: () => 1 }
    })
};

// Mock require
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (path) {
    if (path === 'firebase-admin') return mockAdmin;
    return originalRequire.apply(this, arguments);
};

try {
    const functions = require('./index.js');
    console.log('Successfully loaded functions/index.js');
    console.log('Exported functions:', Object.keys(functions));
} catch (error) {
    console.error('Error loading functions/index.js:', error);
    process.exit(1);
}
