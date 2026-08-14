import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Plus, Package, TrendingDown, AlertTriangle, ArrowUpDown, Trash2, Edit2, Check, X } from 'lucide-react';

const Inventory = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [products, setProducts] = useState(() => {
        const stored = localStorage.getItem('inventory_products');
        return stored ? JSON.parse(stored) : [
            { id: '1', name: 'Pomada Efeito Matte 80g', stock: 15, min_stock: 5, cost_price: 25, sale_price: 45, category: 'Finalizadores' },
            { id: '2', name: 'Óleo de Barba 30ml', stock: 8, min_stock: 3, cost_price: 30, sale_price: 55, category: 'Cuidados' },
            { id: '3', name: 'Shampoo Mentolado 250ml', stock: 2, min_stock: 5, cost_price: 18, sale_price: 35, category: 'Higiene' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('inventory_products', JSON.stringify(products));
    }, [products]);


    const [newProduct, setNewProduct] = useState({ name: '', stock: 0, min_stock: 0, cost_price: 0, sale_price: 0, category: '' });

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const stats = useMemo(() => {
        const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
        const lowStock = products.filter(p => p.stock <= p.min_stock).length;
        const totalValue = products.reduce((acc, p) => acc + (p.stock * p.cost_price), 0);
        const projectedProfit = products.reduce((acc, p) => acc + (p.stock * (p.sale_price - p.cost_price)), 0);
        return { totalItems, lowStock, totalValue, projectedProfit };
    }, [products]);

    const handleAdd = () => {
        if (!newProduct.name) return;
        setProducts([...products, { ...newProduct, id: Date.now().toString() }]);
        setNewProduct({ name: '', stock: 0, min_stock: 0, cost_price: 0, sale_price: 0, category: '' });
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Package className="h-6 w-6 text-champberry" />
                        {t('inventory.title', 'Controle de Estoque').split(' ')[0]} <span className="text-champberry">{t('inventory.title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">{t('inventory.subtitle')}</p>
                </div>
                <Button 
                    onClick={() => setIsAdding(true)}
                    className="bg-champberry hover:bg-champberry-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-5 shadow-lg shadow-champberry/20 transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t('inventory.new_product')}
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: t('inventory.total_items'), value: stats.totalItems, icon: Package, color: 'text-champberry' },
                    { label: t('inventory.low_stock'), value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? 'text-amber-500' : 'text-gray-500' },
                    { label: t('inventory.cost_value'), value: formatCurrency(stats.totalValue), icon: ArrowUpDown, color: 'text-gray-400' },
                    { label: t('inventory.projected_profit'), value: formatCurrency(stats.projectedProfit), icon: TrendingDown, color: 'text-emerald-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-4 text-center sm:text-left">
                            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                                <Icon className={`h-4 w-4 ${color}`} />
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</span>
                            </div>
                            <p className="text-xl font-black text-white truncate">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-2 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">{t('inventory.catalog')}</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder={t('common.search')} 
                                className="pl-9 bg-obsidian-elevated border-white/5 text-white placeholder:text-gray-700 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black uppercase text-champberry tracking-widest">
                                    <th className="px-6 py-4">{t('inventory.product')}</th>
                                    <th className="px-4 py-4">{t('inventory.category')}</th>
                                    <th className="px-4 py-4 text-center">{t('inventory.quantity')}</th>
                                    <th className="px-4 py-4">Custo</th>
                                    <th className="px-4 py-4">Venda</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isAdding && (
                                    <tr className="bg-champberry/5 animate-pulse">
                                        <td className="px-6 py-3"><Input placeholder="Nome" className="bg-transparent border-white/10 text-xs h-8" onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></td>
                                        <td className="px-4 py-3"><Input placeholder="Categoria" className="bg-transparent border-white/10 text-xs h-8" onChange={e => setNewProduct({...newProduct, category: e.target.value})} /></td>
                                        <td className="px-4 py-3"><Input type="number" className="bg-transparent border-white/10 text-xs h-8 w-16 mx-auto" onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} /></td>
                                        <td className="px-4 py-3"><Input type="number" className="bg-transparent border-white/10 text-xs h-8 w-20" onChange={e => setNewProduct({...newProduct, cost_price: parseFloat(e.target.value)})} /></td>
                                        <td className="px-4 py-3"><Input type="number" className="bg-transparent border-white/10 text-xs h-8 w-20" onChange={e => setNewProduct({...newProduct, sale_price: parseFloat(e.target.value)})} /></td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10" onClick={handleAdd}><Check size={16}/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => setIsAdding(false)}><X size={16}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">{p.name}</span>
                                                <span className="text-[10px] text-gray-500">ID: {p.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase">{p.category}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={`flex flex-col items-center`}>
                                                <span className={`text-sm font-bold ${p.stock <= p.min_stock ? 'text-amber-500' : 'text-white'}`}>{p.stock}</span>
                                                <span className="text-[9px] text-gray-600 uppercase">Min: {p.min_stock}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-400">{formatCurrency(p.cost_price)}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-champberry">{formatCurrency(p.sale_price)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-white/5"><Edit2 size={14}/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && !isAdding && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-gray-600 text-xs uppercase font-bold tracking-widest">
                                            {t('inventory.no_products')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Inventory;
