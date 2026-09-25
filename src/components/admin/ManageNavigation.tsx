import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NavigationItem, NavigationSubItem } from '../../types';
import {
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
  RotateCcw,
  Compass,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Download,
  FolderPlus,
  ExternalLink,
} from 'lucide-react';

export const ManageNavigation: React.FC = () => {
  const {
    navigationItems,
    addNavigationItem,
    updateNavigationItem,
    deleteNavigationItem,
    toggleNavigationItemVisible,
    moveNavigationItem,
    resetNavigationItems,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    moveSubItem,
    toggleSubItemVisible,
    setAdminTab,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);

  // Submenu management states
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    'nav-downloads': true, // Auto-expand downloads menu so submenus are visible immediately
  });

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [submenuModalOpen, setSubmenuModalOpen] = useState(false);
  const [selectedParentItem, setSelectedParentItem] = useState<NavigationItem | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<NavigationSubItem | null>(null);

  const [submenuForm, setSubmenuForm] = useState({
    label: '',
    url: '',
    badge: '',
    description: '',
    iconName: 'FileText',
    order: 0,
    visible: true,
  });

  const [form, setForm] = useState({
    label: '',
    url: '',
    iconName: '—',
    order: 0,
    visible: true,
  });

  // Sorted items by their order
  const sortedItems = [...navigationItems].sort((a, b) => a.order - b.order);

  // Filtered by search query if any
  const filteredItems = sortedItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subItems?.some(
        (sub) =>
          sub.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Visible items for live preview
  const visiblePreviewItems = sortedItems.filter(
    (item) =>
      item.visible &&
      item.url !== '#teachers' &&
      item.url !== '#staff' &&
      item.label !== 'শিক্ষক' &&
      !item.label.includes('কর্মচারী')
  );

  // Check if Download menu exists
  const downloadNavItem = navigationItems.find(
    (item) => item.id === 'nav-downloads' || item.label === 'ডাউনলোড' || item.url === '#downloads'
  );

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      label: '',
      url: '#',
      iconName: '—',
      order: navigationItems.length,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: NavigationItem) => {
    setEditingItem(item);
    setForm({
      label: item.label,
      url: item.url,
      iconName: item.iconName || '—',
      order: item.order,
      visible: item.visible,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;

    if (editingItem) {
      updateNavigationItem(editingItem.id, form);
    } else {
      addNavigationItem(form);
    }
    setModalOpen(false);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে সমস্ত মেনু ও সাবমেনু ডিফল্ট বিন্যাসে (ডাউনলোড, অ্যাডমিট কার্ড, গুরুত্বপূর্ণ ফরমসমূহ ইত্যাদি সহ) রিসেট করতে চান?'
      )
    ) {
      resetNavigationItems();
      setExpandedParents({ 'nav-downloads': true });
    }
  };

  // Submenu handlers
  const openAddSubmenu = (parent: NavigationItem) => {
    setSelectedParentItem(parent);
    setEditingSubItem(null);
    const existingCount = parent.subItems?.length || 0;
    const isDownload = parent.id === 'nav-downloads' || parent.label === 'ডাউনলোড';
    setSubmenuForm({
      label: '',
      url: isDownload ? '/important-forms' : '#',
      badge: '',
      description: '',
      iconName: isDownload ? 'FileText' : 'Link',
      order: existingCount,
      visible: true,
    });
    setSubmenuModalOpen(true);
  };

  const openEditSubmenu = (parent: NavigationItem, subItem: NavigationSubItem) => {
    setSelectedParentItem(parent);
    setEditingSubItem(subItem);
    setSubmenuForm({
      label: subItem.label,
      url: subItem.url,
      badge: subItem.badge || '',
      description: subItem.description || '',
      iconName: subItem.iconName || 'FileText',
      order: subItem.order,
      visible: subItem.visible,
    });
    setSubmenuModalOpen(true);
  };

  const handleSubmenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentItem || !submenuForm.label.trim()) return;

    if (editingSubItem) {
      updateSubItem(selectedParentItem.id, editingSubItem.id, submenuForm);
    } else {
      addSubItem(selectedParentItem.id, submenuForm);
    }
    setExpandedParents((prev) => ({ ...prev, [selectedParentItem.id]: true }));
    setSubmenuModalOpen(false);
  };

  // Create default download menu with admit card & important forms if missing
  const handleCreateDefaultDownloads = () => {
    if (downloadNavItem) {
      if (!downloadNavItem.subItems || downloadNavItem.subItems.length === 0) {
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
      setExpandedParents((prev) => ({ ...prev, [downloadNavItem.id]: true }));
    } else {
      addNavigationItem({
        label: 'ডাউনলোড',
        url: '#downloads',
        iconName: 'Download',
        order: navigationItems.length,
        visible: true,
        subItems: [
          {
            id: 'sub-admit',
            label: 'অ্যাডমিট কার্ড',
            url: '/admit-card',
            badge: 'Admit Card',
            description: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড',
            iconName: 'CreditCard',
            order: 0,
            visible: true,
          },
          {
            id: 'sub-forms',
            label: 'গুরুত্বপূর্ণ ফরমসমূহ',
            url: '/important-forms',
            badge: 'Forms',
            description: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম',
            iconName: 'FileText',
            order: 1,
            visible: true,
          },
        ],
      } as any);
    }
  };

  // Preset links helper for convenience
  const presetLinks = [
    { label: 'হোম', url: '#home' },
    { label: 'পরিচিতি', url: '#about' },
    { label: 'নোটিশ', url: '#notices' },
    { label: 'ফলাফল', url: '/results' },
    { label: 'ডাউনলোড', url: '#downloads' },
    { label: 'সংবাদ', url: '#news' },
    { label: 'ইভেন্ট', url: '#events' },
    { label: 'একাডেমিক', url: '#programs' },
    { label: 'গ্যালারি', url: '#gallery' },
    { label: 'যোগাযোগ', url: '#contact' },
  ];

  // Preset submenus for quick selection
  const presetSubmenuOptions = [
    { label: 'অ্যাডমিট কার্ড', url: '/admit-card', badge: 'Admit Card', icon: 'CreditCard', desc: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড' },
    { label: 'গুরুত্বপূর্ণ ফরমসমূহ', url: '/important-forms', badge: 'Forms', icon: 'FileText', desc: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম' },
    { label: 'অনলাইন ফলাফল', url: '/results', badge: 'Results', icon: 'FileText', desc: 'সকল শ্রেণির বোর্ড ও বার্ষিক পরীক্ষার ফলাফল' },
    { label: 'বিদ্যালয় পরিচিতি', url: '#about', badge: 'About', icon: 'FileText', desc: 'আমাদের ইতিহাস ও লক্ষ্য' },
    { label: 'শিক্ষক মণ্ডলী', url: '/teachers', badge: 'Teachers', icon: 'FileText', desc: 'সম্মানিত শিক্ষকবৃন্দ' },
    { label: 'কর্মকর্তা ও কর্মচারী', url: '/staff', badge: 'Staff', icon: 'FileText', desc: 'প্রশাসনিক ও সাধারণ স্টাফ' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              নেভিগেশন ও সাবমেনু নিয়ন্ত্রণ
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {navigationItems.length} টি মূল মেনু
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ওয়েবসাইটের হেডার মেনু ও এর অধীনে থাকা ড্রপডাউন সাবমেনুসমূহ (যেমন: <strong>ডাউনলোড</strong> মেনুর অধীনে <strong>অ্যাডমিট কার্ড</strong> ও <strong>গুরুত্বপূর্ণ ফরমসমূহ</strong>) ইচ্ছামতো পরিচালনা করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAdminTab('downloads')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
            title="ফরম ফাইল আপলোড ও অ্যাডমিট কার্ড কনফিগারেশন পেজে যান"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডাউনলোড ও ফরম ফাইল ম্যানেজার</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            title="ডিফল্ট অবস্থায় ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মূল মেনু যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Download Menu Quick Feature Highlight Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-emerald-950">
                হেডারের 'ডাউনলোড' ড্রপডাউন মেনু
              </h3>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-semibold">
                সক্রিয়
              </span>
            </div>
            <p className="text-xs text-emerald-900 mt-1">
              ব্যবহারকারীরা ওয়েবসাইটের হেডারে <strong>'ডাউনলোড'</strong> মেনুতে ক্লিক করলে <strong>'অ্যাডমিট কার্ড'</strong> (প্রবেশপত্র ও সিট প্ল্যান) এবং <strong>'গুরুত্বপূর্ণ ফরমসমূহ'</strong> (ভর্তি ফরম, প্রত্যয়ন, প্রশংসাপত্র ইত্যাদি) সাবমেনুগুলো দেখতে পাবেন। নিচে মেনু টেবিল থেকে সাবমেনুসমূহ পরিচালনা করতে পারেন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {(!downloadNavItem || !downloadNavItem.subItems || downloadNavItem.subItems.length === 0) && (
            <button
              onClick={handleCreateDefaultDownloads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ডিফল্ট ডাউনলোড সাবমেনু তৈরি করুন</span>
            </button>
          )}
          {downloadNavItem && (
            <button
              onClick={() => {
                setExpandedParents((prev) => ({ ...prev, [downloadNavItem.id]: true }));
                openAddSubmenu(downloadNavItem);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ডাউনলোডে সাবমেনু যোগ</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-300" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wide">
              লাইভ প্রিভিউ: ওয়েবসাইটে মেনু ও সাবমেনু যেভাবে প্রদর্শন হচ্ছে
            </h3>
          </div>
          <span className="text-[11px] text-emerald-200 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 self-start sm:self-auto">
            দৃশ্যমান মেনু: {visiblePreviewItems.length} টি
          </span>
        </div>

        {/* Horizontal Mini-Navbar Preview */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 overflow-x-auto scrollbar-none flex items-center gap-2">
          {visiblePreviewItems.map((item, index) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            return (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-2xs border border-white/10"
              >
                <span className="text-[10px] text-amber-300 font-mono font-bold">
                  {index + 1}.
                </span>
                <span>{item.label}</span>
                {hasSub && (
                  <span className="text-[9px] bg-emerald-700/90 px-1.5 py-0.2 rounded text-emerald-100 font-bold flex items-center gap-0.5">
                    <ChevronDown className="w-2.5 h-2.5" />
                    <span>{item.subItems!.filter((s) => s.visible !== false).length}টি সাবমেনু</span>
                  </span>
                )}
                {item.label === 'পরিচিতি' && !hasSub && (
                  <span className="text-[9px] bg-emerald-700/80 px-1 py-0.2 rounded text-emerald-100">
                    ড্রপডাউন
                  </span>
                )}
              </div>
            );
          })}

          {visiblePreviewItems.length === 0 && (
            <span className="text-xs text-emerald-200 py-1 italic">
              কোনো মেনু বর্তমানে দৃশ্যমান নেই। নিচে থেকে দৃশ্যমান করুন।
            </span>
          )}
        </div>
      </div>

      {/* Instruction Tip */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>সাবমেনু পরিচালনা করার নিয়ম:</strong> যেকোনো মেনুর অধীনে ড্রপডাউন সাবমেনু (যেমন <strong>'ডাউনলোড'</strong> মেনুর <strong>'অ্যাডমিট কার্ড'</strong> বা <strong>'গুরুত্বপূর্ণ ফরমসমূহ'</strong>) দেখতে বা এডিট করতে সংশ্লিষ্ট সারির <strong>“সাবমেনু পরিচালনা”</strong> বাটনে ক্লিক করুন। আপনি যেকোনো মেনুর অধীনে নতুন সাবমেনু যোগ করতে পারেন, ক্রম পরিবর্তন ও দৃশ্যমান/লুকানো টগল করতে পারেন।
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="মেনু বা সাবমেনুর নাম বা লিঙ্ক দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Navigation Re-order & Toggle Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#fcfaf7] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center">ক্রম</th>
                <th className="py-3.5 px-4 w-28 text-center">পজিশন</th>
                <th className="py-3.5 px-4">মেনুর নাম</th>
                <th className="py-3.5 px-4">লিঙ্ক / সেকশন</th>
                <th className="py-3.5 px-4 text-center">সাবমেনু</th>
                <th className="py-3.5 px-4 w-36 text-center">প্রদর্শন (Show/Hide)</th>
                <th className="py-3.5 px-4 text-right w-36">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredItems.length - 1;
                const subItems = item.subItems ? [...item.subItems].sort((a, b) => a.order - b.order) : [];
                const hasSub = subItems.length > 0;
                const isExpanded = !!expandedParents[item.id];
                const isDownloadItem = item.id === 'nav-downloads' || item.label === 'ডাউনলোড';

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-gray-50/70 transition ${
                        !item.visible ? 'bg-gray-50/50 opacity-75' : ''
                      } ${isExpanded ? 'bg-emerald-50/30' : ''}`}
                    >
                      {/* Order Index */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold text-xs">
                          {item.order + 1}
                        </span>
                      </td>

                      {/* Move Up / Down Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => moveNavigationItem(item.id, 'up')}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              isFirst
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-emerald-600 hover:text-white'
                            }`}
                            title="উপরে নিন (আগে দেখান)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-gray-300">|</span>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => moveNavigationItem(item.id, 'down')}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              isLast
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-emerald-600 hover:text-white'
                            }`}
                            title="নিচে নিন (পরে দেখান)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Menu Label */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isDownloadItem && (
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                              <Download className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="font-bold text-gray-900 text-sm">
                            {item.label}
                          </span>

                          {isDownloadItem && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                              ডাউনলোড পোর্টাল
                            </span>
                          )}

                          {item.label === 'পরিচিতি' && !hasSub && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                              ড্রপডাউন
                            </span>
                          )}
                          {item.label === 'ফলাফল' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                              অনলাইন ফলাফল
                            </span>
                          )}
                        </div>
                      </td>

                      {/* URL */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 inline-flex items-center gap-1 border border-gray-200/60">
                          <LinkIcon className="w-3 h-3 text-gray-400" />
                          {item.url}
                        </span>
                      </td>

                      {/* Submenu Info & Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              hasSub
                                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            }`}
                            title="সাবমেনু ড্রপডাউন পরিচালনা করুন"
                          >
                            <Layers className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{subItems.length} টি সাবমেনু</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Show / Hide Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleNavigationItemVisible(item.id)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              item.visible ? 'bg-emerald-700' : 'bg-gray-300'
                            }`}
                            title={item.visible ? 'লুকান' : 'প্রদর্শন করুন'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.visible ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <span
                            className={`text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                              item.visible
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {item.visible ? 'দৃশ্যমান' : 'লুকানো'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openAddSubmenu(item)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer border border-emerald-200"
                            title="এই মেনুর অধীনে নতুন সাবমেনু যুক্ত করুন"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `আপনি কি "${item.label}" মেনুটি সম্পূর্ণ মুছে ফেলতে চান?`
                                )
                              ) {
                                deleteNavigationItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Submenu Management Section */}
                    {isExpanded && (
                      <tr className="bg-emerald-50/40">
                        <td colSpan={7} className="p-3 sm:p-5">
                          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                                  <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                    '{item.label}' মেনুর ড্রপডাউন সাবমেনু পরিচালনা ({subItems.length} টি)
                                  </h4>
                                  <p className="text-[11px] text-gray-500">
                                    ওয়েবসাইটের হেডারে '{item.label}' বাটনে ক্লিক বা হোভার করলে এই সাবমেনুগুলো দেখাবে।
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => openAddSubmenu(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>নতুন সাবমেনু যুক্ত করুন</span>
                              </button>
                            </div>

                            {/* Submenu Table */}
                            {subItems.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200 text-[11px]">
                                      <th className="py-2.5 px-3 w-12 text-center">ক্রম</th>
                                      <th className="py-2.5 px-3 w-24 text-center">পজিশন</th>
                                      <th className="py-2.5 px-3">সাবমেনুর নাম</th>
                                      <th className="py-2.5 px-3">লিংক / পাথ</th>
                                      <th className="py-2.5 px-3">ব্যাজ / বিবরণ</th>
                                      <th className="py-2.5 px-3 text-center w-28">অবস্থা</th>
                                      <th className="py-2.5 px-3 text-right w-24">অ্যাকশন</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {subItems.map((sub, sIndex) => {
                                      const isSubFirst = sIndex === 0;
                                      const isSubLast = sIndex === subItems.length - 1;
                                      const isAdmit =
                                        sub.url.includes('admit') ||
                                        sub.url.includes('admin') ||
                                        sub.label.includes('অ্যাডমিট') ||
                                        sub.label.includes('এডমিট');
                                      const isForms =
                                        sub.url.includes('form') ||
                                        sub.label.includes('ফরম');

                                      return (
                                        <tr
                                          key={sub.id}
                                          className={`hover:bg-emerald-50/30 transition ${
                                            !sub.visible ? 'bg-gray-50/60 opacity-70' : ''
                                          }`}
                                        >
                                          <td className="py-2.5 px-3 text-center font-bold text-gray-500 font-mono">
                                            {sIndex + 1}
                                          </td>

                                          {/* Move Up/Down */}
                                          <td className="py-2.5 px-3 text-center">
                                            <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md p-0.5">
                                              <button
                                                type="button"
                                                disabled={isSubFirst}
                                                onClick={() => moveSubItem(item.id, sub.id, 'up')}
                                                className="p-1 rounded text-gray-600 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                title="উপরে নিন"
                                              >
                                                <ArrowUp className="w-3 h-3" />
                                              </button>
                                              <span className="text-[9px] text-gray-300">|</span>
                                              <button
                                                type="button"
                                                disabled={isSubLast}
                                                onClick={() => moveSubItem(item.id, sub.id, 'down')}
                                                className="p-1 rounded text-gray-600 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                title="নিচে নিন"
                                              >
                                                <ArrowDown className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </td>

                                          {/* Submenu Label & Icon */}
                                          <td className="py-2.5 px-3 font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                                                {isAdmit ? (
                                                  <CreditCard className="w-3 h-3" />
                                                ) : isForms ? (
                                                  <FileText className="w-3 h-3" />
                                                ) : (
                                                  <LinkIcon className="w-3 h-3" />
                                                )}
                                              </div>
                                              <span>{sub.label}</span>
                                            </div>
                                          </td>

                                          {/* Submenu URL */}
                                          <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800">
                                            <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                              {sub.url}
                                            </span>
                                          </td>

                                          {/* Badge & Description */}
                                          <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              {sub.badge && (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                                                  {sub.badge}
                                                </span>
                                              )}
                                              {sub.description && (
                                                <span className="text-[11px] text-gray-500 line-clamp-1">
                                                  {sub.description}
                                                </span>
                                              )}
                                            </div>
                                          </td>

                                          {/* Visibility Toggle */}
                                          <td className="py-2.5 px-3 text-center">
                                            <button
                                              type="button"
                                              onClick={() => toggleSubItemVisible(item.id, sub.id)}
                                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                                sub.visible !== false
                                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                              }`}
                                            >
                                              {sub.visible !== false ? (
                                                <Eye className="w-3 h-3" />
                                              ) : (
                                                <EyeOff className="w-3 h-3" />
                                              )}
                                              <span>{sub.visible !== false ? 'সক্রিয়' : 'লুকানো'}</span>
                                            </button>
                                          </td>

                                          {/* Actions */}
                                          <td className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                              <button
                                                type="button"
                                                onClick={() => openEditSubmenu(item, sub)}
                                                className="p-1 rounded text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                title="সম্পাদনা করুন"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (
                                                    confirm(
                                                      `আপনি কি "${sub.label}" সাবমেনুটি মুছে ফেলতে চান?`
                                                    )
                                                  ) {
                                                    deleteSubItem(item.id, sub.id);
                                                  }
                                                }}
                                                className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                title="মুছে ফেলুন"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                                <p className="text-xs text-gray-500">
                                  এই মেনুর অধীনে বর্তমানে কোনো সাবমেনু ড্রপডাউন যুক্ত করা নেই।
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openAddSubmenu(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>প্রথম সাবমেনু যোগ করুন</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    কোনো মেনু পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Menu Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editingItem ? 'মূল মেনু সম্পাদনা করুন' : 'নতুন মূল মেনু যোগ করুন'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              মেনুর নাম, লিঙ্ক ও প্রদর্শন নির্ধারণ করুন
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মেনুর নাম (লেবেল) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডাউনলোড, নোটিশ, ফলাফল, গ্যালারি"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  লিঙ্ক / সেকশন URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: #downloads, /results, #notices, #contact"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />

                {/* Preset suggestions */}
                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 font-medium block mb-1">
                    কুইক প্রি-সেট লিঙ্ক নির্বাচন করুন:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {presetLinks.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            label: form.label || preset.label,
                            url: preset.url,
                          })
                        }
                        className="text-[10px] bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 px-2 py-0.5 rounded cursor-pointer transition border border-gray-200"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    পজিশন ক্রম
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="modal-visible-check"
                    checked={form.visible}
                    onChange={(e) =>
                      setForm({ ...form, visible: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                  />
                  <label
                    htmlFor="modal-visible-check"
                    className="text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    ওয়েবসাইটে দৃশ্যমান
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {editingItem ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submenu Add / Edit Modal */}
      {submenuModalOpen && selectedParentItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSubmenuModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {selectedParentItem.label} এর অধীনে
              </span>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editingSubItem ? 'সাবমেনু সম্পাদনা করুন' : 'নতুন সাবমেনু যুক্ত করুন'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              ড্রপডাউনে প্রদর্শিত হবে এমন সাবমেনুর বিবরণ দিন
            </p>

            <form onSubmit={handleSubmenuSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সাবমেনুর নাম (লেবেল) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অ্যাডমিট কার্ড, গুরুত্বপূর্ণ ফরমসমূহ"
                  value={submenuForm.label}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  লিংক / ইউআরএল পাথ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: /admit-card, /important-forms, /results, #contact"
                  value={submenuForm.url}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />

                {/* Submenu Quick Presets */}
                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 font-medium block mb-1">
                    কুইক প্রি-সেট থেকে সাবমেনু বাছুন:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {presetSubmenuOptions.map((opt) => (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() =>
                          setSubmenuForm({
                            ...submenuForm,
                            label: opt.label,
                            url: opt.url,
                            badge: opt.badge,
                            description: opt.desc,
                            iconName: opt.icon,
                          })
                        }
                        className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded cursor-pointer transition border border-emerald-200 font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ব্যাজ টেক্সট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: Admit Card, Forms, New"
                    value={submenuForm.badge}
                    onChange={(e) =>
                      setSubmenuForm({ ...submenuForm, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    আইকন
                  </label>
                  <select
                    value={submenuForm.iconName}
                    onChange={(e) =>
                      setSubmenuForm({ ...submenuForm, iconName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CreditCard">CreditCard (কার্ড/প্রবেশপত্র)</option>
                    <option value="FileText">FileText (ফরম/ডকুমেন্ট)</option>
                    <option value="Download">Download (ডাউনলোড)</option>
                    <option value="Link">Link (সাধারণ লিঙ্ক)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড"
                  value={submenuForm.description}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="submenu-visible-check"
                  checked={submenuForm.visible}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, visible: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor="submenu-visible-check"
                  className="text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  ড্রপডাউনে এই সাবমেনু দৃশ্যমান থাকবে
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSubmenuModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {editingSubItem ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
