import type { AppProps } from 'next/app';
import { PWAShell } from '../components/PWAShell';
import { InstallPrompt } from '../components/InstallPrompt';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PWAShell>
      <Component {...pageProps} />
      <InstallPrompt />
    </PWAShell>
  );
}

export default MyApp;
