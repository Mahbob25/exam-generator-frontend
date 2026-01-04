import Link from "next/link";
import { Sparkles, Linkedin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-muted/20 border-t mt-auto" dir="rtl">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:items-start">

                    {/* Brand Column */}
                    <div className="space-y-4 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles size={18} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">ذاكر</span>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0 leading-relaxed">
                            منصتك الذكية لتوليد اختبارات احترافية في ثوانٍ. ندعم المعلمين والطلاب بأفضل تقنيات الذكاء الاصطناعي.
                        </p>
                    </div>

                    {/* Socials Column */}
                    <div className="space-y-4 text-center md:text-left">
                        <h3 className="font-semibold text-foreground">تواصل معنا</h3>
                        <div className="flex justify-center md:justify-end gap-4">
                            <Link
                                href="#"
                                className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110"
                            >
                                <Linkedin size={20} />
                            </Link>
                            <Link
                                href="#"
                                className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-pink-500 hover:border-pink-500/50 transition-all hover:scale-110"
                            >
                                <Instagram size={20} />
                            </Link>
                            <Link
                                href="#"
                                className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-600/50 transition-all hover:scale-110"
                            >
                                <Facebook size={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>© {currentYear} ذاكر. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
}
