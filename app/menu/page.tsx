"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MenuItem = {
  name: string;
  price: string;
  extraPrice?: string;
  desc: string;
  img?: string;
  imgPosition?: string;
  containerClass?: string;
};

const menuData: { category: string; id: string; items: MenuItem[] }[] = [
  {
    category: "Çorbalar",
    id: "corbalar",
    items: [
      { name: "Mercimek Çorbası", price: "190 TL", desc: "Biber turşusu, turp, ekmek ile", img: "/mercimek_corbasi.png" },
      { name: "Ezogelin Çorbası", price: "190 TL", desc: "Biber turşusu, turp, ekmek ile", img: "/ezogelin_corbasi.png" },
      { name: "Yayla Çorbası", price: "190 TL", desc: "", img: "/yayla_corbasi.png" },
      { name: "Tavuk Çorbası (Arabaşı)", price: "220 TL", desc: "Biber turşusu, turp, ekmek ile", img: "/arabasi_corbasi.png" },
      { name: "İşkembe Çorbası", price: "290 TL", desc: "", img: "/iskembe_corbasi.png" },
      { name: "Kelle Paça Çorbası", price: "340 TL", desc: "Biber turşusu, turp, ekmek ile", img: "/kelle_paca_corbasi.png" },
      { name: "Etli Kemik Suyu", price: "340 TL", desc: "", img: "/kelle_paca_corbasi.png" },
      { name: "Beyran Çorbası", price: "360 TL", desc: "", img: "/beyran.png", imgPosition: "object-[center_15%]" },
    ]
  },
  {
    category: "Mantılar",
    id: "mantilar",
    items: [
      { name: "Kayseri Mantısı", price: "490 TL", extraPrice: "1,5 Porsiyon: 620 TL", desc: "İsteğe göre yoğurt, sos. Biber turşusu, salata, ekmek ile", img: "/kayseri_mantisi.png" },
      { name: "Çıtır Mantı", price: "550 TL", extraPrice: "1,5 Porsiyon: 680 TL", desc: "İsteğe göre yoğurt, sos. Biber turşusu, salata, ekmek ile", img: "/citir_manti.png" },
      { name: "Kıymalı Hingel", price: "490 TL", extraPrice: "1,5 Porsiyon: 620 TL", desc: "İsteğe göre yoğurt, sos. Biber turşusu, salata, ekmek ile", img: "/hingel_manti.png" },
      { name: "Patatesli Hingel", price: "400 TL", extraPrice: "1,5 Porsiyon: 500 TL", desc: "İsteğe göre yoğurt, sos. Biber turşusu, salata, ekmek ile", img: "/hingel_manti.png" },
      { name: "Tepsi Mantı", price: "600 TL", desc: "", img: "/tepsi_manti.png" },
    ]
  },
  {
    category: "Kayseri Yağlaması",
    id: "yaglamalar",
    items: [
      { name: "Kayseri Yağlaması", price: "550 TL", extraPrice: "1,5 Porsiyon: 700 TL", desc: "Biber turşusu, salata, yoğurt ile", img: "/kayseri_yaglamasi.png", containerClass: "h-64 md:h-72 lg:h-[20rem] xl:h-[22rem]", imgPosition: "object-[center_60%]" },
    ]
  },
  {
    category: "Yan Ürünler",
    id: "yan-urunler",
    items: [
      { name: "İçli Köfte (Porsiyon)", price: "250 TL", extraPrice: "Adet: 150 TL", desc: "Kızartılmış", img: "/icli_kofte.png", containerClass: "h-64 md:h-72 lg:h-[20rem] xl:h-[22rem]", imgPosition: "object-center" },
      { name: "Zeytinyağlı Yaprak Sarma", price: "250 TL", desc: "", img: "/zeytinyagli_yaprak_sarma.png", containerClass: "h-64 md:h-72 lg:h-[20rem] xl:h-[22rem]", imgPosition: "object-[center_20%]" },
      { name: "Çiğ Köfte (Porsiyon)", price: "250 TL", desc: "", img: "/cigkofte_gorsel.png", containerClass: "h-64 md:h-72 lg:h-[20rem] xl:h-[22rem]", imgPosition: "object-center" },
    ]
  },
  {
    category: "Tatlılar",
    id: "tatlilar",
    items: [
      { name: "Çıtır Tatlı", price: "300 TL", desc: "", img: "/tatli.png", imgPosition: "object-center" },
    ]
  },
  {
    category: "Sıcak İçecekler",
    id: "sicak-icecekler",
    items: [
      { name: "Çay", price: "30 TL", desc: "" },
      { name: "Türk Kahvesi", price: "100 TL", desc: "" },
    ]
  }
];

export default function MenuPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // 1. Kategoriler için büyük harf slider yukarı kayma efekti
      gsap.utils.toArray<HTMLHeadingElement>(".menu-header").forEach(header => {
        gsap.fromTo(header, 
          { y: 80, opacity: 0 }, 
          { 
            y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
            scrollTrigger: {
              trigger: header,
              start: "top 90%",
            }
          }
        );
      });

      // 2. Her bir kategorideki menu kartlarının (grid) staggered açılması
      gsap.utils.toArray<HTMLDivElement>(".menu-category").forEach(categoryDiv => {
        const items = categoryDiv.querySelectorAll(".menu-item");
        if (items.length > 0) {
          gsap.fromTo(items, 
            { y: 50, opacity: 0 }, 
            {
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              stagger: 0.15, 
              ease: "power2.out",
              scrollTrigger: {
                trigger: categoryDiv,
                start: "top 85%",
              }
            }
          );
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Handle initial load scroll based on hash
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 120,
            behavior: "smooth"
          });
        }
      }, 300); // Allow time for elements to render
    }
  }, []);

  const scrollToCategory = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // offset for the sticky menu
        behavior: "smooth"
      });
    }
  };

  return (
    <div ref={containerRef} className="bg-[#F9F9F6] min-h-screen pb-32 pt-28 texture-bg">
      {/* 1. Page Title */}
      <div className="container mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#2A3B2C] mb-8">Menü</h1>
        <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto italic font-serif">
          Nesilden nesile aktarılan ustalıkla, en doğal taze malzemelerden hazırlanan klasik tatlarımız.
        </p>
      </div>

      {/* 2. Sticky Category Navigation */}
      <div className="sticky top-[86px] z-40 bg-[#F9F9F6]/95 backdrop-blur-md border-y border-[#2A3B2C]/10 py-5 transition-shadow shadow-sm">
        <div className="container mx-auto overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          <nav className="flex items-center space-x-6 sm:space-x-8 md:space-x-12 px-2 sm:px-6 justify-center whitespace-nowrap min-w-max md:min-w-0 w-full mx-auto">
            {menuData
              .filter(cat => cat.id !== "yan-urunler" && cat.id !== "sicak-icecekler")
              .map((cat, index, filteredArray) => (
              <a 
                key={cat.id} 
                href={`#${cat.id}`}
                onClick={(e) => scrollToCategory(cat.id, e)}
                className={`text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-[#2A3B2C] hover:text-[#8B5A2B] transition-colors ${
                    index === filteredArray.length - 1 ? "pr-8 md:pr-0" : ""
                }`}
              >
                {cat.category}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* 3. Categories Content */}
      <div className="container mx-auto px-6 mt-16 md:mt-24 space-y-32 md:space-y-48">
        {menuData.map((category, catIndex) => (
          <section key={category.id} id={category.id} className="menu-category pt-8">
            <h2 className="menu-header text-5xl md:text-7xl lg:text-8xl font-serif text-[#E8D1B5] mb-12 md:mb-16 text-center md:text-left drop-shadow-sm opacity-0">
              {category.category}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-20 gap-x-4 md:gap-x-12">
              {category.items.map((item, idx) => (
                <div key={idx} className="menu-item flex flex-col group opacity-0">
                  {/* Organic Shape Menu Image */}
                  {item.img && (
                  <div className={`relative w-full mb-4 md:mb-6 overflow-hidden clip-rounded-top shadow-lg ${item.containerClass || 'h-[12rem] sm:h-[18rem] md:h-[22rem] lg:h-[26rem] xl:h-[28rem]'}`}>
                     <Image 
                       src={item.img} 
                       alt={item.name} 
                       fill
                       priority={catIndex === 0 && idx < 4}
                       sizes="(max-width: 768px) 50vw, 33vw"
                       className={`object-cover transition-transform duration-700 group-hover:scale-105 ${item.imgPosition || 'object-[center_35%]'}`}
                     />
                  </div>
                  )}

                  <div className="flex items-start sm:items-baseline justify-between mb-3 w-full gap-3 sm:gap-0">
                    <h3 className="text-base sm:text-xl md:text-2xl font-serif text-[#2A3B2C] group-hover:text-[#8B5A2B] transition-colors leading-tight">
                      {item.name}
                    </h3>
                    
                    {/* Dots Separator */}
                    <div className="hidden sm:block flex-grow mx-4 border-b-[2px] border-dotted border-[#2A3B2C]/30 relative top-[-6px] min-w-[20px]"></div>
                    
                    <span className="text-base sm:text-xl md:text-2xl font-serif text-[#2A3B2C] group-hover:text-[#8B5A2B] transition-colors whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>

                  {item.extraPrice && (
                    <span className="text-sm sm:text-base md:text-lg font-serif italic text-stone-600 text-right">
                      {item.extraPrice}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
