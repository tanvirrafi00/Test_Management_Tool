import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { Card } from '../ui/Card';

export const TestCaseStatusChart = ({ data }) => {
    const chartData = [
        { name: 'Pass', value: data?.pass || 0, color: '#10b981' },
        { name: 'Fail', value: data?.fail || 0, color: '#ef4444' },
        { name: 'Blocked', value: data?.blocked || 0, color: '#f59e0b' },
        { name: 'Not Run', value: data?.notRun || 0, color: '#e2e8f0' },
        { name: 'Retest', value: data?.retest || 0, color: '#8b5cf6' },
    ].filter(item => item.value > 0);

    return (
        <Card className="p-6 h-[320px] lg:h-[380px] flex flex-col bg-white rounded-2xl border-gray-100 shadow-none overflow-hidden">
            <div className="flex items-center mb-6">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Execution Status
                </h3>
            </div>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius="60%"
                            outerRadius="85%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '8px' }}
                            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={30}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export const DefectSeverityChart = ({ data }) => {
    const chartData = [
        { name: 'Crit', count: data?.critical || 0, fill: '#ef4444' },
        { name: 'High', count: data?.high || 0, fill: '#f97316' },
        { name: 'Med', count: data?.medium || 0, fill: '#f59e0b' },
        { name: 'Low', count: data?.low || 0, fill: '#10b981' },
    ];

    const hasData = chartData.some(d => d.count > 0);
    const displayData = hasData ? chartData : [
        { name: 'Crit', count: 2, fill: '#ef4444' },
        { name: 'High', count: 5, fill: '#f97316' },
        { name: 'Med', count: 8, fill: '#f59e0b' },
        { name: 'Low', count: 4, fill: '#10b981' },
    ];

    return (
        <Card className="p-6 h-[320px] lg:h-[380px] flex flex-col bg-white rounded-2xl border-gray-100 shadow-none overflow-hidden">
            <div className="flex items-center mb-6 justify-between">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Severity Impact
                </h3>
                {!hasData && <span className="text-[8px] font-black text-gray-300 uppercase">Preview</span>}
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 'bold' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#cbd5e1', fontSize: 10 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc', radius: 4 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '8px' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
