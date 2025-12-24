import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import './i18n/config'; // Initialize i18n

import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </HelmetProvider>
);