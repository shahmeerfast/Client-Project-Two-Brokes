import React, { useState } from 'react';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Charts = () => {
    const [chartData, setChartData] = useState({
        salesByDate: [
            { _id: '2024-12-01', totalSales: 100 },
            { _id: '2024-12-02', totalSales: 150 },
            { _id: '2024-12-03', totalSales: 200 },
            { _id: '2024-12-04', totalSales: 250 },
            { _id: '2024-12-05', totalSales: 300 },
        ],
        statusCounts: [
            { _id: 'Completed', count: 10 },
            { _id: 'Pending', count: 5 },
            { _id: 'Cancelled', count: 2 },
        ],
        categoryDistribution: [
            { _id: 'Men', count: 15 },
            { _id: 'Women', count: 8 },
            { _id: 'Kids', count: 5 },
        ],
    });

    // Line Chart Data
    const lineChartData = {
        labels: chartData.salesByDate.map((data) => data._id),
        datasets: [
            {
                label: 'Sales Over Time',
                data: chartData.salesByDate.map((data) => data.totalSales),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    // Pie Chart Data (Order Status)
    const pieChartData = {
        labels: chartData.statusCounts.map((status) => status._id),
        datasets: [
            {
                data: chartData.statusCounts.map((status) => status.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    // Bar Chart Data (Sales Comparison)
    const barChartData = {
        labels: chartData.salesByDate.map((data) => data._id),
        datasets: [
            {
                label: 'Sales Comparison',
                data: chartData.salesByDate.map((data) => data.totalSales),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    // Doughnut Chart Data (Category Distribution)
    const doughnutChartData = {
        labels: chartData.categoryDistribution.map((category) => category._id),
        datasets: [
            {
                data: chartData.categoryDistribution.map((category) => category.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    return (
        <div>
            <h1>Admin Dashboard - Charts</h1>

            {/* Line Chart */}
            <div style={{ width: '600px', height: '400px', margin: '20px auto' }}>
                <h3>Sales Over Time (Line Chart)</h3>
                <Line data={lineChartData} options={{
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Total Sales',
                            },
                        },
                    }
                }} />
            </div>

            {/* Pie Chart */}
            <div style={{ width: '400px', height: '400px', margin: '20px auto' }}>
                <h3>Order Status Distribution (Pie Chart)</h3>
                <Pie data={pieChartData} />
            </div>

            {/* Bar Chart */}
            <div style={{ width: '600px', height: '400px', margin: '20px auto' }}>
                <h3>Sales Comparison (Bar Chart)</h3>
                <Bar data={barChartData} options={{
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Total Sales',
                            },
                        },
                    }
                }} />
            </div>

            {/* Doughnut Chart */}
            <div style={{ width: '400px', height: '400px', margin: '20px auto' }}>
                <h3>Category Distribution (Doughnut Chart)</h3>
                <Doughnut data={doughnutChartData} />
            </div>
        </div>
    );
};

export default Charts;
