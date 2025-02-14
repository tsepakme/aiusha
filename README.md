# Swiss system

This project is a Swiss System Tournament application built with React and TypeScript. It allows users to manage players, organize tournaments, and track results.

## Features

- Add players with optional ratings.
- Start and manage tournaments using the Swiss system.
- Input match results and automatically calculate standings.
- View final standings with points and Buchholz scores.

## Installation

1. Clone the repository:
   ```
   git clone git@github.com:tsepakme/aiusha.git
   ```

2. Navigate to the project directory:
   ```
   cd aiusha
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run start
   ```

2. Open your browser and go to `http://localhost:5173` to view the application.

## Components

- **ThemeProvider**: Provides theme context for consistent styling.
- **Button**: A reusable button component.
- **Input**: A text input component for user input.
- **Select**: A dropdown selection component.
- **Table**: A component for displaying data in a table format.
- **ModeToggle**: A component for switching between light and dark modes.

## Types

The application uses TypeScript for type safety. Key types include:
- **Player**: Represents a player in the tournament.
- **Match**: Represents a match between two players.
- **Round**: Represents a round of matches in the tournament.
- **Tournament**: Represents the overall tournament structure.

## Utilities

Utility functions are provided for tasks such as initializing players and generating rounds.

## License

This project is licensed under the MIT License.