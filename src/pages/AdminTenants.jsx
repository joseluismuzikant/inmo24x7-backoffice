import React, { useState, useEffect } from 'react';

const AdminTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/admin/tenants');
      const data = await response.json();
      setTenants(data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tenants', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(tenant => (
            <tr key={tenant.id}>
              <td>{tenant.name}</td>
              <td>{tenant.slug}</td>
              <td>
                <button className="text-blue-600">Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTenants;
