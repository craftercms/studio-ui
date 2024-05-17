import { createRoot } from 'react-dom/client';
import React, { StrictMode, Suspense } from 'react';
import Login from './pages/Login';

interface FreemarkerData {
  xsrfToken: string;
  xsrfParamName: string;
  xsrfHeaderName: string;
  passwordRequirementsMinComplexity: number;
  lockedErrorMessage: string;
  lockedTimeSeconds: number;
}

const json = document.getElementById('bootData').innerHTML;
const props: FreemarkerData = JSON.parse(json);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense>
      <Login {...props} />
    </Suspense>
  </StrictMode>
);
