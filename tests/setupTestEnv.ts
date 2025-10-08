const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

function filterDotenv(msg?: any, ...args: any[]) {
    if (typeof msg === "string" && msg.includes("[dotenv")) return;
    return [msg, ...args];
}

console.log = (msg?: any, ...args: any[]) => {
    const filtered = filterDotenv(msg, ...args);
    if (filtered) originalLog(...filtered);
};
console.info = (msg?: any, ...args: any[]) => {
    const filtered = filterDotenv(msg, ...args);
    if (filtered) originalInfo(...filtered);
};
console.warn = (msg?: any, ...args: any[]) => {
    const filtered = filterDotenv(msg, ...args);
    if (filtered) originalWarn(...filtered);
};

// اعتراض الكتابة المباشرة على stdout
process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
    if (typeof chunk === "string" && chunk.includes("[dotenv")) return true;
    return originalStdoutWrite(chunk, encoding, callback);
};

// filepath: /Users/barraattar/Desktop/flutterApp/couponati-api/jest.config.js
module.exports = {
    // ...existing config...
    setupFiles: ["<rootDir>/tests/setupTestEnv.ts"],
};
