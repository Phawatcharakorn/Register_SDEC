const highlights = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'พัฒนาทักษะ',
    desc: 'ฝึกอบรมและ Workshop จากผู้เชี่ยวชาญจริง ทั้ง Soft Skills และ Hard Skills',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'สร้างเครือข่าย',
    desc: 'เชื่อมต่อกับนิสิตต่างคณะและรุ่นพี่ในสายงาน สร้าง Connection ที่มีคุณค่า',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'รับใบประกาศนียบัตร',
    desc: 'ได้รับ Certificate รับรองโดยมหาวิทยาลัย เสริมพอร์ตโฟลิโอก่อนจบการศึกษา',
  },
]

// ปรับวันเปิด-ปิดรับสมัครได้ที่นี่
const OPEN_DATE  = '1 กรกฎาคม 2569'
const CLOSE_DATE = '31 กรกฎาคม 2569'
const IS_OPEN    = true

export default function HeroSection() {
  return (
    <section className="space-y-5">
      {/* About SDEC */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          {/* Blue left bar */}
          <div className="hidden sm:block w-1 shrink-0 self-stretch rounded-full bg-ku-green" />
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">SDEC คืออะไร?</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              ศูนย์จะสร้างกระบวนการเรียนรู้ของนิสิตจึงมุ่งเน้นการลงมือปฏิบัติจริงในองค์กรภายนอก
              ซึ่งจะเป็นการสร้างประสบการณ์และความรู้เฉพาะตัวที่นิสิตจะได้รับในการทำงานและส่งเสริมการหารายได้ระหว่างเรียนให้แก่นิสิต
              อีกทั้งยังช่วยสร้างแรงบันดาลใจในการค้นพบอาชีพและแนวทางการประกอบอาชีพเมื่อสำเร็จการศึกษา
            </p>
          </div>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-card text-center hover:shadow-md transition-shadow">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ku-green-50 text-ku-green">
              {item.icon}
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">{item.title}</h3>
            <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Application period */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400">ระยะเวลารับสมัคร</p>
            <p className="text-sm font-semibold text-gray-800">
              {OPEN_DATE} — {CLOSE_DATE}
            </p>
          </div>
        </div>

        {IS_OPEN ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            กำลังเปิดรับสมัคร
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            ปิดรับสมัครแล้ว
          </span>
        )}
      </div>
    </section>
  )
}
