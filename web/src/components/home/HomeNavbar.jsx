import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Download, Menu, X } from 'lucide-react';
import Logo from '../Logo';

export const HomeNavbar = ({ scrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer"
          >
            Tính năng
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer"
          >
            Quy trình
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('download-app')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer flex items-center gap-1.5 text-[#EA701B] font-bold"
          >
            <Smartphone className="w-4 h-4" />
            <span>Tải App</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('solutions')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer"
          >
            Giải pháp
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('testimonials')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer"
          >
            Đánh giá
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('faq')}
            className="hover:text-[#EA701B] transition-colors cursor-pointer"
          >
            Hỏi đáp
          </button>
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="btn-nav-download"
            type="button"
            onClick={() => handleNavClick('download-app')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-[#EA701B] bg-slate-50 hover:bg-orange-50/60 btn-press transition cursor-pointer"
            title="Cuộn xuống để tải ứng dụng cho điện thoại"
          >
            <Download className="w-3.5 h-3.5 text-[#EA701B]" />
            <span>Tải App</span>
          </button>

          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 btn-press hover-lift transition-all"
          >
            <span>Đăng nhập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-orange-50 rounded-xl transition cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-orange-100 px-6 py-5 space-y-4 animate-dropdown-enter">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-left py-2 hover:text-[#EA701B] cursor-pointer"
            >
              Tính năng nổi bật
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('download-app')}
              className="text-left py-2 text-[#EA701B] font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải ứng dụng di động (iOS & Android)</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-2 hover:text-[#EA701B] cursor-pointer"
            >
              Cách thức hoạt động
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('solutions')}
              className="text-left py-2 hover:text-[#EA701B] cursor-pointer"
            >
              Giải pháp cho cửa hàng
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('faq')}
              className="text-left py-2 hover:text-[#EA701B] cursor-pointer"
            >
              Câu hỏi thường gặp
            </button>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 bg-[#EA701B] text-white text-center text-xs font-bold rounded-xl shadow-md btn-press"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
