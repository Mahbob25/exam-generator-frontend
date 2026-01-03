import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit, Zap } from "lucide-react";
import { clsx } from "clsx";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
      {/* Header */}
      <header className="absolute top-0 w-full p-6 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">Systefiy</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 pt-24">


        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tight text-foreground leading-[1.1]">
          أنشئ اختباراتك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">
            في ثوانٍ.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          الأداة الأكثر تطوراً للمعلمين والطلاب لتوليد أسئلة اختبارات عالية الجودة ومتوافقة مع المنهج الدراسي تلقائياً.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/generate"
            className={clsx(
              "px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2 group",
            )}
          >
            ابدأ التوليد الآن <ArrowRight className="group-hover:-translate-x-1 transition-transform rotate-180" />
          </Link>
          <Link
            href="/history"
            className="px-8 py-4 rounded-full bg-muted/40 hover:bg-muted text-foreground font-medium text-lg transition-colors"
          >
            سجل الاختبارات
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-right" dir="rtl">
          {[
            { icon: BrainCircuit, title: "تحليل بالذكاء الاصطناعي", desc: "فهم عميق لمواضيع المنهج." },
            { icon: Sparkles, title: "جودة عالية", desc: "بنوك أسئلة متميزة ومراجعة." },
            { icon: Zap, title: "نتائج فورية", desc: "توليد اختبارات كاملة في أقل من 30 ثانية." },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border hover:border-primary/50 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <f.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
