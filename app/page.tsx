'use client';

import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Sparkles, Target, GraduationCap, Award } from "lucide-react";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/store";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden" dir="rtl">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={22} />
          </div>
          <span className="font-bold text-2xl font-heading tracking-tight">ذاكر</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-24 h-10 bg-muted/50 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              الذهاب للوحة التحكم
              <ArrowRight className="rotate-180" size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-6 md:px-12 py-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles size={16} />
          منصة التعلم الذكي
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tight text-foreground leading-[1.15] max-w-4xl mb-6">
          تعلّم بذكاء{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">
            وليس بجهد أكبر
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          منصة ذاكر تساعدك على استيعاب المفاهيم بطريقة تفاعلية وشخصية، مع اختبارات ذكية وتجربة تعلم تتكيف مع مستواك.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/learn"
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2 group"
              >
                استمر في التعلم
                <BookOpen className="group-hover:scale-110 transition-transform" size={20} />
              </Link>
              <Link
                href="/generate"
                className="px-8 py-4 rounded-full bg-card border hover:border-primary/50 text-foreground font-medium text-lg transition-all flex items-center gap-2"
              >
                أنشئ اختباراً جديداً
                <Sparkles size={18} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2 group"
              >
                ابدأ مجاناً
                <ArrowRight className="group-hover:-translate-x-1 transition-transform rotate-180" size={20} />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-full bg-card border hover:border-primary/50 text-foreground font-medium text-lg transition-all"
              >
                لديك حساب؟ سجّل دخولك
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              لماذا ذاكر؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              منصة متكاملة تجمع أفضل تقنيات التعلم الحديثة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "تعلم تفاعلي",
                description: "محتوى تعليمي متكيف يتناسب مع أسلوب تعلمك الشخصي",
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                icon: Target,
                title: "اختبارات ذكية",
                description: "أنشئ اختبارات مخصصة بالذكاء الاصطناعي في ثوانٍ",
                gradient: "from-purple-500 to-pink-600",
              },
              {
                icon: Award,
                title: "تتبع التقدم",
                description: "شاهد تطورك وحدد نقاط القوة والضعف بدقة",
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                icon: BookOpen,
                title: "مناهج متعددة",
                description: "محتوى متوافق مع المناهج الدراسية المعتمدة",
                gradient: "from-orange-500 to-red-600",
              },
              {
                icon: Sparkles,
                title: "تجربة شخصية",
                description: "النظام يتعلم منك ويقدم محتوى يناسب احتياجاتك",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                icon: GraduationCap,
                title: "نتائج مضمونة",
                description: "طلابنا يحققون نتائج أفضل بنسبة 40%",
                gradient: "from-violet-500 to-purple-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={26} />
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-purple-500/10 to-emerald-500/10 rounded-3xl p-12 border">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            {isAuthenticated ? "استمر في رحلة التعلم" : "جاهز لبدء رحلة التعلم؟"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            {isAuthenticated
              ? "لديك أهداف تنتظرك! عد للوحة التحكم واستمر من حيث توقفت"
              : "انضم لآلاف الطلاب الذين يستخدمون ذاكر لتحقيق أهدافهم الدراسية"
            }
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all"
          >
            {isAuthenticated ? "الذهاب للوحة التحكم" : "أنشئ حسابك الآن - مجاناً"}
            <ArrowRight className="rotate-180" size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
