import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import ComponentCard from '../../components/ComponentCard';
import ProjectTables from '../../components/dashboard/extraDashboard/ProjectTable';

Chart.register(...registerables);

const BasicTable = () => {
  const [chartData, setChartData] = useState({
    free: 0,
    premium: 0,
    total: 0
  });

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/users/admin/user/role-counts`
        );
        setChartData(response.data.data);
      } catch (error) {
        console.error('Error fetching role data:', error);
      }
    };

    fetchRoleData();
  }, []);

  const pieData = {
    labels: ['Free Users', 'Premium Users'],
    datasets: [
      {
        data: [chartData.free, chartData.premium],
        backgroundColor: ['#2dce89', '#5e72e4'],
        hoverBackgroundColor: ['#24a46d', '#4b5cb7'],
      },
    ],
  };

  return (
    <>
      <ComponentCard title="Pie Chart">
        <div className="chart-wrapper" style={{ width: '100%', margin: '0 auto', height: 350 }}>
          <h4>User Distribution ({chartData.total} Total Users)</h4>
          <Pie
            data={pieData}
            options={{
              maintainAspectRatio: false,
              legend: {
                display: true,
                labels: {
                  fontFamily: 'Nunito Sans, sans-sarif',
                  fontColor: '#8898aa',
                },
              },
            }}
          />
        </div>
      </ComponentCard>
      {/*--------------------------------------------------------------------------------*/}
      {/* Start Inner Div*/}
      {/*--------------------------------------------------------------------------------*/}
      <ComponentCard
        title="User Listing"
        subtitle={
          <p>
            Overview of the users
          </p>
        }
      >
        <ProjectTables />
      </ComponentCard>
    </>
  );
};

export default BasicTable;
