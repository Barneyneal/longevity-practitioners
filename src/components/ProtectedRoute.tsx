import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useQuizStore from '../store';
import LoadingDots from './LoadingDots';

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useQuizStore();
  const isLoading = firebaseUser === null; // Still loading if firebaseUser is null on initial check

  if (isLoading) {
    // You can replace this with a more sophisticated loading spinner
    return (
      <div className="flex-grow flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!firebaseUser) {
    // If not loading and no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If there's a user, render the children or the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
