import Link from "next/link"
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span>Quyên Góp Từ Thiện</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nền tảng quyên góp từ thiện uy tín, minh bạch, giúp kết nối những tấm lòng nhân ái với những hoàn cảnh khó
              khăn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/du-an" className="text-muted-foreground hover:text-primary transition-colors">
                  Dự án quyên góp
                </Link>
              </li>
              <li>
                <Link href="/su-kien" className="text-muted-foreground hover:text-primary transition-colors">
                  Sự kiện
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="text-muted-foreground hover:text-primary transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/tinh-nguyen-vien" className="text-muted-foreground hover:text-primary transition-colors">
                  Tình nguyện viên
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>contact@charity.vn</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Quyên Góp Từ Thiện. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
