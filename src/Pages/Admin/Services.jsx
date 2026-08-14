import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Plus, Scissors, Trash2, Edit2, Check, X } from 'lucide-react';

const Services = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [services, setServices] = useState(() => {
        const stored = localStorage.getItem('barber_services');
        return stored ? JSON.parse(stored) : [
            { id: '1', name: 'Corte de Cabelo', price: 30, duration: 45, category: 'Cabelo' },
            { id: '2', name: 'Aparo de Barba', price: 15, duration: 20, category: 'Barba' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('barber_services', JSON.stringify(services));
    }, [services]);

    const [newService, setNewService] = useState({ name: '', price: 0, duration: 30, category: '' });

    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        if (!newService.name) return;
        setServices([...services, { ...newService, id: Date.now().toString() }]);
        setNewService({ name: '', price: 0, duration: 30, category: '' });
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setServices(services.filter(s => s.id !== id));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Scissors className="h-6 w-6 text-champberry" />
                        {t('admin.management', 'Gestão')} de <span className="text-champberry">{t('nav.services', 'Serviços')}</span>
                    </h1>
                </div>
                <Button 
                    onClick={() => setIsAdding(true)}
                    className="bg-champberry hover:bg-champberry-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-5 shadow-lg shadow-champberry/20 transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t('admin.new_service', 'Novo Serviço')}
                </Button>
            </div>

            <Card className="bg-obsidian-surface/50 border border-white/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-2 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">{t('admin.catalog_services', 'Catálogo de Serviços')}</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder={t('common.search', 'Buscar...')} 
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
                                    <th className="px-6 py-4">{t('admin.service_name', 'Serviço')}</th>
                                    <th className="px-4 py-4">{t('inventory.category', 'Categoria')}</th>
                                    <th className="px-4 py-4 text-center">{t('admin.duration_min', 'Duração (min)')}</th>
                                    <th className="px-4 py-4">{t('inventory.sale', 'Preço')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions', 'Ações')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isAdding && (
                                    <tr className="bg-champberry/5 animate-pulse">
                                        <td className="px-6 py-3"><Input placeholder={t('admin.full_name', 'Nome')} className="bg-transparent border-white/10 text-xs h-8" onChange={e => setNewService({...newService, name: e.target.value})} /></td>
                                        <td className="px-4 py-3"><Input placeholder={t('inventory.category', 'Cat')} className="bg-transparent border-white/10 text-xs h-8" onChange={e => setNewService({...newService, category: e.target.value})} /></td>
                                        <td className="px-4 py-3"><Input type="number" className="bg-transparent border-white/10 text-xs h-8 w-16 mx-auto" onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} /></td>
                                        <td className="px-4 py-3"><Input type="number" className="bg-transparent border-white/10 text-xs h-8 w-20" onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} /></td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10" onClick={handleAdd}><Check size={16}/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => setIsAdding(false)}><X size={16}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredServices.map((s) => (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-bold text-white uppercase">{t(`services.items.${s.name}`, s.name)}</td>
                                        <td className="px-4 py-4"><span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase">{t(`services.categories.${s.category}`, s.category)}</span></td>
                                        <td className="px-4 py-4 text-center text-sm text-gray-400">{s.duration} min</td>
                                        <td className="px-4 py-4 text-sm font-bold text-champberry">{formatCurrency(s.price)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-white/5" title={t('common.edit')}><Edit2 size={14}/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(s.id)} title={t('common.delete')}><Trash2 size={14}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Services;
