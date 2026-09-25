import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DownloadableForm, NavigationSubItem } from '../../types';
import {
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Printer,
  Upload,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import {
  printForm,
  downloadEditableForm,
  downloadFormPdf,
} from '../../utils/formDocumentHelper';

export const ManageDownloads: React.FC = () => {
  const {
    siteSettings,
    navigationItems,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    moveSubItem,
    toggleSubItemVisible,
    downloadableForms,
    addDownloadableForm,
    updateDownloadableForm,
    deleteDownloadableForm,
    toggleFormActive,
    admitCardConfig,
    updateAdmitCardConfig,
    setCurrentFrontendPage,
    setViewMode,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'submenus' | 'forms' | 'admit_card'>('forms');
  const [viewingForm, setViewingForm] = useState<DownloadableForm | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Find the 'ডাউনলোড' navigation item
  const downloadNavItem = navigationItems.find(
    (item) => item.id === 'nav-downloads' || item.label === 'ডাউনলোড' || item.url === '#downloads'
  );

  const subItems = downloadNavItem?.subItems ? [...downloadNavItem.subItems].sort((a, b) => a.order - b.order) : [];

  // Modal State for Submenu
  const [submenuModalOpen, setSubmenuModalOpen] = useState(false);
  const [editingSubmenu, setEditingSubmenu] = useState<NavigationSubItem | null>(null);
  const [submenuForm, setSubmenuForm] = useState({
    label: '',
    url: '',
    badge: '',
    description: '',
    iconName: 'FileText',
    order: 0,
    visible: true,
  });

  // Modal State for Downloadable Form
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<DownloadableForm | null>(null);
  const [formFields, setFormFields] = useState({
    title: '',
    category: 'ভর্তি' as 'ভর্তি' | 'ছুটি' | 'প্রশংসাপত্র ও টিসি' | 'অন্যান্য',
    description: '',
    fileSize: '২০০ KB',
    fileType: 'PDF',
    updatedDate: '১৫ সেপ্টেম্বর ২০২৬',
    active: true,
  });

  // Admit Card config local form
  const [admitForm, setAdmitForm] = useState({
    examTerm: admitCardConfig?.examTerm || 'Pre-Test Examination (2026)',
    examYear: admitCardConfig?.examYear || '২০২৬',
    session: admitCardConfig?.session || '২০২৬-২০২৭',
    examStartDate: admitCardConfig?.examStartDate || '২০ অক্টোবর ২০২৬',
    isActive: admitCardConfig?.isActive !== false,
  });

  const [instructionInput, setInstructionInput] = useState('');
  const [instructionsList, setInstructionsList] = useState<string[]>(
    admitCardConfig?.instructions || []
  );

  // Submenu Handlers
  const openAddSubmenu = () => {
    setEditingSubmenu(null);
    setSubmenuForm({
      label: '',
      url: '/important-forms',
      badge: '',
      description: '',
      iconName: 'FileText',
      order: subItems.length,
      visible: true,
    });
    setSubmenuModalOpen(true);
  };

  const openEditSubmenu = (item: NavigationSubItem) => {
    setEditingSubmenu(item);
    setSubmenuForm({
      label: item.label,
      url: item.url,
      badge: item.badge || '',
      description: item.description || '',
      iconName: item.iconName || 'FileText',
      order: item.order,
      visible: item.visible,
    });
    setSubmenuModalOpen(true);
  };

  const handleSubmenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadNavItem) return;
    if (!submenuForm.label.trim()) return;

    if (editingSubmenu) {
      updateSubItem(downloadNavItem.id, editingSubmenu.id, submenuForm);
    } else {
      addSubItem(downloadNavItem.id, submenuForm);
    }
    setSubmenuModalOpen(false);
  };

  // Form Handlers
  const openAddForm = () => {
    setEditingForm(null);
    setFormFields({
      title: '',
      category: 'ভর্তি',
      description: '',
      fileSize: '২০০ KB',
      fileType: 'PDF',
      updatedDate: '১৫ সেপ্টেম্বর ২০২৬',
      active: true,
    });
    setFormModalOpen(true);
  };

  const openEditForm = (item: DownloadableForm) => {
    setEditingForm(item);
    setFormFields({
      title: item.title,
      category: item.category as any,
      description: item.description || '',
      fileSize: item.fileSize || '২০০ KB',
      fileType: item.fileType || 'PDF',
      updatedDate: item.updatedDate || '১৫ সেপ্টেম্বর ২০২৬',
      active: item.active,
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.title.trim()) return;

    if (editingForm) {
      updateDownloadableForm(editingForm.id, formFields);
    } else {
      addDownloadableForm(formFields);
    }
    setFormModalOpen(false);
  };

  // Admit Card Settings Save
  const handleSaveAdmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdmitCardConfig({
      ...admitForm,
      instructions: instructionsList,
    });
    alert('প্রবেশপত্র (Admit Card) কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const addInstruction = () => {
    if (!instructionInput.trim()) return;
    setInstructionsList([...instructionsList, instructionInput.trim()]);
    setInstructionInput('');
  };

  const removeInstruction = (idx: number) => {
    setInstructionsList(instructionsList.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              ডাউনলোড মেনু ও সাবমেনু নিয়ন্ত্রণ
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ওয়েবসাইটের হেডার নেভিগেশনের <strong>ডাউনলোড</strong> মেনু, এর অধীনে থাকা <strong>অ্যাডমিট কার্ড</strong>, <strong>গুরুত্বপূর্ণ ফরমসমূহ</strong> ও অন্যান্য সাবমেনু পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewMode('frontend');
              setCurrentFrontendPage('admit-card');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition border border-emerald-200 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>প্রবেশপত্র ভিউ</span>
          </button>
          <button
            onClick={() => {
              setViewMode('frontend');
              setCurrentFrontendPage('important-forms');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition border border-emerald-200 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ফরমসমূহ ভিউ</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('submenus')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'submenus'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ডাউনলোড সাবমেনুসমূহ ({subItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>গুরুত্বপূর্ণ ফরমসমূহ ({downloadableForms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admit_card')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'admit_card'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>প্রবেশপত্র সেটিংস (Admit Card Config)</span>
        </button>
      </div>

      {/* Tab 1: Submenus Management */}
      {activeTab === 'submenus' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                ডাউনলোড মেনুর ড্রপডাউন সাবমেনু
              </h3>
              <p className="text-xs text-emerald-800">
                ব্যবহারকারী যখন হেডারের "ডাউনলোড" বাটনে মাউস নিবেন বা ক্লিক করবেন, তখন এই সাবমেনুগুলো প্রদর্শিত হবে।
              </p>
            </div>
            <button
              onClick={openAddSubmenu}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সাবমেনু যুক্ত করুন</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4 w-14 text-center">ক্রম</th>
                  <th className="py-3 px-4">সাবমেনুর নাম</th>
                  <th className="py-3 px-4">লিংক / ইউআরএল</th>
                  <th className="py-3 px-4">ব্যাজ / বিবরণ</th>
                  <th className="py-3 px-4 text-center">অবস্থা</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 text-center font-bold text-gray-500 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        {item.url.includes('admit') ? (
                          <CreditCard className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span>{item.label}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-800">
                      {item.url}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {item.badge && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">{item.description}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => downloadNavItem && toggleSubItemVisible(downloadNavItem.id, item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          item.visible
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.visible ? 'সক্রিয়' : 'লুকানো'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={index === 0}
                          onClick={() => downloadNavItem && moveSubItem(downloadNavItem.id, item.id, 'up')}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === subItems.length - 1}
                          onClick={() => downloadNavItem && moveSubItem(downloadNavItem.id, item.id, 'down')}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditSubmenu(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি "${item.label}" সাবমেনুটি মুছে ফেলতে চান?`)) {
                              downloadNavItem && deleteSubItem(downloadNavItem.id, item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 space-y-2">
                      <p className="text-xs">বর্তমানে কোনো ডাউনলোড সাবমেনু যুক্ত নেই।</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (downloadNavItem) {
                            addSubItem(downloadNavItem.id, {
                              label: 'অ্যাডমিট কার্ড',
                              url: '/admit-card',
                              badge: 'Admit Card',
                              description: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড',
                              iconName: 'CreditCard',
                              order: 0,
                              visible: true,
                            });
                            addSubItem(downloadNavItem.id, {
                              label: 'গুরুত্বপূর্ণ ফরমসমূহ',
                              url: '/important-forms',
                              badge: 'Forms',
                              description: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম',
                              iconName: 'FileText',
                              order: 1,
                              visible: true,
                            });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ডিফল্ট সাবমেনুসমূহ (অ্যাডমিট কার্ড ও ফরমসমূহ) তৈরি করুন</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Downloadable Forms Management */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ফরমসমূহ
              </h3>
              <p className="text-xs text-emerald-800">
                নতুন ভর্তি, ছুটি, প্রত্যয়ন ও অন্যান্য অফিসিয়াল ফরম আপলোড বা বিবরণ হালনাগাদ করুন।
              </p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ফরম যোগ করুন</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">ফরমের নাম</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">সাইজ ও ফরম্যাট</th>
                  <th className="py-3 px-4">আপডেট তারিখ</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {downloadableForms.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 text-center font-bold text-gray-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.title}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                      {item.fileType || 'PDF'} ({item.fileSize || '200 KB'})
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-500">
                      {item.updatedDate || '১৫ সেপ্টেম্বর ২০২৬'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFormActive(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          item.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.active ? 'প্রকাশিত' : 'বন্ধ'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি "${item.title}" ফরমটি মুছে ফেলতে চান?`)) {
                              deleteDownloadableForm(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admit Card Settings */}
      {activeTab === 'admit_card' && (
        <form onSubmit={handleSaveAdmitConfig} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                প্রবেশপত্র (Admit Card) কনফিগারেশন
              </h3>
              <p className="text-xs text-gray-500">
                পরীক্ষার নাম, শিক্ষাবর্ষ, তারিখ এবং পরীক্ষার্থীদের জন্য প্রয়োজনীয় নিয়মাবলী নির্ধারণ করুন।
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              অটোমেটিক জেনারেশন সক্রিয়
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">পরীক্ষার নাম (Exam Term) *</label>
              <input
                type="text"
                required
                value={admitForm.examTerm}
                onChange={(e) => setAdmitForm({ ...admitForm, examTerm: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">পরীক্ষার বছর (Year)</label>
              <input
                type="text"
                value={admitForm.examYear}
                onChange={(e) => setAdmitForm({ ...admitForm, examYear: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">সেশন (Session)</label>
              <input
                type="text"
                value={admitForm.session}
                onChange={(e) => setAdmitForm({ ...admitForm, session: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">পরীক্ষা শুরুর আনুমানিক তারিখ</label>
              <input
                type="text"
                value={admitForm.examStartDate}
                onChange={(e) => setAdmitForm({ ...admitForm, examStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={admitForm.isActive}
                  onChange={(e) => setAdmitForm({ ...admitForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>শিক্ষার্থীদের জন্য প্রবেশপত্র ডাউনলোড পোর্টাল উন্মুক্ত রাখুন</span>
              </label>
            </div>
          </div>

          {/* Exam Instructions List */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <label className="block font-bold text-gray-800 text-xs">
              প্রবেশপত্রে প্রদর্শিত বিশেষ নির্দেশাবলী (Candidate Instructions):
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন নির্দেশ লিখুন..."
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInstruction();
                  }
                }}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addInstruction}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                যুক্ত করুন
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {instructionsList.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800 font-mono">{idx + 1}.</span>
                    <span>{inst}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              সংরক্ষণ করুন (Save Settings)
            </button>
          </div>
        </form>
      )}

      {/* Submenu Modal */}
      {submenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingSubmenu ? 'সাবমেনু সম্পাদনা' : 'নতুন সাবমেনু যোগ'}
              </h3>
              <button
                onClick={() => setSubmenuModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmenuSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">সাবমেনুর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অ্যাডমিট কার্ড"
                  value={submenuForm.label}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">লিংক / ইউআরএল *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: /admit-card অথবা /important-forms"
                  value={submenuForm.url}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ব্যাজ টেক্সট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: Admit Card অথবা PDF"
                  value={submenuForm.badge}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  placeholder="যেমন: পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড"
                  value={submenuForm.description}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmenuModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Item Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingForm ? 'ফরম তথ্য সম্পাদনা' : 'নতুন ফরম যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ফরমের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শিক্ষার্থী ছুটির আবেদন ফরম"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={formFields.category}
                  onChange={(e) => setFormFields({ ...formFields, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800"
                >
                  <option value="ভর্তি">ভর্তি</option>
                  <option value="ছুটি">ছুটি</option>
                  <option value="প্রশংসাপত্র ও টিসি">প্রশংসাপত্র ও টিসি</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="ফরমের প্রয়োজনীয় ব্যবহার ও নির্দেশ..."
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ফাইল সাইজ</label>
                  <input
                    type="text"
                    value={formFields.fileSize}
                    onChange={(e) => setFormFields({ ...formFields, fileSize: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ফরম্যাট</label>
                  <input
                    type="text"
                    value={formFields.fileType}
                    onChange={(e) => setFormFields({ ...formFields, fileType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
