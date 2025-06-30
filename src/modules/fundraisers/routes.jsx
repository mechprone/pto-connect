import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FundraiserManager from './pages/FundraiserManager';
import FundraiserForm from './pages/FundraiserForm';
import RequireAuth from '../../components/auth/RequireAuth';

const FundraiserRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <FundraiserManager />
          </RequireAuth>
        }
      />
      <Route
        path="/new"
        element={
          <RequireAuth>
            <FundraiserForm />
          </RequireAuth>
        }
      />
      <Route
        path="/:id/edit"
        element={
          <RequireAuth>
            <FundraiserForm />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default FundraiserRoutes; 