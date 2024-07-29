import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { database } from '../../data/database'; // Ensure this path is correct

const Dashboard = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterSales, setFilterSales] = useState('top10');
  const [storeName, setStoreName] = useState('all');
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let storeSales = database.map(store => {
      const productSales = store.products
        .filter(product => filterType === 'all' || product.productName.toLowerCase() === filterType)
        .reduce((sum, product) => sum + product.salesQuantity, 0);
      
      return {
        storeId: store.storeId,
        storeName: store.storeName,
        totalSales: productSales,
        products: store.products
      };
    });

    // Apply sales filter and sorting
    if (filterSales.startsWith('top') || filterSales.startsWith('bottom')) {
      const number = parseInt(filterSales.replace('top', '').replace('bottom', ''));
      storeSales = filterSales.startsWith('top')
        ? storeSales.sort((a, b) => b.totalSales - a.totalSales).slice(0, number) 
        : storeSales.sort((a, b) => a.totalSales - b.totalSales).slice(0, number); 
    }

    setTableData(storeSales);

    // Prepare data for PieChart based on selected filterType
    const productSales = database
      .map(store => {
        const product = store.products.find(p => p.productName.toLowerCase() === filterType);
        return {
          name: store.storeName,
          value: product ? product.salesQuantity : 0
        };
      })
      .filter(data => data.value > 0);

    setChartData(productSales);
  }, [filterType, filterSales, storeName]);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'burger', label: 'Burger' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'french fries', label: 'French Fries' },
    { value: 'cold drink', label: 'Cold Drink' },
    { value: 'garlic bread', label: 'Garlic Bread' }
  ];

  const salesOptions = [
    { value: 'top5', label: 'Top 5 Sales' },
    { value: 'top10', label: 'Top 10 Sales' },
  
    { value: 'bottom5', label: 'Bottom 5 Sales' },
    { value: 'bottom10', label: 'Bottom 10 Sales' },
   
  ];

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  return (
    <div className="flex bg-gray-100 h-auto justify-around">
      <div className="w-3/5 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Performance Report</h1>
        
        <div className="flex mb-6 space-x-4">
          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700">Filter by Product</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={e => setFilterType(e.target.value)} 
              value={filterType}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700">Filter by Sales</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={e => setFilterSales(e.target.value)} 
              value={filterSales}
            >
              {salesOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Store ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Store Name</th>
                {filterType !== 'all' && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Product Name</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Sales</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.storeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.storeName}</td>
                  {filterType !== 'all' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{filterType}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.totalSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-[45%] p-6 bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Sales Chart</h2>
        <BarChart width={450} height={300} data={tableData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="storeName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSales" fill="#1d006e" />
        </BarChart>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Sales Distribution</h2>
        <PieChart width={300} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
};

export default Dashboard;
