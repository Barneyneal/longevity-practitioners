import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useQuizStore from '../store';

const ProtectedRoute: React.FC = () => {
  const { authToken } = useQuizStore();

  return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
