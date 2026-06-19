import { render, screen } from '@testing-library/react';
import App from './App';

// Simple test to ensure the App renders without crashing
describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);
    // Just check if the app container exists
    const appElement = screen.getByTestId('app-container');
    expect(appElement).toBeInTheDocument();
  });
});