import React from 'react';
import { Outlet } from 'react-router-dom';

const LessonLayout: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default LessonLayout;
