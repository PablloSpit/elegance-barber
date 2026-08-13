import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart2, TrendingUp, Scissors, Users, DollarSign } from 'lucide-react';

const GOLD_SHADES = [
    '#d9822b', // color-champagne
    '#f5a34d', // color-champagne-light
    '#b36b24', // color-champagne-dark
    '#8a8a8a', // color-champagne-muted
    '#171717', // color-obsidian-elevated
];

const customTooltipStyle = {
    backgroundColor: '#111111', // obsidian-surface
    border: '1px solid #333333',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontSize: '12px',
};

function dateKey(date) {
    return date.toISOString().split('T')[0];
}

function buildDayBuckets(days) {
    const map = new Map();
    for (let i = days - 1; i >= 0; i--) {
        map.set(dateKey(new Date(Date.now() - i * 86400000)), 0);
    }
    return map;
}

function buildMonthBuckets(months) {
    const map = new Map();
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        map.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
    }
    return map;
}

const Reports = () => {
    const { currentUser } = useAuth();
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(false);
    
    // Mock data for demonstration since we don't have the real DB backend integrated yet
    // In a real scenario, this would come from an API or Supabase
    const apts = useMemo(() => [
        { date: dateKey(new Date()), service_id: '1', barber_id: '1', status: 'completed', extra_amount: 10, services: { name: 'Corte Social', price: 50 }, profiles: { name: 'John Doe', commission_percent: 50 } },
        { date: dateKey(new Date(Date.now() - 86400000)), service_id: '2', barber_id: '2', status: 'completed', extra_amount: 0, services: { name: 'Barba', price: 35 }, profiles: { name: 'Jane Smith', commission_percent: 45 } },
        { date: dateKey(new Date(Date.now() - 172800000)), service_id: '1', barber_id: '1', status: 'completed', extra_amount: 5, services: { name: 'Corte Social', price: 50 }, profiles: { name: 'John Doe', commission_percent: 50 } },
    ], []);

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const { revenueChart, totalRevenue, totalCompleted, serviceRanking, barberRanking, comparisonData } = useMemo(() => {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        let revenueChart = [];
        if (days <= 30) {
            const buckets = buildDayBuckets(days);
            apts.forEach(a => {
                const total = (a.services?.price ?? 0) + (a.extra_amount ?? 0);
                if (buckets.has(a.date)) buckets.set(a.date, (buckets.get(a.date) + total));
            });
            revenueChart = Array.from(buckets.entries()).map(([date, value]) => ({
                label: dayNames[new Date(date + 'T12:00').getDay()],
                value: Math.round(value * 100) / 100,
            }));
        } else {
            const buckets = buildMonthBuckets(3);
            apts.forEach(a => {
                const key = a.date.slice(0, 7);
                const total = (a.services?.price ?? 0) + (a.extra_amount ?? 0);
                if (buckets.has(key)) buckets.set(key, buckets.get(key) + total);
            });
            revenueChart = Array.from(buckets.entries()).map(([key, value]) => ({
                label: shortMonths[parseInt(key.slice(5, 7)) - 1],
                value: Math.round(value * 100) / 100,
            }));
        }

        const totalRevenue = apts.reduce((s, a) => s + (a.services?.price ?? 0) + (a.extra_amount ?? 0), 0);
        const totalCompleted = apts.length;

        const svcMap = new Map();
        apts.forEach(a => {
            const name = a.services?.name ?? 'Desconhecido';
            const price = (a.services?.price ?? 0) + (a.extra_amount ?? 0);
            const prev = svcMap.get(name) ?? { name, count: 0, revenue: 0 };
            svcMap.set(name, { name, count: prev.count + 1, revenue: prev.revenue + price });
        });
        const serviceRanking = Array.from(svcMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const barberMap = new Map();
        apts.forEach(a => {
            const name = a.profiles?.name ?? 'Desconhecido';
            const price = (a.services?.price ?? 0) + (a.extra_amount ?? 0);
            const prev = barberMap.get(name) ?? { name, count: 0, revenue: 0 };
            barberMap.set(name, { name, count: prev.count + 1, revenue: prev.revenue + price });
        });
        const barberRanking = Array.from(barberMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const now = new Date();
        const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        let thisMRev = 0, prevMRev = 0, thisMCnt = 0, prevMCnt = 0;
        apts.forEach(a => {
            const key = a.date.slice(0, 7);
            const total = (a.services?.price ?? 0) + (a.extra_amount ?? 0);
            if (key === thisMonthKey) { thisMRev += total; thisMCnt++; }
            if (key === prevMonthKey) { prevMRev += total; prevMCnt++; }
        });
        const comparisonData = [
            { label: shortMonths[prevDate.getMonth()], receita: Math.round(prevMRev), atendimentos: prevMCnt },
            { label: shortMonths[now.getMonth()], receita: Math.round(thisMRev), atendimentos: thisMCnt },
        ];

        return { revenueChart, totalRevenue, totalCompleted, serviceRanking, barberRanking, comparisonData };
    }, [apts, period]);

    const avgTicket = totalCompleted > 0 ? totalRevenue / totalCompleted : 0;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <BarChart2 className="h-6 w-6 text-champberry" />
                        Relatórios <span className="text-champberry">Financeiros</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Analise o desempenho da sua barbearia</p>
                </div>
                <Tabs value={period} onValueChange={v => setPeriod(v)}>
                    <TabsList className="bg-obsidian-surface border border-white/5">
                        <TabsTrigger value="7d" className="data-[state=active]:bg-champberry data-[state=active]:text-white">7 dias</TabsTrigger>
                        <TabsTrigger value="30d" className="data-[state=active]:bg-champberry data-[state=active]:text-white">30 dias</TabsTrigger>
                        <TabsTrigger value="90d" className="data-[state=active]:bg-champberry data-[state=active]:text-white">90 dias</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-champberry' },
                    { label: 'Atendimentos', value: totalCompleted, icon: Scissors, color: 'text-champberry' },
                    { label: 'Ticket Médio', value: formatCurrency(avgTicket), icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Serviços Únicos', value: serviceRanking.length, icon: Users, color: 'text-gray-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`h-4 w-4 ${color}`} />
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</span>
                            </div>
                            <p className="text-xl font-black text-white truncate">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Receita ao Longo do Tempo</CardTitle>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Valores em {period === '90d' ? 'Meses' : 'Dias'}</p>
                </CardHeader>
                <CardContent>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueChart} barSize={period === '7d' ? 32 : 16}>
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#777777', fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={customTooltipStyle}
                                    formatter={(v) => [formatCurrency(v), 'Receita']}
                                />
                                <Bar dataKey="value" fill="#d9822b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-champberry" /> Top Serviços
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {serviceRanking.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">Sem dados disponíveis</p>
                        ) : (
                            <div className="space-y-3">
                                {serviceRanking.map((s, i) => {
                                    const maxRev = serviceRanking[0].revenue;
                                    const pct = maxRev > 0 ? (s.revenue / maxRev) * 100 : 0;
                                    return (
                                        <div key={s.name}>
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="font-bold text-white uppercase truncate max-w-[60%]">{i + 1}. {s.name}</span>
                                                <span className="text-gray-400">{s.count}× · {formatCurrency(s.revenue)}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-white/5">
                                                <div className="h-full rounded-full bg-champberry transition-all" style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Users className="h-4 w-4 text-champberry" /> Ranking de Equipe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {barberRanking.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">Sem dados disponíveis</p>
                        ) : (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={barberRanking} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                            {barberRanking.map((_, i) => <Cell key={i} fill={GOLD_SHADES[i % GOLD_SHADES.length]} />)}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={customTooltipStyle}
                                            formatter={(v, _, entry) => [
                                                `${formatCurrency(v)} · ${entry.payload.count} atendimentos`,
                                                entry.payload.name,
                                            ]}
                                        />
                                        <Legend formatter={(value) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-champberry" /> Comparação Mensal
                    </CardTitle>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Mês atual vs Anterior</p>
                </CardHeader>
                <CardContent>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} barGap={8} barCategoryGap="40%">
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#777777', fontSize: 12 }} />
                                <YAxis yAxisId="left" hide />
                                <YAxis yAxisId="right" orientation="right" hide />
                                <Tooltip
                                    contentStyle={customTooltipStyle}
                                    formatter={(v, name) => [
                                        name === 'receita' ? formatCurrency(v) : `${v} atendimentos`,
                                        name === 'receita' ? 'Receita' : 'Atendimentos',
                                    ]}
                                />
                                <Legend formatter={(v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{v === 'receita' ? 'Receita' : 'Atendimentos'}</span>} />
                                <Bar yAxisId="left" dataKey="receita" fill="#d9822b" radius={[4, 4, 0, 0]} name="receita" />
                                <Bar yAxisId="right" dataKey="atendimentos" fill="#b36b24" radius={[4, 4, 0, 0]} name="atendimentos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reports;
