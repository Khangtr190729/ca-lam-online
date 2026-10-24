import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  ShieldCheck,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Star,
  Zap,
  Coffee,
  Store,
  Layers,
  ChevronDown,
  Menu,
  X,
  Play,
  HeartHandshake,
  Check,
  TrendingUp,
  Smartphone,
  Download,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

// Official Apple logo SVG
const AppleLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.44c.59-.73 1-1.74.88-2.75-.86.04-1.92.58-2.53 1.3-.54.63-.99 1.66-.86 2.65.96.08 1.93-.49 2.51-1.2z" />
  </svg>
);

// Official Google Play (CH Play) logo SVG
const GooglePlayLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M3.6 1.8c-.2.2-.4.6-.4 1.1v18.2c0 .5.2.9.4 1.1l10.4-10.2L3.6 1.8z"
    />
    <path
      fill="#FBBC04"
      d="M17.5 14.5l-3.5-2.5-10.4 10.2c.4.4 1.1.5 1.8.1l12.1-7.8z"
    />
    <path
      fill="#EA4335"
      d="M17.5 9.5L5.4 1.7C4.7 1.3 4 1.4 3.6 1.8l10.4 10.2 3.5-2.5z"
    />
    <path
      fill="#34A853"
      d="M21.3 11.2l-3.8-2.4-3.5 3.2 3.5 3.2 3.8-2.4c.7-.4.7-1.2 0-1.6z"
    />
  </svg>
);

export const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Máy nào còn thời hạn token thì chuyển thẳng vào trong ứng dụng
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'EMPLOYEE') {
        navigate('/my-schedule', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Scroll to section helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Màn hình chờ nhẹ nếu thiết bị đang có sẵn token và đang xác thực
  if (loading && localStorage.getItem('ca_lam_token')) {
    return (
      <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center font-['Be_Vietnam_Pro',sans-serif]">
        <div className="w-8 h-8 border-3 border-[#EA701B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const faqs = [
    {
      q: 'Ca Làm Online hoạt động như thế nào?',
      a: 'Chủ cửa hàng tạo tài khoản, tạo quán và các ca làm việc mẫu. Sau đó mời nhân viên qua mã 6 số hoặc email. Quản lý có thể xếp ca thủ công hoặc bấm "Tự động xếp lịch", hệ thống sẽ chia đều ca, chống trùng lịch và tự động gửi email thông báo kèm bảng lương ước tính tới từng nhân viên khi xuất bản.',
    },
    {
      q: 'Làm thế nào để tải ứng dụng về điện thoại cho nhân viên?',
      a: 'Bạn chỉ cần bấm nút "Tải App" trên thanh menu để cuộn nhanh xuống phần tải ứng dụng ngay trên footer, sau đó bấm chọn "App Store (iOS)" hoặc "Google Play (CH Play)" để cài đặt.',
    },
    {
      q: 'Nhân viên có cần phải trả phí để xem lịch làm việc không?',
      a: 'Hoàn toàn miễn phí! Nhân viên chỉ cần tải app hoặc truy cập web, đăng ký vai trò "Người đi làm", nhập mã mời của quán là có thể tra cứu lịch làm cá nhân, xem dự toán lương và nhận thông báo ca trực tự động qua email.',
    },
    {
      q: 'Quản lý cửa hàng có thể được xếp ca làm việc không?',
      a: 'Có! Hệ thống hỗ trợ mô hình Quản lý kiêm nhân viên bán hàng / trực ca. Quản lý vừa có quyền điều phối xếp ca cho quán, vừa có thể được phân ca và theo dõi ca trực riêng trong ứng dụng di động hoặc màn hình "Lịch làm của tôi".',
    },
    {
      q: 'Tính năng đánh giá ca làm và trừ lương hoạt động ra sao?',
      a: 'Khi nhân viên vắng mặt không phép hoặc bỏ ca, Quản lý/Chủ quán có thể bấm nút "Đánh giá ca" trên ca đang diễn ra hoặc trong quá khứ, đánh dấu "Không hoàn thành" và ghi lý do. Tiền lương ca đó sẽ tự động bị khấu trừ khỏi tổng lương tuần/tháng, đồng thời gửi email thông báo kỷ luật minh bạch về cho nhân viên.',
    },
    {
      q: 'Hệ thống có ngăn chặn việc xếp trùng ca không?',
      a: 'Tuyệt đối có! Hệ thống có 2 lớp bảo vệ: (1) Ngăn không cho tạo các ca làm có khung giờ giao thoa nhau trong cùng cửa hàng; (2) Tự động phát hiện và cảnh báo tức thời nếu vô tình xếp một nhân viên vào 2 ca cùng ngày hoặc vượt quá số ca tối đa.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F0] text-slate-800 font-['Be_Vietnam_Pro',sans-serif] selection:bg-[#EA701B] selection:text-white">
      {/* 1. TOP STICKY HEADER */}
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
              onClick={() => scrollToSection('features')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer"
            >
              Tính năng
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer"
            >
              Quy trình
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('download-app')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer flex items-center gap-1.5 text-[#EA701B] font-bold"
            >
              <Smartphone className="w-4 h-4" />
              <span>Tải App</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('solutions')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer"
            >
              Giải pháp
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('testimonials')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer"
            >
              Đánh giá
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#EA701B] transition-colors cursor-pointer"
            >
              Hỏi đáp
            </button>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Download App Action */}
            <button
              id="btn-nav-download"
              type="button"
              onClick={() => scrollToSection('download-app')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-[#EA701B] bg-slate-50 hover:bg-orange-50/60 btn-press transition"
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
            className="md:hidden p-2 text-slate-600 hover:bg-orange-50 rounded-xl transition"
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
                onClick={() => scrollToSection('features')}
                className="text-left py-2 hover:text-[#EA701B]"
              >
                Tính năng nổi bật
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('download-app');
                }}
                className="text-left py-2 text-[#EA701B] font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Tải ứng dụng di động (iOS & Android)</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 hover:text-[#EA701B]"
              >
                Cách thức hoạt động
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('solutions')}
                className="text-left py-2 hover:text-[#EA701B]"
              >
                Giải pháp cho cửa hàng
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 hover:text-[#EA701B]"
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

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle decorative background gradient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-orange-300/25 via-amber-200/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 border border-orange-200/80 text-[#EA701B] text-xs font-bold shadow-xs animate-page-enter">
            <Sparkles className="w-4 h-4" />
            <span>Nền tảng Quản trị & Tự động Xếp ca 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto animate-page-enter">
            Xếp ca thông minh — Tự động tính lương{' '}
            <span className="text-[#EA701B] underline decoration-orange-300/50 decoration-wavy decoration-2">
              chuẩn xác từng phút
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-page-enter">
            Giải pháp thay thế hoàn toàn việc xếp ca bằng giấy bút và bảng tính thủ công. Tối ưu thời gian,
            ngăn chặn trùng ca thời gian thực, đánh giá ca làm và tự động gửi email lịch trực kèm bảng
            lương chỉ với 1 cú nhấp chuột.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-page-enter">
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-orange-500/30 btn-press hover-lift transition-all"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection('interactive-preview')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 bg-white hover:bg-orange-50/60 text-slate-700 text-sm font-bold rounded-2xl border border-slate-200 shadow-xs btn-press hover-lift transition"
            >
              <Play className="w-4 h-4 text-[#EA701B] fill-[#EA701B]" />
              <span>Xem giao diện thực tế</span>
            </button>
          </div>

          {/* Value check pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Không cần cài đặt phức tạp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tự động gửi email thông báo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dễ dàng dùng trên điện thoại & máy tính</span>
            </div>
          </div>

          {/* 3. INTERACTIVE PREVIEW MOCKUP */}
          <div
            id="interactive-preview"
            className="pt-10 max-w-5xl mx-auto relative group animate-page-enter"
          >
            {/* Ambient Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-35 transition duration-500 -z-10" />

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-left">
              {/* Window Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-500 ml-3">
                    Lịch làm việc tuần
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã xuất bản & Đã gửi email
                  </span>
                </div>
              </div>

              {/* Mockup Timetable Content */}
              <div className="p-6 overflow-x-auto space-y-4">
                <div className="grid grid-cols-4 gap-3 min-w-[650px]">
                  {/* Column 1: Shift Info */}
                  <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2 hover-lift">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#EA701B]">Ca Sáng</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                        07:00 - 12:00
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Nguyễn Văn A</span>
                        <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Trần Thị B</span>
                        <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Shift Info */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 hover-lift">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-700">Ca Chiều</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                        12:30 - 17:30
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Lê Hoàng C</span>
                        <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Phạm Quỳnh D</span>
                        <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Shift Info */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 hover-lift">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-700">Ca Tối</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                        18:00 - 22:30
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Vũ Minh E</span>
                        <span className="text-emerald-700 font-mono font-bold">112.500đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                        <span className="font-semibold text-slate-700">Hoàng Thu F</span>
                        <span className="text-emerald-700 font-mono font-bold">112.500đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Payroll & Metric Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col justify-between hover-lift">
                    <div>
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                        Dự toán tuần này
                      </span>
                      <h4 className="text-xl font-mono font-extrabold text-white mt-1">3.450.000đ</h4>
                      <p className="text-[11px] text-slate-400 mt-1">28 lượt ca • 6 nhân sự</p>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">● 0 xung đột</span>
                      <span className="text-slate-400">100% tự động</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY METRICS STATS BANNER */}
      <section className="py-12 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#EA701B] font-mono">99.8%</p>
              <p className="text-xs font-bold text-slate-800">Không lo trùng ca</p>
              <p className="text-[11px] text-slate-500">Phát hiện xung đột giờ tức thời</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">4+ Giờ</p>
              <p className="text-xs font-bold text-slate-800">Tiết kiệm mỗi tuần</p>
              <p className="text-[11px] text-slate-500">Xếp lịch tự động chỉ 1 cú click</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">100%</p>
              <p className="text-xs font-bold text-slate-800">Chuẩn xác tiền lương</p>
              <p className="text-[11px] text-slate-500">Tự động tính lương theo giờ & ca</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-600 font-mono">Tức thì</p>
              <p className="text-xs font-bold text-slate-800">Gửi Email thông báo</p>
              <p className="text-[11px] text-slate-500">Báo lịch & lương về hộp thư nhân viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPARISON: TRADITIONAL VS CA LÀM ONLINE */}
      <section id="solutions" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
            Giải pháp chuyên biệt
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tạm biệt chuỗi ngày xếp ca đau đầu bằng Excel và sổ tay
          </h2>
          <p className="text-sm text-slate-600">
            Hãy xem Ca Làm Online biến đổi quy trình quản lý của cửa hàng bạn như thế nào.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Traditional Way */}
          <div className="bg-red-50/50 border-2 border-red-200/80 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center font-bold">
                ✕
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cách làm thủ công truyền thống</h3>
            </div>
            <ul className="space-y-4 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  !
                </span>
                <span>
                  <b>Trùng lặp & Xung đột ca:</b> Dễ xếp nhầm 1 nhân viên vào 2 ca cùng lúc hoặc xếp
                  vào ngày nhân viên đã xin nghỉ.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  !
                </span>
                <span>
                  <b>Tính lương cuối tháng sai sót:</b> Đếm từng giờ trên sổ sách rất dễ nhầm lẫn, dẫn
                  đến tranh cãi không đáng có với nhân sự.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  !
                </span>
                <span>
                  <b>Hỏi đi hỏi lại lịch qua Zalo:</b> Nhân viên quên ca, chụp ảnh màn hình lịch mờ
                  nhạt, không nắm được giờ làm của mình.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  !
                </span>
                <span>
                  <b>Bỏ ca không thể trừ lương minh bạch:</b> Nhân viên vắng mặt nhưng cuối tháng quản
                  lý quên trừ tiền, gây thất thoát chi phí.
                </span>
              </li>
            </ul>
          </div>

          {/* Ca Làm Online Way */}
          <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900">Với hệ thống Ca Làm Online</h3>
            </div>
            <ul className="space-y-4 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Tự động xếp lịch thông minh (Auto Schedule):</b> Cân bằng công bằng số ca cho các
                  nhân viên và ngăn chặn 100% việc trùng khung giờ.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Bảng lương tự động cập nhật:</b> Hệ thống tính sẵn tiền lương theo giờ thực tế cho
                  từng nhân viên, minh bạch và tức thời.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Tự động gửi Email chuyên nghiệp:</b> Xuất bản lịch biểu là hệ thống gửi ngay danh
                  sách ca và lương dự toán về email cá nhân của từng nhân viên.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Đánh giá ca làm & Khấu trừ tự động:</b> Nhân viên bỏ ca sẽ bị đánh dấu không hoàn
                  thành, trừ lương ngay và gửi email kỷ luật rõ ràng.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. CORE FEATURES GRID */}
      <section id="features" className="py-20 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
              Tính năng vượt trội
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mọi công cụ bạn cần để điều hành nhân sự cửa hàng
            </h2>
            <p className="text-sm text-slate-600">
              Được thiết kế tinh gọn, tập trung vào hiệu năng cao nhất và dễ sử dụng nhất cho mọi nhân
              viên và chủ quán.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA701B] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tự động xếp lịch thông minh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thuật toán thông minh tự động phân bổ nhân sự vào các ca còn trống, đảm bảo số ca cân
                bằng và lưu dưới dạng bản nháp để duyệt trước.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Phát hiện & Chặn trùng ca</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ngăn chặn tạo ca trùng khung giờ trong quán và tự động cảnh báo khi nhân viên bị xếp
                chồng chéo ca làm việc trong cùng một ngày.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Bảng tính lương theo giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Linh hoạt cài đặt mức lương theo giờ cho từng nhân viên Part-time hoặc Full-time. Tự
                động tổng hợp dự toán tiền lương tuần và tháng.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Đánh giá ca & Trừ lương tự động</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh dấu các ca không hoàn thành khi nhân viên bỏ ca, tự động trừ tiền ra khỏi tổng lương
                và gửi email kỷ luật minh bạch cho nhân viên.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Email thông báo tự động</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động gửi thông báo lịch làm việc đẹp mắt, rõ ràng kèm bảng lương chi tiết đến từng
                nhân sự ngay khi lịch tuần được xuất bản.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Phân quyền 3 vai trò rõ ràng</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chủ cửa hàng (toàn quyền quản trị), Quản lý (xếp ca và có thể trực ca), và Nhân viên
                (tra cứu lịch cá nhân trên web và điện thoại).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
            Dễ dàng sử dụng
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Vận hành chỉ với 3 bước đơn giản
          </h2>
          <p className="text-sm text-slate-600">
            Không cần hướng dẫn phức tạp, bạn có thể đưa quán vào hoạt động ngay trong vài phút.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
            <span className="text-4xl font-extrabold text-orange-200 font-mono">01</span>
            <h3 className="text-base font-bold text-slate-900">Tạo quán & Định nghĩa ca làm</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập tên quán, tạo các ca làm chuẩn (Ca Sáng, Ca Chiều, Ca Tối...) và gán mức lương theo giờ
              cho các nhân viên.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
            <span className="text-4xl font-extrabold text-orange-200 font-mono">02</span>
            <h3 className="text-base font-bold text-slate-900">Mời nhân viên & Xếp lịch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gửi mã mời 6 số hoặc email cho nhân viên. Bấm nút <b>"Tự động xếp lịch"</b> để hệ thống tự
              chia ca hoàn hảo trong tích tắc.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
            <span className="text-4xl font-extrabold text-orange-200 font-mono">03</span>
            <h3 className="text-base font-bold text-slate-900">Xuất bản & Tự động gửi Email</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xem lại bảng lương dự toán tuần, bấm <b>"Xuất bản"</b>. Hệ thống tự động gửi email thông
              báo chi tiết đến từng nhân sự.
            </p>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
              Khách hàng nói gì
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Được tin dùng bởi các chủ quán và chuỗi cửa hàng
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Trước đây cuối tuần nào mình cũng mất nửa ngày để sắp xếp ca cho 12 bạn nhân viên part-time
                trên Excel rồi gửi lên nhóm Zalo. Giờ bấm Tự động xếp lịch là xong, có cả email báo lương
                rất minh bạch!"
              </p>
              <div className="pt-2 border-t border-orange-200/60">
                <p className="text-xs font-bold text-slate-900">Anh Hoàng Khang</p>
                <p className="text-[10px] text-slate-500">Chủ chuỗi Shop Trái Cây & Nước ép</p>
              </div>
            </div>

            <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Thích nhất tính năng đánh giá ca làm việc không hoàn thành. Bạn nào bỏ ca là quản lý bấm
                trừ tiền ngay, hệ thống gửi email cảnh báo rõ ràng nên nhân viên rất có trách nhiệm và
                không còn đi trễ."
              </p>
              <div className="pt-2 border-t border-orange-200/60">
                <p className="text-xs font-bold text-slate-900">Chị Thu Thảo</p>
                <p className="text-[10px] text-slate-500">Quản lý The Sense Coffee</p>
              </div>
            </div>

            <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Em là sinh viên đi làm thêm, vào màn hình Lịch làm của tôi xem được ngay tuần này đi làm
                những ngày nào, dự kiến nhận được bao nhiêu tiền lương. Giao diện trên điện thoại cũng rất
                nhanh và mượt."
              </p>
              <div className="pt-2 border-t border-orange-200/60">
                <p className="text-xs font-bold text-slate-900">Bạn Minh Quân</p>
                <p className="text-[10px] text-slate-500">Nhân viên pha chế Part-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
            Giải đáp thắc mắc
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-[#EA701B] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[#EA701B]' : ''
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. COMBINED CTA & APP DOWNLOAD SECTION - RIGHT ABOVE FOOTER */}
      <section id="download-app" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Subtle warm glow background */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bắt đầu quản lý ca làm thông minh</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Sẵn sàng nâng tầm quản lý ca làm cho cửa hàng?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Tiết kiệm hàng giờ xếp ca mỗi tuần, tính lương chuẩn xác và gửi thông báo lịch làm tự động. Đăng nhập ngay trên máy tính hoặc tải ứng dụng cho điện thoại di động.
              </p>
            </div>

            {/* Right Action Buttons: Nút Đăng nhập & 2 Nút Store */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full lg:w-auto justify-center">
              {/* Nút Đăng nhập */}
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 btn-press hover-lift transition-all"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Nút 1: App Store (iOS) */}
              <a
                id="btn-download-appstore"
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-2xl shadow-md btn-press hover-lift transition-all text-left group"
              >
                <AppleLogo className="w-6 h-6 fill-current text-white shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium leading-none">
                    Tải về trên
                  </span>
                  <span className="text-xs font-extrabold text-white leading-tight mt-0.5">
                    App Store (iOS)
                  </span>
                </div>
              </a>

              {/* Nút 2: Google Play (CH Play) */}
              <a
                id="btn-download-chplay"
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-2xl shadow-md btn-press hover-lift transition-all text-left group"
              >
                <GooglePlayLogo className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium leading-none">
                    Tải về trên
                  </span>
                  <span className="text-xs font-extrabold text-white leading-tight mt-0.5">
                    Google Play (CH Play)
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
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
                className="hover:text-[#EA701B] transition"
              >
                Tính năng
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('download-app')}
                className="hover:text-[#EA701B] transition"
              >
                Tải App
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#EA701B] transition"
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
    </div>
  );
};

export default HomePage;
