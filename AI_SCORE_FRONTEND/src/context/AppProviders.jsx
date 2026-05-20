import { ThemeProvider } from './ThemeContext';
import { ScansProvider } from './ScansContext';

const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <ScansProvider>{children}</ScansProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
