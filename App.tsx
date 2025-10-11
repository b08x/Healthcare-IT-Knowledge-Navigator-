
import React, { useState } from 'react';
import { Role } from './types';
import RoleSelector from './components/RoleSelector';
import Dashboard from './components/Dashboard';

const App = () => {
  const [role, setRole] = useState<Role | null>(null);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const handleBackToSelection = () => {
    setRole(null);
  };

  return (
    <div className="min-h-screen font-sans">
      {role ? (
        <Dashboard role={role} onBack={handleBackToSelection} />
      ) : (
        <RoleSelector onSelectRole={handleRoleSelect} />
      )}
    </div>
  );
};

export default App;
