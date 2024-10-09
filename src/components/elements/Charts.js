import React, { useEffect, useRef, useContext } from 'react';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, ArcElement, Tooltip, PieController, Legend, DoughnutController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ThemeContext } from '../contexts/Theme.js'; 

const BarComponent = ({ data, label, symbol = "" }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    Chart.register(CategoryScale, LinearScale, BarController, BarElement, Tooltip);

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      // Если у нас уже есть экземпляр графика, удаляем его перед созданием нового
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: label,
            data: data.map((item) => item.amount),
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--color-links"),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "category",
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value + symbol;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                var value = context.parsed.y;
                return `${label}: ${value.toLocaleString()}${symbol}`;
              },
            },
          },
        },
      },
    });
  }, [data, label, symbol]);

  return <canvas ref={chartRef} style={{ width: "100%", maxHeight: "18rem"}} />;
};

const DoughnutComponent = ({ data }) => {
    const totalValue = data.reduce((total, item) => total + item.value, 0);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        Chart.register(ArcElement, Tooltip, DoughnutController);

        const ctx = chartRef.current.getContext('2d');


        if (!chartInstanceRef.current) {
            chartInstanceRef.current = new Chart(ctx, {
                plugins: [ChartDataLabels, Legend, {
                    beforeDraw: function () {
                        const chart = chartInstanceRef.current;
                        var width = chartInstanceRef.current.width,
                            height = chartInstanceRef.current.height - chartInstanceRef.current.legend.height - 11,
                            ctx = chartInstanceRef.current.ctx;
                        ctx.restore();
                        var fontSize = (height / 150).toFixed(2);
                        ctx.font = `bold ${fontSize}rem sans-serif`;
                        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
                        ctx.textBaseline = "top";
                        var text = totalValue,
                            textX = Math.round((width - ctx.measureText(text).width) / 2),
                            textY = height / 2;
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                    }
                }],
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.label),
                    datasets: [
                        {
                            data: data.map(item => item.value),
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.8)",
                                "rgba(54, 162, 235, 0.8)",
                                "rgba(255, 206, 86, 0.8)",
                                "rgba(75, 192, 192, 0.8)",
                                "rgba(153, 102, 255, 0.8)",
                                "rgba(52, 255, 228, 0.8)",
                                "rgba(255, 131, 48, 0.8)",
                                "rgba(0, 255, 106, 0.8)",
                                "rgba(255, 62, 62, 0.8)",
                            ],
                            borderColor: 'transparent',
                        },
                    ],
                },
                options: {
                    cutout: "55%",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {

                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function (context) {
                                    var value = data.map(item => item.value)[context.dataIndex];
                                    const percent = data.map(item => item.percent)[context.dataIndex];
                                    return [`Пользователи: ${value.toLocaleString()}`, `Процент: ${percent.toFixed(2)}%`];
                                }
                            }
                        },
                        datalabels: {
                            formatter: (value, ctx) => {
                                const percent = ctx.chart.data.datasets[0].data[ctx.dataIndex] / ctx.chart.data.datasets[0].data.reduce((a, b) => a + b) * 100;

                                if (percent > 5) {
                                    return `${percent.toFixed(0)}%`;
                                }
                                else {
                                    return "";
                                }
                            },
                            color: '#fff',
                            font: {
                                size: '17',
                                weight: 600
                            }
                        },
                        legend: {
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rectRounded',
                                font: {
                                    weight: 800
                                },
                                color: getComputedStyle(document.documentElement).getPropertyValue('--color-hr'),
                            },
                            display: true,
                            position: 'bottom',
                        },
                    },
                },
            });
        }
    }, [data]);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.update();
        }
    }, [theme]);

    return (
        <div style={{
            height: "20rem",
            position: "relative"
        }}>
            <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
        </div>

    );
};

export { BarComponent, DoughnutComponent };
