import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { AppleLogo, GooglePlayLogo } from './HomeDownloadSection';

export const HomeFooter = ({ scrollToSection }) => {
  return (
    <footer className="bg-white border-t border-orange-100 py-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
          </div>

          {/* App Store & CH Play Badges in Footer */}
          <div className="flex items-center gap-3">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[11px] font-bold shadow-xs btn-press transition"
            >
              <AppleLogo className="w-4 h-4 fill-current" />
              <span>App Store</span>
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[11px] font-bold shadow-xs btn-press transition"
            >
              <GooglePlayLogo className="w-3.5 h-3.5" />
              <span>Google Play (CH Play)</span>
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Ca Làm Online. Nền tảng Xếp ca & Quản lý Lương cửa hàng.</p>
          <div className="flex items-center gap-6 font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#EA701B] transition cursor-pointer"
            >
              Tính năng
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('download-app')}
              className="hover:text-[#EA701B] transition cursor-pointer"
            >
              Tải App
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#EA701B] transition cursor-pointer"
            >
              Hỏi đáp
            </button>
            <Link to="/login" className="hover:text-[#EA701B] transition">
              Đăng nhập
            </Link>
            <Link to="/register" className="text-[#EA701B] font-bold transition">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
