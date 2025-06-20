import React from 'react';
import { Route, Routes } from 'react-router-dom';
import GrapesJSEditor from './GrapesJSEditor';
import UnsplashTest from './UnsplashTest';

const CommunicationsRoutes = () => {
  return (
    <Routes>
      <Route path="/template-builder" element={<GrapesJSEditor />} />
      <Route path="/unsplash-test" element={<UnsplashTest />} />
    </Routes>
  );
};

export default CommunicationsRoutes; 