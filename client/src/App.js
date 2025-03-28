/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Themeroutes from './routes/Router';
import ThemeSelector from './layouts/theme/ThemeSelector';
import Loader from './layouts/loader/Loader';
import Chatbot from './components/Chatbot/Chatbot';

const App = () => {
  const routing = useRoutes(Themeroutes);
  // const direction = useSelector((state) => state.customizer.isRTL);
  const isMode = useSelector((state) => state.customizer.isDark);
  return (
    <Suspense fallback={<Loader />}>
      <div
        className={` ${isMode ? 'dark' : ''}`}
      // dir={direction ? 'rtl' : 'ltr'}
      >
        <ThemeSelector />
        {routing}
      </div>
      <Chatbot />
    </Suspense>
  );
};

export default App;
