# LandCalc

A simple land measurement calculator for calculating land area and converting between different units of measurement.

## Features

- Calculate land area from measurements.
- Convert between supported land measurement units.
- Android app built with React Native.
- Web version powered by React Native Web and Vite.
- Simple, user-friendly interface.

## Tech Stack

- React Native
- TypeScript
- React Native Community CLI
- React Native Web
- Vite

## Getting Started

### Prerequisites

- Node.js and npm
- JDK 17
- Android Studio and Android SDK
- Android emulator or a physical Android device

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd LandCalc
npm install
```

Replace `<repository-url>` with your GitHub repository URL.

## Running the App

### Android

Start an Android emulator or connect your Android device, then run:

```bash
npm run android
```

### Web

Start the development server:

```bash
npm run web
```

Open the URL displayed in your terminal, usually `http://localhost:5173/`.

Build the production web version:

```bash
npm run web:build
```

The production build is generated in the `web/` directory.

## Building an Android APK

From the project root:

```bash
cd android
./gradlew assembleDebug
```

The generated APK is located at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```text
LandCalc/
├── android/       # Native Android project
├── src/           # Application source files
├── web/           # Generated web build
├── App.tsx        # Main application component
├── index.html     # Web entry HTML
├── package.json   # Dependencies and scripts
└── vite.config.ts # Vite configuration
```

The exact structure may change as development continues. The `web/` directory contains generated files and should not be edited manually.

## Contributing

Suggestions, bug reports, and contributions are welcome. Feel free to open an issue or submit a pull request.

## Disclaimer

LandCalc is intended as a calculation aid. Verify measurements, regional unit definitions, and results before using them for official records or land transactions.

## License

Add your chosen license here and include the corresponding `LICENSE` file in the repository.
