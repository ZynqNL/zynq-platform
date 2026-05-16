'use client';

import { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { Upload, Download, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Employee = Record<string, unknown>;

export default function EmployerEmployeesClient({
  initialEmployees,
  companyId,
}: {
  initialEmployees: Employee[];
  companyId: string;
}) {
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', fte_score: '1.0' });

  const filtered = employees.filter((emp) => {
    const name = (emp.name as string)?.toLowerCase() ?? '';
    const email = (emp.email as string)?.toLowerCase() ?? '';
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    const preview = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });

    setCsvPreview(preview);
  };

  const importCsv = async () => {
    if (!csvPreview) return;
    setUploading(true);

    const rows = csvPreview
      .filter((row) => row.email && row.name)
      .map((row) => ({
        company_id: companyId,
        email: row.email,
        name: row.name,
        fte_score: parseFloat(row.fte_score ?? '1.0') || 1.0,
        status: row.status === 'inactive' ? 'inactive' : 'active',
        locale: row.locale ?? locale,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('employees').insert(rows);
      if (!error) {
        const { data } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', companyId)
          .order('name');
        if (data) setEmployees(data as Employee[]);
        setCsvPreview(null);
      }
    }

    setUploading(false);
  };

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) return;

    const { error } = await supabase.from('employees').insert({
      company_id: companyId,
      name: newEmployee.name,
      email: newEmployee.email,
      fte_score: parseFloat(newEmployee.fte_score) || 1.0,
      status: 'active',
      locale,
    });

    if (!error) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      if (data) setEmployees(data as Employee[]);
      setShowAddModal(false);
      setNewEmployee({ name: '', email: '', fte_score: '1.0' });
    }
  };

  const updateFte = async (id: string, fte: number) => {
    const clamped = Math.max(0, Math.min(1, fte));
    await supabase.from('employees').update({ fte_score: clamped }).eq('id', id);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, fte_score: clamped } : emp))
    );
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('employees').update({ status }).eq('id', id);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status } : emp))
    );
  };

  const downloadTemplate = () => {
    const csv = 'name,email,fte_score,status,locale\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-3xl text-zynq-green">Werknemers</h1>
          <p className="text-zynq-muted font-sans mt-1">
            FTE scores, status en import
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="font-sans">
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="font-sans">
            <Upload className="w-4 h-4 mr-2" />
            CSV Import
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="font-sans bg-zynq-green hover:bg-zynq-deep">
            <Plus className="w-4 h-4 mr-2" />
            Toevoegen
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCsvUpload}
      />

      {/* CSV Preview Modal */}
      {csvPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-lg text-zynq-dark">
              CSV Voorbeeld ({csvPreview.length} rijen)
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCsvPreview(null)} className="font-sans">
                <X className="w-4 h-4 mr-1" />
                Annuleren
              </Button>
              <Button
                onClick={importCsv}
                disabled={uploading}
                className="font-sans bg-zynq-green hover:bg-zynq-deep"
              >
                {uploading ? 'Importeren...' : `${csvPreview.length} Importeren`}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-zynq-mid/20">
                  <th className="text-left p-2 text-zynq-muted">Naam</th>
                  <th className="text-left p-2 text-zynq-muted">E-mail</th>
                  <th className="text-left p-2 text-zynq-muted">FTE</th>
                  <th className="text-left p-2 text-zynq-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-zynq-mid/10">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.fte_score ?? '1.0'}</td>
                    <td className="p-2">{row.status ?? 'active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvPreview.length > 5 && (
              <p className="text-zynq-muted text-xs mt-2">
                ...en {csvPreview.length - 5} meer
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans font-semibold text-lg text-zynq-dark">
                Werknemer Toevoegen
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-zynq-muted hover:text-zynq-dark">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  Naam
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans"
                  placeholder="Jan de Vries"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans"
                  placeholder="jan@bedrijf.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  FTE Score (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newEmployee.fte_score}
                  onChange={(e) => setNewEmployee((prev) => ({ ...prev, fte_score: e.target.value }))}
                  className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 font-sans">
                  Annuleren
                </Button>
                <Button onClick={addEmployee} className="flex-1 font-sans bg-zynq-green hover:bg-zynq-deep">
                  Toevoegen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zynq-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of e-mail..."
          className="w-full pl-10 pr-4 py-2 border border-zynq-mid/50 rounded font-sans"
        />
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-zynq-mid/20 bg-zynq-pale/50">
                <th className="text-left p-4 text-zynq-muted font-medium">Naam</th>
                <th className="text-left p-4 text-zynq-muted font-medium">E-mail</th>
                <th className="text-left p-4 text-zynq-muted font-medium">FTE</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zynq-mid/10">
              {filtered.map((emp) => (
                <tr key={emp.id as string} className="hover:bg-zynq-pale/30">
                  <td className="p-4 font-medium text-zynq-dark">
                    {emp.name as string}
                  </td>
                  <td className="p-4 text-zynq-muted">
                    {emp.email as string}
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={emp.fte_score as number}
                      onChange={(e) => updateFte(emp.id as string, parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border border-zynq-mid/50 rounded font-sans text-center"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      value={emp.status as string}
                      onChange={(e) => updateStatus(emp.id as string, e.target.value)}
                      className={`px-2 py-1 rounded font-sans text-xs ${
                        emp.status === 'active'
                          ? 'bg-zynq-pale text-zynq-green border border-zynq-green/30'
                          : emp.status === 'inactive'
                          ? 'bg-zynq-amber/10 text-zynq-amber border border-zynq-amber/30'
                          : 'bg-zynq-red/10 text-zynq-red border border-zynq-red/30'
                      }`}
                    >
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                      <option value="departed">Vertrokken</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-zynq-muted font-sans">
            Geen werknemers gevonden
          </div>
        )}
      </div>
    </div>
  );
}
