import { Heart, Target, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Về chúng tôi</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Chúng tôi là tổ chức phi lợi nhuận hoạt động với sứ mệnh kết nối những tấm lòng nhân ái, mang đến cơ hội
                và hy vọng cho những hoàn cảnh khó khăn trong cộng đồng.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Sứ mệnh</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Kết nối những tấm lòng hảo tâm với những hoàn cảnh khó khăn, tạo ra những thay đổi tích cực và bền
                    vững cho cộng đồng thông qua các hoạt động từ thiện minh bạch và hiệu quả.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <Heart className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Tầm nhìn</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Trở thành nền tảng từ thiện hàng đầu Việt Nam, nơi mọi người có thể dễ dàng đóng góp và theo dõi tác
                    động của mình, góp phần xây dựng một xã hội công bằng và nhân ái hơn.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                    <Heart className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Minh bạch</h3>
                  <p className="text-muted-foreground">
                    Công khai mọi khoản đóng góp và chi tiêu, đảm bảo sự tin tưởng từ cộng đồng.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-teal-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Cộng đồng</h3>
                  <p className="text-muted-foreground">
                    Kết nối và tạo dựng mạng lưới tình nguyện viên mạnh mẽ, cùng nhau lan tỏa yêu thương.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-cyan-100 rounded-full mb-4">
                    <Award className="h-8 w-8 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Hiệu quả</h3>
                  <p className="text-muted-foreground">
                    Tối ưu hóa mọi nguồn lực để mang lại tác động tích cực nhất cho người thụ hưởng.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Thành tựu của chúng tôi</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
                <p className="text-muted-foreground">Dự án hoàn thành</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">50K+</div>
                <p className="text-muted-foreground">Người được hỗ trợ</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600 mb-2">10K+</div>
                <p className="text-muted-foreground">Nhà hào tâm</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">2K+</div>
                <p className="text-muted-foreground">Tình nguyện viên</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
